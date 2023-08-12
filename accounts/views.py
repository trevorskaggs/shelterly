import csv
import io

from django.contrib.auth import get_user_model, login
from django.contrib.sites.models import Site
from django.core.mail import send_mail
from django.apps import apps
from django.db import IntegrityError
from django.template.loader import render_to_string
from knox.views import LoginView as KnoxLoginView
from rest_framework import generics, permissions, response, status, viewsets
from rest_framework.decorators import action
from rest_framework.authtoken.serializers import AuthTokenSerializer

from accounts.models import ShelterlyUser, Organization
from accounts.serializers import UserSerializer, OrganizationSerializer

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
        return self.request.user


# Provides view for User API calls.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    @action(detail=False, methods=["post"])
    def upload_csv(self, request):
        if self.request.FILES.get('user_csv'):
            user_csv = self.request.FILES['user_csv']
            reader = csv.DictReader(io.StringIO(user_csv.read().decode('utf-8')), delimiter=',', quotechar='|', fieldnames=['first_name','last_name','cell_phone','email','agency_id', 'is_admin'])
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
                        is_superuser=item['is_admin'],
                    )
                    user_ids.append(user.id)
                except IntegrityError:
                    print('failed for {0}'.format(item))
                    pass
        return response.Response(UserSerializer(ShelterlyUser.objects.filter(id__in=user_ids), many=True).data, status=201)

    def perform_create(self, serializer):
        if serializer.is_valid():
            if self.request.user.is_superuser or self.request.user.user_perms:
                serializer.save()
    
    def perform_update(self, serializer):
        if serializer.is_valid():
            if self.request.user.is_superuser or self.request.user.user_perms:
                user = serializer.save()
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
    def perform_destroy(self, instance):
        if self.request.user.is_superuser or self.request.user.user_perms:
            instance.delete()

# Provides view for User API calls.
class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrganizationSerializer
