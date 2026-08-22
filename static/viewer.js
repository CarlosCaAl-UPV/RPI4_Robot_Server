// ==========================================================
// SERVIDOR
// ==========================================================

const remoteImage = document.getElementById("remoteImage");
const statusEl = document.getElementById("status");
const dotEl = document.getElementById("dot");
const serverUrlEl = document.getElementById("serverUrl");

if (serverUrlEl) serverUrlEl.textContent = window.location.origin;

function setStatus(text, kind = "warn") {
  if (statusEl) statusEl.textContent = text;
  if (dotEl) dotEl.className = "dot" + (kind === "ok" ? " ok" : kind === "err" ? " err" : "");
}

console.log("[viewer.js] Archivo cargado correctamente");
setStatus("JavaScript cargado. Conectando Socket.IO...", "warn");

if (typeof io === "undefined") {
  console.error("[Socket.IO] No se ha cargado la librería Socket.IO.");
  setStatus("Error: Socket.IO no se ha cargado", "err");
  throw new Error("Socket.IO no está disponible");
}

const socket = io();

// ==========================================================
// WebRTC (código antiguo, ya NO se usa)
// ----------------------------------------------------------
// El vídeo ahora viaja codificado en H264 dentro de "robot-telemetry" y se
// decodifica más abajo con la WebCodecs API. Se deja este bloque comentado
// por si se quisiera recuperar la vía WebRTC en el futuro.
// ==========================================================

// const remoteVideo = document.getElementById("remoteVideo");
// const peers = new Map();
// const rtcConfig = { iceServers: [ { urls: "stun:stun.l.google.com:19302" } ] };
//
// function waitForIceGatheringComplete(pc) {
//   if (pc.iceGatheringState === "complete") return Promise.resolve();
//   return new Promise((resolve) => {
//     const check = () => {
//       if (pc.iceGatheringState === "complete") {
//         pc.removeEventListener("icegatheringstatechange", check);
//         resolve();
//       }
//     };
//     pc.addEventListener("icegatheringstatechange", check);
//   });
// }
//
// function getPeer(cameraId) {
//   if (peers.has(cameraId)) return peers.get(cameraId);
//
//   const pc = new RTCPeerConnection(rtcConfig);
//   peers.set(cameraId, pc);
//
//   pc.ontrack = (event) => {
//     console.log("[WebRTC] Track recibido:", event);
//     if (remoteVideo) remoteVideo.srcObject = event.streams[0];
//     setStatus("Recibiendo vídeo en tiempo real", "ok");
//   };
//
//   pc.onicecandidate = (event) => {
//     if (event.candidate) {
//       socket.emit("ice-candidate", {
//         target: cameraId,
//         candidate: event.candidate
//       });
//     }
//   };
//
//   pc.onconnectionstatechange = () => {
//     console.log("[WebRTC] Estado:", pc.connectionState);
//     if (pc.connectionState === "connected") setStatus("Conexión establecida", "ok");
//     if (["failed", "disconnected", "closed"].includes(pc.connectionState)) { setStatus(`Estado WebRTC: ${pc.connectionState}`, "err"); }
//   };
//
//   return pc;
// }
//
// socket.on("webrtc-offer", async ({ sdp, from }) => {
//   try {
//     console.log("[WebRTC] Oferta recibida de:", from);
//     const pc = getPeer(from);
//     await pc.setRemoteDescription(new RTCSessionDescription(sdp));
//     const answer = await pc.createAnswer();
//     await pc.setLocalDescription(answer);
//     await waitForIceGatheringComplete(pc);
//     socket.emit("webrtc-answer", {
//       target: from,
//       sdp: pc.localDescription
//     });
//     console.log("[WebRTC] Respuesta enviada a:", from);
//   } catch (err) {
//     console.error("[WebRTC] Error procesando oferta:", err);
//     setStatus("Error procesando oferta WebRTC", "err");
//   }
// });
//
// socket.on("ice-candidate", async ({ candidate, from }) => {
//   try {
//     console.log("[WebRTC] ICE candidate recibido de:", from);
//     const pc = getPeer(from);
//     await pc.addIceCandidate(new RTCIceCandidate(candidate));
//   } catch (err) {
//     console.warn("[WebRTC] Error añadiendo ICE candidate:", err);
//   }
// });

