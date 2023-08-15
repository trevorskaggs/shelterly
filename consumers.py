from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer

class WSConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.channel_layer.group_add(
            "map",
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, message):
        await self.channel_layer.group_discard(
            "map",
            self.channel_name
        )
        pass

    async def new_data(self, message):
        await self.send(text_data="new data")