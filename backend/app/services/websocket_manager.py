from collections import defaultdict
from typing import Dict
from uuid import UUID

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[UUID, Dict[UUID, WebSocket]] = defaultdict(dict)

    async def connect(
        self,
        conversation_id: UUID,
        user_id: UUID,
        websocket: WebSocket,
    ):
        await websocket.accept()
        self.active_connections[conversation_id][user_id] = websocket

    def disconnect(
        self,
        conversation_id: UUID,
        user_id: UUID,
    ):
        if conversation_id not in self.active_connections:
            return False

        removed = self.active_connections[conversation_id].pop(user_id, None)

        if not self.active_connections[conversation_id]:
            self.active_connections.pop(conversation_id)

        return removed is not None

    async def send_to_user(
        self,
        conversation_id: UUID,
        user_id: UUID,
        message: dict,
    ):
        websocket = self.active_connections.get(
            conversation_id,
            {},
        ).get(user_id)

        websocket = self.active_connections.get(
            conversation_id,
            {},
        ).get(user_id)

        if not websocket:
            return

        try:
            await websocket.send_json(message)
        except Exception:
            self.disconnect(conversation_id, user_id)

    async def broadcast(
        self,
        conversation_id: UUID,
        message: dict,
    ):
        if conversation_id not in self.active_connections:
            return

        disconnected = []

        for user_id, websocket in self.active_connections[conversation_id].items():
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(user_id)

        for user_id in disconnected:
            self.disconnect(conversation_id, user_id)

    async def broadcast_except_sender(
        self,
        conversation_id: UUID,
        sender_id: UUID,
        message: dict,
    ):
        if conversation_id not in self.active_connections:
            return

        disconnected = []

        for user_id, websocket in self.active_connections[conversation_id].items():
            if user_id == sender_id:
                continue

            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(user_id)

        for user_id in disconnected:
            self.disconnect(conversation_id, user_id)

    def is_connected(
        self,
        conversation_id: UUID,
        user_id: UUID,
    ) -> bool:
        return (
            conversation_id in self.active_connections
            and user_id in self.active_connections[conversation_id]
        )

    def get_connected_users(
        self,
        conversation_id: UUID,
    ) -> list[UUID]:
        if conversation_id not in self.active_connections:
            return []

        return list(self.active_connections[conversation_id].keys())

    def get_connection_count(
        self,
        conversation_id: UUID,
    ) -> int:

        if conversation_id not in self.active_connections:
            return 0

        return len(self.active_connections[conversation_id])


manager = ConnectionManager()
