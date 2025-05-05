import csv
import io
from datetime import datetime

from django.contrib.auth import get_user_model, login
from django.contrib.sites.models import Site
from django.core.mail import send_mail
from django.apps import apps
from django.db import IntegrityError
from django.template.loader import render_to_string
from knox.views import LoginView as KnoxLoginView
from rest_framework import generics, permissions, response, status, exceptions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.authtoken.serializers import AuthTokenSerializer

from accounts.models import ShelterlyUser, ShelterlyUserOrg
from accounts.serializers import UserSerializer, SecureUserSerializer
from incident.models import Incident, Organization, TemporaryAccess

User = get_user_model()


class LoginView(KnoxLoginView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = AuthTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return super(LoginView, self).post(request, format=None)


# Provides user auth view.
class UserAuth(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = UserSerializer

    def get_object(self):
        # Fail check if the incident is closed and the user doesn't have incident perms or superuser access.
        if self.request.GET.get('incident', False) and Incident.objects.get(id=self.request.GET.get('incident', False)).end_time and not self.request.user.is_superuser and not self.request.user.perms.filter(organization=self.request.GET.get('organization'))[0].incident_perms:
            raise ValidationError(detail='Incident is closed.')
        return self.request.user

class CreateUserMixin(object):
    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except exceptions.ValidationError as exc:
            serializer = self.get_serializer(data=request.data)
            user = ShelterlyUser.objects.get(email=request.data.get('email'))
            user.organizations.add(Organization.objects.get(id=request.data.get('organization')))
            ShelterlyUserOrg.objects.filter(user=user, organization=Organization.objects.get(id=request.data.get('organization'))).update(access_expires_at=request.data.get('access_expires_at', None), user_perms=request.data.get('user_perms', False), incident_perms=request.data.get('incident_perms', False))
            serializer.is_valid()
            return response.Response(serializer.data, status=status.HTTP_201_CREATED)

# Provides view for User API calls.
class UserViewSet(CreateUserMixin, viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    secure_serializer_class = SecureUserSerializer

    def get_serializer_class(self):
        if self.request.GET.get('secure', '') == 'true':
            if hasattr(self, 'secure_serializer_class'):
                return self.secure_serializer_class

        return super(UserViewSet, self).get_serializer_class()

    def get_queryset(self):
        queryset = User.objects.all()
        if self.request.GET.get('organization'):
            queryset = queryset.filter(organizations=self.request.GET.get('organization')).distinct()
        elif self.request.GET.get('exclude_organization'):
            queryset = queryset.exclude(organizations=self.request.GET.get('exclude_organization'))

        if self.request.GET.get('vet') == 'true':
            queryset = queryset.exclude(is_superuser=True).filter(perms__organization=self.request.GET.get('organization'), perms__vet_perms=True)
    
        return queryset

    @action(detail=False, methods=["post"])
    def upload_csv(self, request):
        if self.request.FILES.get('user_csv'):
            org_slug = self.request.POST.get('organization')
            user_csv = self.request.FILES['user_csv']
            reader = csv.DictReader(io.StringIO(user_csv.read().decode('utf-8')), delimiter=',', quotechar='|', fieldnames=['first_name','last_name','cell_phone','email','agency_id','is_admin'])
            # skip first line w/ header info
            next(reader)
            a = list(reader)
            user_ids = []

            for item in a:
                try:
                    user = ShelterlyUser.objects.create_user(
                        first_name=item['first_name'],
                        last_name=item['last_name'],
                        email=item['email'],
                        cell_phone=item['cell_phone'].replace('-', '').replace('(', '').replace(')', ''),
                        username=item['email'],
                        password=item['last_name'] + '1',
                        is_staff=item['is_admin'],
                    )
                    user.organizations.add(Organization.objects.get(slug=org_slug))
                    user_ids.append(user.id)
                except IntegrityError:
                    print('failed for {0}'.format(item))
                    if ShelterlyUser.objects.filter(email=item['email']).exists():
                        print('attempting to add to Organization ' + org_slug)
                        ShelterlyUser.objects.get(email=item['email']).organizations.add(Organization.objects.get(slug=org_slug))
                    pass
        return response.Response(UserSerializer(ShelterlyUser.objects.filter(id__in=user_ids), many=True).data, status=201)

    def perform_create(self, serializer):
        if serializer.is_valid():
            # Clean phone field.
            serializer.validated_data['cell_phone'] = ''.join(char for char in serializer.validated_data.get('cell_phone', '') if char.isdigit())

            if self.request.user.is_superuser or self.request.user.perms.filter(organization=self.request.data.get('organization'))[0].user_perms:
                user = serializer.save()
                org = Organization.objects.get(id=self.request.data.get('organization'))
                user.organizations.add(org)

                #Email Organization User Management Team
                new_user_notification(user, org, serializer.context['request'].user)

                ShelterlyUserOrg.objects.filter(user=user, organization=Organization.objects.get(id=self.request.data.get('organization'))).update(access_expires_at=self.request.data.get('access_expires_at', None), user_perms=self.request.data.get('user_perms', False), incident_perms=self.request.data.get('incident_perms', False), vet_perms=self.request.data.get('vet_perms', False))

    def perform_update(self, serializer):
        if serializer.is_valid():
            # Clean phone field if present.
            if serializer.validated_data.get('cell_phone', False):
                serializer.validated_data['cell_phone'] = ''.join(char for char in serializer.validated_data.get('cell_phone', '') if char.isdigit())
            perms = self.request.user.perms.filter(organization=self.request.data.get('organization'))
            if self.request.user.is_superuser or (perms and perms[0].user_perms):
                user = serializer.save()
                if self.request.data.get('organization') not in user.organizations.all().values_list('id', flat=True):
                    org = Organization.objects.get(id=self.request.data.get('organization'))
                    user.organizations.add(org)
                    new_user_notification(user, org, serializer.context['request'].user)

                if self.request.data.get('reset_password'):
                    ResetPasswordToken = apps.get_model('django_rest_passwordreset', 'ResetPasswordToken')
                    token = ResetPasswordToken.objects.create(
                        user=user,
                    )

                    # Send email here.
                    send_mail(
                        # title:
                        "Password Reset for Shelterly",
                        # message:
                        render_to_string(
                            'password_reset_email.txt',
                            {
                            'site': Site.objects.get_current(),
                            'token': token.key,
                            }
                        ).strip(),
                        # from:
                        "DoNotReply@shelterly.org",
                        # to:
                        [user.email],
                        fail_silently=False,
                        html_message = render_to_string(
                            'password_reset_email.html',
                            {
                            'site': Site.objects.get_current(),
                            'token': token.key,
                            }
                        ).strip()
                    )
                else:
                    ShelterlyUserOrg.objects.filter(user=user, organization=self.request.data.get('organization')).update(access_expires_at=self.request.data.get('access_expires_at', None), user_perms=self.request.data.get('user_perms', False), incident_perms=self.request.data.get('incident_perms', False), vet_perms=self.request.data.get('vet_perms', False))
            elif self.request.data.get('temp_access_id'):
                user = serializer.save()
                for access in TemporaryAccess.objects.filter(id=self.request.data.get('temp_access_id'), link_expires_at__gte=datetime.today()):
                    if self.request.data.get('organization') not in user.organizations.all().values_list('id', flat=True):
                        user.organizations.add(Organization.objects.get(id=self.request.data.get('organization')))
                    ShelterlyUserOrg.objects.filter(user=user, organization=self.request.data.get('organization')).update(access_expires_at=access.access_expires_at)


    def perform_destroy(self, instance):
        org_id = self.request.GET.get('organization')
        perms = self.request.user.perms.get(organization=org_id)
        if self.request.user.is_superuser or perms.user_perms:
            instance.organizations.remove(Organization.objects.get(id=org_id))
            # instance.delete()


def new_user_notification(user, org, admin_user):
    email_dict = {
        'user_first_name': user.first_name,
        'user_last_name': user.last_name,
        'user_email': user.email,
        'org_name': org.name,
        'admin_email': admin_user.email,
    }
    send_emails = [suo.user.email for suo in ShelterlyUserOrg.objects.filter(organization=org, user_perms=True)]
    #send_emails.append(user.email)
    send_mail(
        # title:
        "New User (%s, %s - %s) added to %s by %s." % (user.last_name, user.first_name, user.email, org.name, admin_user.email),
        # message:
        render_to_string(
            'new_user_notification.txt',
            email_dict
        ).strip(),
        # from:
        "DoNotReply@shelterly.org",
        # to:
        send_emails,
        fail_silently=False,
        html_message = render_to_string(
            'new_user_notification.html',
            email_dict
        ).strip()
    )