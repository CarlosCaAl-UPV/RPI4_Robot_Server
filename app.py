import os
import threading

import eventlet
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room

from personal import personal

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")

# En PythonAnywhere con gunicorn/eventlet:
# gunicorn -k eventlet -w 1 --chdir /home/carlosca/webrtc_flask_server_python_client --bind unix:${DOMAIN_SOCKET} app:app
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="eventlet",
)

app.register_blueprint(personal, url_prefix="/web")

VIEWER_ROOM = "viewers"
CAMERA_ROOM = "camera"
ACCESS_TOKEN = "TOKEN"

# ===============================
# Cola de comandos pendientes (modelo "pull")
# ----------------------------------------------------------
# El robot ya no recibe los comandos empujados en tiempo real por un evento
# aparte: los pide él mismo, como respuesta (ack) a cada "robot-telemetry"
# que manda. Solo hay un robot conectado a la vez (CAMERA_ROOM), así que
# basta con una única cola global.
# ===============================
_pending_commands = []
_pending_lock = threading.Lock()

# Eventos (plan 1) por frame_id: el robot no recibe el "pong" de un frame
# hasta que un viewer confirme que lo ha pintado (evento "frame-displayed"
# con ese mismo frame_id). Con la ventana deslizante puede haber varios
# frames esperando confirmación a la vez, por eso ya no es un único evento
# global sino un diccionario.
_frame_display_events = {}


@app.route("/")
def index():
    token = request.args.get("token")
    if token != ACCESS_TOKEN:
        return render_template("login.html")
    return render_template("viewer.html")


@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/health")
def health():
    return {"status": "ok"}


@socketio.on("connect")
def on_connect():
    print(f"[connect] {request.sid}", flush=True)


@socketio.on("disconnect")
def on_disconnect():
    print(f"[disconnect] {request.sid}", flush=True)

    emit(
        "peer-disconnected",
        {"sid": request.sid},
        room=VIEWER_ROOM,
        include_self=False,
    )

    emit(
        "peer-disconnected",
        {"sid": request.sid},
        room=CAMERA_ROOM,
        include_self=False,
    )


@socketio.on("join")
def on_join(data):
    role = (data or {}).get("role")

    if role == "viewer":
        join_room(VIEWER_ROOM)

        print(f"[viewer] {request.sid}", flush=True)

        emit(
            "viewer-ready",
            {"viewerId": request.sid},
            room=CAMERA_ROOM,
        )

        return

    if role == "camera":
        join_room(CAMERA_ROOM)

        print(f"[camera] {request.sid}", flush=True)

        emit(
            "camera-ready",
            {"cameraId": request.sid},
            room=VIEWER_ROOM,
        )

        return

    emit(
        "error-message",
        {"message": "Rol no válido. Usa 'viewer' o 'camera'."},
        room=request.sid,
    )


# ===============================
# Señalización WebRTC (código antiguo, ya NO se usa)
# ----------------------------------------------------------
# El vídeo ahora viaja dentro de "robot-telemetry" en vez de por WebRTC. Se
# deja comentado por si se quisiera recuperar en el futuro.
# ===============================

# @socketio.on("webrtc-offer")
# def on_webrtc_offer(data):
#     target = (data or {}).get("target")
#     if not target:
#         return
#     emit("webrtc-offer", {"sdp": data.get("sdp"), "from": request.sid}, room=target)
#
# @socketio.on("webrtc-answer")
# def on_webrtc_answer(data):
#     target = (data or {}).get("target")
#     if not target:
#         return
#     emit("webrtc-answer", {"sdp": data.get("sdp"), "from": request.sid}, room=target)
#
# @socketio.on("ice-candidate")
# def on_ice_candidate(data):
#     target = (data or {}).get("target")
#     candidate = (data or {}).get("candidate")
#     if not target or not candidate:
#         return
#     emit("ice-candidate", {"candidate": candidate, "from": request.sid}, room=target)


# ===============================
# Comunicación dashboard <-> robot
# ===============================

@socketio.on("robot-command")
def on_robot_command(data):
    command = data or {}

    print(
        f"[robot-command] encolado desde dashboard {request.sid}: {command}",
        flush=True,
    )

    # Ya no se empuja directamente al robot: se encola, y el robot se lo
    # lleva él mismo la próxima vez que mande telemetría (ver más abajo).
    with _pending_lock:
        _pending_commands.append(command)


@socketio.on("robot-status")
def on_robot_status(data):
    status = data or {}

    print(f"[robot-status] {status}", flush=True)

    emit(
        "robot-status",
        status,
        room=VIEWER_ROOM,
    )


@socketio.on("robot-telemetry")
def on_robot_telemetry(data):
    telemetry = data or {}
    frame_id = telemetry.get("frame_id")

    print(
        f"[robot-telemetry] frame_id={frame_id} ultrasonic={telemetry.get('ultrasonic')} "
        f"image_bytes={len(telemetry.get('image') or b'')}",
        flush=True,
    )

    # Reenvía la telemetría (incluida la imagen) a todos los viewers.
    emit(
        "robot-telemetry",
        telemetry,
        room=VIEWER_ROOM,
    )

    # Plan 1: si este mensaje trae imagen, no contestamos al robot hasta que
    # algún viewer confirme que ha terminado de pintar ESTE frame_id
    # concreto (evento "frame-displayed"), o hasta un timeout de seguridad
    # por si no hay ningún viewer conectado / mirando en ese momento.
    if telemetry.get("image") and frame_id is not None:
        event = eventlet.Event()
        _frame_display_events[frame_id] = event
        try:
            event.wait(timeout=8)
        finally:
            _frame_display_events.pop(frame_id, None)

    # Ping-pong: la respuesta (ack) de este mismo mensaje es la forma en que
    # el robot recibe los comandos nuevos. Se vacía la cola al devolverla.
    with _pending_lock:
        commands = _pending_commands.copy()
        _pending_commands.clear()

    return {"commands": commands}


@socketio.on("frame-displayed")
def on_frame_displayed(data):
    frame_id = (data or {}).get("frame_id")
    event = _frame_display_events.get(frame_id)
    if event is not None and not event.ready():
        event.send()


if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "5000"))

    print(f"Servidor en http://{host}:{port}", flush=True)

    socketio.run(
        app,
        host=host,
        port=port,
        debug=True,
        allow_unsafe_werkzeug=True,
    )