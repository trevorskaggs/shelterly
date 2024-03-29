from datetime import datetime
from django.core.mail import send_mail
from django.template.loader import render_to_string
from rest_framework import permissions, viewsets

from accounts.models import ShelterlyUser
from incident.models import Incident, Organization
from incident.serializers import IncidentSerializer, OrganizationSerializer


# Provides view for User API calls.
class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = IncidentSerializer

    def get_queryset(self):
        queryset = Incident.objects.all()

        if self.request.GET.get('incident'):
            queryset = queryset.filter(slug=self.request.GET.get('incident'))

        if self.request.GET.get('organization_slug'):
            queryset = queryset.filter(organization__slug=self.request.GET.get('organization_slug'))

        return queryset

    def perform_create(self, serializer):
        if serializer.is_valid():

            # Only create incident if user is an Admin.
            if self.request.user.is_superuser or self.request.user.perms.filter(organization=self.request.data.get('organization'))[0].incident_perms:
                inc = serializer.save()
                #Check if Incident is a non-training incident, if so, email all admins a notification of creation.
                if not inc.training:
                    emails = [user.email for user in ShelterlyUser.objects.filter(is_superuser=True)]
                    message_data = {
                            'user_email': self.request.user.email,
                            'organization_name': inc.organization.name,
                            'organization_slug': inc.organization.slug,
                            'incident_name': inc.name,
                            'incident_slug': inc.slug
                    }
                    send_mail(
                        # title:
                        "%s has started a New Incident: %s!" % (inc.organization.name, inc.name),
                        # message:
                        render_to_string(
                            'new_incident_email.txt',
                            message_data
                        ).strip(),
                        # from:
                        "DoNotReply@shelterly.org",
                        # to:
                        emails,
                        fail_silently=False,
                        html_message = render_to_string(
                            'new_incident_email.html',
                            message_data
                        ).strip()
                    )


    def perform_update(self, serializer):
        if serializer.is_valid():

            # Only create incident if user is an Admin.
            if self.request.user.is_superuser or self.request.user.perms.filter(organization=self.request.data.get('organization'))[0].incident_perms:
                incident = serializer.save()

                # Open/close incident.
                if self.request.data.get('change_lock'):
                    if incident.end_time:
                        incident.end_time = None
                    else:
                        incident.end_time = datetime.now()
                    incident.save()

# Provides view for User API calls.
class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        queryset = Organization.objects.filter(id__in=self.request.user.organizations.all())

        if self.request.GET.get('slug'):
            queryset = queryset.filter(slug=self.request.GET.get('slug'))

        return queryset
