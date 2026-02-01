function carregarDashboard() {
    carregarAgentes();
    carregarEstatisticas();
}

// ===============================
// AGENTES ONLINE / OFFLINE
// ===============================
function carregarAgentes() {
    const token = localStorage.getItem("token");
    const empresaId = localStorage.getItem("empresa_id");

    if (!token || !empresaId) {
        window.location.href = "/login.html";
        return;
    }

    fetch(`https://api.all-multiagente.com.br/supervisor/agentes-online/${empresaId}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar agentes");
        return res.json();
    })
    .then(data => {
        const tbody = document.getElementById("lista-agentes");
        tbody.innerHTML = "";

        data.agentes.forEach(a => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${a.nome}</td>
                <td>${a.email || "-"}</td>
                <td>
                    <span class="badge ${a.online ? "bg-success" : "bg-secondary"}">
                        ${a.online ? "ONLINE" : "OFFLINE"}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(err => {
        console.error("Erro ao carregar agentes:", err);
    });
}

// ===============================
// ESTATÍSTICAS
// ===============================
function carregarEstatisticas() {
    const token = localStorage.getItem("token");
    const empresaId = localStorage.getItem("empresa_id");

    fetch(`https://api.all-multiagente.com.br/supervisor/estatisticas/${empresaId}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("qtd-fila").innerText = data.fila;
        document.getElementById("qtd-atendimento").innerText = data.andamento;
        document.getElementById("qtd-finalizados").innerText = data.finalizados;
    });
}

// ===============================
// AUTO REFRESH
// ===============================
carregarDashboard();
setInterval(carregarDashboard, 10000);

