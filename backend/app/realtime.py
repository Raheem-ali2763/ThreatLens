import asyncio
import threading
from fastapi import WebSocket

clients = set()
lock = threading.Lock()


async def connect(websocket: WebSocket):
    await websocket.accept()

    with lock:
        clients.add((websocket, asyncio.get_running_loop()))


def disconnect(websocket: WebSocket):
    with lock:
        clients_copy = list(clients)

        for item in clients_copy:
            if item[0] is websocket:
                clients.discard(item)


def broadcast_sync(message: dict):
    with lock:
        connections = list(clients)

    dead = []

    for websocket, loop in connections:
        try:
            if loop.is_closed():
                dead.append((websocket, loop))
                continue

            asyncio.run_coroutine_threadsafe(
                websocket.send_json(message),
                loop
            )

        except Exception:
            dead.append((websocket, loop))

    if dead:
        with lock:
            for item in dead:
                clients.discard(item)


async def broadcast(message: dict):
    broadcast_sync(message)
