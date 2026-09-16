from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.realtime import connect, disconnect

router = APIRouter(tags=["Realtime"])


@router.websocket("/ws/alerts")
async def alerts_websocket(websocket: WebSocket):
    await connect(websocket)

    try:
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "message": "ThreatLens realtime channel connected",
        })

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        disconnect(websocket)

    except Exception:
        disconnect(websocket)
