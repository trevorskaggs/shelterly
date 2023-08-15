from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from time import sleep
import json
from asgiref.sync import async_to_sync

class WSConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        print("CONNECTION IS NOW OPEN !!")
        print(self.channel_name)
        # async_to_sync(self.channel_layer.group_send)(
        #     "map",
        #     {
        #         "type":"map.newdata",
        #         "text":"test",
        #     },
        # )
        await self.channel_layer.group_add(
            "map",
            self.channel_name
        )
        await self.accept()
        # for i in range(20):      #The logic should be here, this is just an example to test
        #     await self.send(json.dumps({"nom_rapport": "pv"}))
        #     sleep(1)

    async def disconnect(self, message):
        print("CONNECTION IS NOW CLOSED !!")
        await self.channel_layer.group_discard(
            "map",
            self.channel_name
        )
        pass

    async def new_data(self, message):
        print("NEW DATA")
        await self.send(text_data="new data")