// ==========================================================
// Imagen JPEG por frame (sin H264, sin base64)
// ----------------------------------------------------------
// El robot manda cada frame ya comprimido en JPEG, en binario, dentro de
// "robot-telemetry" (campo "image"). Se muestra directamente en un <img>
// mediante un Blob URL: es el propio navegador quien decodifica y pinta el
// JPEG de forma nativa (la misma ruta ultra optimizada que usa para
// cualquier imagen de una web normal), sin pasar por nuestro código.
// ==========================================================

let lastImageUrl = null;

function handleRawFrame(imageBuffer, frameId) {
  if (!remoteImage) return;

  const blob = new Blob([imageBuffer], { type: "image/jpeg" });
  const url = URL.createObjectURL(blob);
  const previousUrl = lastImageUrl;

  remoteImage.onload = () => {
    if (previousUrl) URL.revokeObjectURL(previousUrl);

    // onload solo garantiza que la imagen se ha decodificado, NO que ya
    // esté pintada en pantalla. Esperamos a dos requestAnimationFrame
    // (técnica estándar para confirmar un pintado real) antes de avisar
    // al servidor de que el frame ya se ve de verdad.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        console.log(`[frame] pintado en pantalla: frame_id=${frameId}`);
        socket.emit("frame-displayed", { frame_id: frameId });
      });
    });
  };
  remoteImage.onerror = () => {
    console.error(`[image] Error mostrando frame_id=${frameId}`);
    URL.revokeObjectURL(url);
  };

  remoteImage.src = url;
  lastImageUrl = url;
}

// ==========================================================
// Estado de conexión (ahora depende solo de Socket.IO, no de WebRTC)
// ----------------------------------------------------------
// "Conectado" cuando el robot (rol "camera") tiene su socket.io activo.
// "Desconectado" en cualquier otro caso: sin conexión al servidor, o
// conectados al servidor pero sin que el robot esté presente.
// ==========================================================

let cameraId = null;
let cameraConnected = false;
let lastTelemetryAt = 0;

const TELEMETRY_TIMEOUT_MS = 8000; // si no llega telemetría en este tiempo, se considera desconectado

function markCameraConnected() {
  cameraConnected = true;
  setStatus("Robot conectado", "ok");
}

function markCameraDisconnected(reason) {
  cameraConnected = false;
  setStatus(reason || "Robot desconectado", "err");
  if (remoteImage) remoteImage.src = "/static/bg.png";
}

setInterval(() => {
  if (cameraConnected && lastTelemetryAt && (Date.now() - lastTelemetryAt > TELEMETRY_TIMEOUT_MS)) {
    markCameraDisconnected("Robot desconectado (sin telemetría)");
  }
}, 2000);

socket.on("connect", () => {
  console.log("[Socket.IO] Conectado:", socket.id);
  setStatus("Conectado al servidor. Esperando al robot...", "warn");
  socket.emit("join", { role: "viewer" });
});
socket.on("disconnect", () => {
  console.log("[Socket.IO] Desconectado");
  markCameraDisconnected("Desconectado del servidor");
});
socket.on("connect_error", (error) => {
  console.error("[Socket.IO] Error de conexión:", error);
  markCameraDisconnected("Error conectando al servidor");
});
socket.on("error-message", ({ message }) => {
  console.error("[Servidor]", message);
  setStatus(message, "err");
});
socket.on("camera-ready", ({ cameraId: id } = {}) => {
  console.log("[Servidor] Robot disponible:", id);
  cameraId = id;
  markCameraConnected();
});

socket.on("robot-error", ({ message }) => {
  console.error("[Robot] Error:", message);
  alert(message);
});

socket.on("peer-disconnected", ({ sid }) => {
  console.log("[Servidor] Peer desconectado:", sid);
  if (sid === cameraId) {
    cameraId = null;
    markCameraDisconnected("Robot desconectado");
  }
});

// ==========================================================
// SERVOMOTORES
// ==========================================================

const servos = [];
const salidas = [];

for (let i = 0; i < 10; i++) {
    servos[i] = document.getElementById(`servo${i}`);
    salidas[i] = document.getElementById(`servo${i}_`);
    servos[i].addEventListener("input", () => { salidas[i].textContent = servos[i].value;});
}

// ==========================================================
// ENTRADAS DE TEXTO
// ==========================================================

