async function updateRobotStatus() {
    const statusElement = document.getElementById("robotStatus");
    const lastSeenElement = document.getElementById("lastSeen");

    try {
        const response = await fetch("/api/robot/status");

        if (!response.ok) {
            throw new Error("Error HTTP " + response.status);
        }

        const data = await response.json();

        if (data.online === true) {
            statusElement.textContent = "CONECTADO";
            statusElement.className = "status-online";
        } else {
            statusElement.textContent = "DESCONECTADO";
            statusElement.className = "status-offline";
        }

        if (data.last_seen) {
            lastSeenElement.textContent = data.last_seen;
        } else {
            lastSeenElement.textContent = "Sin conexión registrada";
        }

    } catch (error) {
        statusElement.textContent = "ERROR DE CONEXIÓN";
        statusElement.className = "status-error";
        lastSeenElement.textContent = "---";

        console.error("Error comprobando el estado del robot:", error);
    }
}


updateRobotStatus();

setInterval(updateRobotStatus, 3000);
