from channels.routing import ProtocolTypeRouter, URLRouter
# import app.routing
from django.urls import re_path, url
from consumers import WSConsumer
websocket_urlpatterns = [
    re_path(url(r'^ws/canvas_data/'), WSConsumer.as_asgi()),
]
# the websocket will open at 127.0.0.1:8000/ws/<room_name>
application = ProtocolTypeRouter({
    'websocket':
        URLRouter(
            websocket_urlpatterns
        )
    ,
})