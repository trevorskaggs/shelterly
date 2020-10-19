from django.contrib.auth.models import UserManager

class ShelterlyUserManager(UserManager):
    def get_or_create_for_cognito(self, payload):
        cognito_id = payload['sub']
        try:
            return self.get(cognito_id=cognito_id)
        except self.model.DoesNotExist:
            pass

        try:
            user = self.create(
                cognito_id=cognito_id,
                email=payload['email'],
                is_active=True)
        except IntegrityError:
            user = self.get(cognito_id=cognito_id)

        return user
