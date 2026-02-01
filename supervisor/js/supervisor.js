const API = "https://api.all-multiagente.com.br";
const empresaId = localStorage.getItem("empresa_id");
const userId = localStorage.getItem("user_id");

/* ============================
   DATA (segura, sem quebrar tela)
============================ */
function formatarDataBrasil(dataUtc) {
  if (!dataUtc) return "-";

  try {
    const iso = dataUtc.includes("T")
      ? dataUtc
      : dataUtc.replace(" ", "T") + "Z";

    const data = new Date(iso);

    if (isNaN(data.getTime())) return "-";

    return data.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour12: false
    });
  } catch {
    return "-";
  }
}

/* ============================
   DASHBOARD
============================ */
async function carregarEstatisticas() {
  const r = await fetch(`${API}/supervisor/estatisticas/${empresaId}`);
  const d = await r.json();

  document.getElementById("fila").innerText = d.fila ?? 0;
  document.getElementById("andamento").innerText = d.andamento ?? 0;
  document.getElementById("finalizados").innerText = d.finalizados ?? 0;
}

/* ============================
   ANDAMENTO
============================ */
async function carregarAndamento() {
  const r = await fetch(`${API}/supervisor/andamento/${empresaId}`);
  const d = await r.json();

  const lista = document.getElementById("listaAndamento");
  lista.innerHTML = "";

  if (!d.andamento || d.andamento.length === 0) {
    lista.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted">
          Nenhum atendimento em andamento
        </td>
      </tr>`;
    return;
  }

  d.andamento.forEach(a => {
    lista.innerHTML += `
      <tr>
        <td>${a.cliente}</td>
        <td>${a.agente || "-"}</td>
        <td>${formatarDataBrasil(a.inicio)}</td>
        <td>
          <button class="btn btn-sm btn-danger"
                  onclick="finalizar(${a.id})">
            Finalizar
          </button>
        </td>
      </tr>
    `;
  });
}

/* ============================
   FILA
============================ */
async function carregarFila() {
  const r = await fetch(`${API}/supervisor/fila/${empresaId}`);
  const d = await r.json();

  const lista = document.getElementById("listaFila");
  lista.innerHTML = "";

  if (!d.fila || d.fila.length === 0) {
    lista.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-muted">
          Fila vazia
        </td>
      </tr>`;
    return;
  }

  d.fila.forEach(f => {
    lista.innerHTML += `
      <tr>
        <td>${f.cliente}</td>
        <td>${formatarDataBrasil(f.entrada_fila)}</td>
        <td>
          <button class="btn btn-sm btn-primary"
                  onclick="assumir(${f.id})">
            Assumir
          </button>
        </td>
      </tr>
    `;
  });
}

/* ============================
   AGENTES
============================ */
async function carregarAgentes() {
  const r = await fetch(`${API}/supervisor/agentes-online/${empresaId}`);
  const d = await r.json();

  const lista = document.getElementById("listaAgentes");
  lista.innerHTML = "";

  d.agentes.forEach(a => {
    lista.innerHTML += `
      <tr>
        <td>${a.nome}</td>
        <td>
          <span class="badge ${a.online ? "bg-success" : "bg-secondary"}">
            ${a.online ? "ONLINE" : "OFFLINE"}
          </span>
        </td>
      </tr>
    `;
  });
}

/* ============================
   HISTÓRICO
============================ */
async function carregarHistorico() {
  const r = await fetch(`${API}/supervisor/historico/${empresaId}`);
  const d = await r.json();

  const lista = document.getElementById("listaHistorico");
  lista.innerHTML = "";

  if (!d.historico || d.historico.length === 0) {
    lista.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted">
          Nenhum atendimento finalizado
        </td>
      </tr>`;
    return;
  }

  d.historico.forEach(h => {
    lista.innerHTML += `
      <tr>
        <td>${h.cliente}</td>
        <td>${h.agente || "-"}</td>
        <td>${formatarDataBrasil(h.inicio)}</td>
        <td>${formatarDataBrasil(h.fim)}</td>
      </tr>
    `;
  });
}

/* ============================
   AÇÕES
============================ */
async function finalizar(id) {
  await fetch(`${API}/supervisor/atendimento/finalizar/${id}`, {
    method: "PUT"
  });
  atualizarTudo();
}

async function assumir(id) {
  await fetch(`${API}/supervisor/atendimento/assumir/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ supervisor_id: userId })
  });
  atualizarTudo();
}

/* ============================
   ATUALIZAÇÃO GERAL
============================ */
function atualizarTudo() {
  carregarEstatisticas();
  carregarFila();
  carregarAndamento();
  carregarAgentes();
  carregarHistorico();
}

// Auto-refresh
setInterval(atualizarTudo, 5000);
atualizarTudo();
