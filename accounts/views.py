from django.contrib.auth import get_user_model, login
from knox.views import LoginView as KnoxLoginView
from rest_framework import generics, permissions, viewsets
from rest_framework.authtoken.serializers import AuthTokenSerializer

from accounts.serializers import UserSerializer

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
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    serializer_class = UserSerializer
