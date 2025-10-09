from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .models import ChatRoom, ChatMessage
from django.contrib.auth.models import AnonymousUser


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs'].get('room_id')
        self.group_name = f'chat_{self.room_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        user = self.scope.get('user', None)
        text = content.get('text')
        if not text:
            return
        # Save message
        room = await database_sync_to_async(ChatRoom.objects.get)(id=self.room_id)
        user_obj = user if user and not isinstance(user, AnonymousUser) else None
        msg = ChatMessage.objects.create(room_id=self.room_id, sender=user_obj, text=text)
        # Broadcast
        await self.channel_layer.group_send(self.group_name, {'type': 'chat.message', 'message': {'id': msg.id, 'text': msg.text, 'sender': str(msg.sender), 'created_at': str(msg.created_at)}})

    async def chat_message(self, event):
        await self.send_json({'type': 'chat.message', 'message': event['message']})