const inputs = [];
for (let i = 1; i < 5; i++) {
    inputs[i-1] = document.getElementById(`inp${i}`);
    inputs[i-1].addEventListener("keydown", function(event) {
        if (event.key === "Enter") inputCommand(i);
    });
}

const input_commands = ["listen", "say", "display_text", ""];
function inputCommand(num) {
  const input = document.getElementById(`inp${num}`);
  if (!input) return;
  sendRobotCommand(input_commands[num-1] + " " + input.value);
  input.value = "";
}

// ==========================================================
// KEYBOARD
// ==========================================================

document.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  const key = event.key.toLowerCase();
  if (key === "arrowup") sendRobotCommand("front 0");
  if (key === "arrowdown") sendRobotCommand("back 0");
  if (key === "arrowleft") sendRobotCommand("left 0");
  if (key === "arrowright") sendRobotCommand("right 0");
  if (key === "escape") sendRobotCommand("stop");
});

// ==========================================================
// PANTALLA LED
// ==========================================================

function hex2rgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

const colorPicker = document.getElementById("colorPicker");
const colorButton = document.getElementById("colorButton");

colorPicker.addEventListener("input", () => {
    colorButton.style.backgroundColor = colorPicker.value;
});

colorPicker.addEventListener("change", () => {
    sendRobotCommand("set_color " + hex2rgb(colorPicker.value));
});

function click_led(led) {
  const position = led.dataset.position;
  sendRobotCommand("pixel " + position);
  if(colorPicker.value == "#000001") led.style.backgroundColor = "#CC4488";
  else led.style.backgroundColor = colorPicker.value;
}

const leds = document.querySelectorAll(".led[data-position]");
leds.forEach((led) => { led.addEventListener("click", () => click_led(led)); });

// ==========================================================
// Robot dashboard commands
// ==========================================================

const commandButtons = document.querySelectorAll(".cmd-button[data-command]");

function sendRobotCommand(msg) {
  const message = { msg };
  socket.emit("robot-command", message);
  console.log("[Dashboard] Enviando comando:", message);
}

function handleCommandButtonClick(button) {
  const command = button.dataset.command;
  if(command == "fill") {
      leds.forEach((led) => { click_led(led); });
  } else if(command == "eraser") {
    colorButton.style.backgroundColor = "#000000";
    colorPicker.value = "#000000";
    sendRobotCommand("set_color 0 0 0");
  } else if(command == "rainbow") {
    colorButton.style.backgroundColor = "#CC4488";
    colorPicker.value = "#000001";
    sendRobotCommand("set_color 0 0 1");
  } else if(command == "inp") {
      inputCommand(Number(button.dataset.num));
  }
  else if(command == "send_servo") {
      for (let i = 0; i < 10; i++)
        sendRobotCommand(`servo ${i} ${servos[i].value}`);
  }
  else if (!command) console.warn("[Dashboard] Botón sin data-command:", button);
  else sendRobotCommand(command);
}

commandButtons.forEach((button) => { button.addEventListener("click", () => { handleCommandButtonClick(button); }); });

// ==========================================================
// TELEMETRÍA (ahora incluye también el vídeo)
// ==========================================================

const telemetryBox = document.getElementById("telemetryBox");
const ultrasonic = document.getElementById("ultrasonic");

const colors = {
  CODE: "#FFFF55",   // amarillo brillante
  ROBOT: "#5555FF",  // azul brillante
  USER: "#55FFFF",   // cian brillante
  RPI4: "#FF55FF",   // magenta brillante
  WARN: "#FF5555",   // magenta brillante
  ERROR: "#FF5555",  // rojo brillante
  DEBUG: "#55FF55"   // verde brillante
};

let msgs = "";

socket.on("robot-telemetry", (telemetry) => {
  // console.log("[Robot] Telemetría:", telemetry);

  lastTelemetryAt = Date.now();
  if (!cameraConnected) markCameraConnected();

  ultrasonic.textContent = telemetry["ultrasonic"];
  if (telemetryBox) {
    if (Array.isArray(telemetry.messages)) msgs += telemetry.messages.map(msg => `<p> <span style="color:${colors[msg.role] ?? "#ffffff"}; font-weight:bold;"> ${msg.role.toUpperCase()}: </span>${msg.content}</p>`).join("");
  }
  telemetryBox.innerHTML = msgs;

  if (telemetry.image) {
    handleRawFrame(telemetry.image, telemetry.frame_id);
  }
});
