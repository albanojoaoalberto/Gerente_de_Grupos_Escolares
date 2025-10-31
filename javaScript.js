let alunos = JSON.parse(localStorage.getItem("alunos")) || [];
let gruposGerados = [];

const salvarLocal = () => localStorage.setItem("alunos", JSON.stringify(alunos));

function atualizarLista() {
    const lista = document.getElementById("listaAlunos");
    const contador = document.getElementById("contador");
    if (alunos.length === 0) {
        lista.innerHTML = "<i>Nenhum aluno cadastrado.</i>";
        contador.innerText = "0 estudantes";
        return;
    }

    contador.innerText = `${alunos.length} estudantes`;
    lista.innerHTML = alunos
        .map((a, i) =>
            `<div class="aluno-item">
            <span>${a.numero} - ${a.nome}</span>
            <span class="delete-icon" onclick="removerAluno(${i})">×</span>
          </div>`
        )
        .join("");
}

function removerAluno(index) {
    alunos.splice(index, 1);
    salvarLocal();
    atualizarLista();
}

document.getElementById("btnAdd").onclick = () => {
    const numero = document.getElementById("numero").value.trim();
    const nome = document.getElementById("nome").value.trim();
    if (!numero || !nome) return;

    alunos.push({ numero, nome });
    salvarLocal();
    atualizarLista();

    document.getElementById("numero").value = "";
    document.getElementById("nome").value = "";
};

document.getElementById("btnGerar").onclick = () => {
    const num_integrantes = parseInt(document.getElementById("num_integrantes").value);
    if (isNaN(num_integrantes) || num_integrantes < 2) {
        Swal.fire("Atenção", "Informe o número de integrantes por grupo (mínimo 2).", "warning");
        return;
    }
    if (alunos.length < num_integrantes) {
        Swal.fire("Aviso", "Número insuficiente de estudantes para formar grupos.", "info");
        return;
    }

    const embaralhados = [...alunos].sort(() => Math.random() - 0.5);
    gruposGerados = [];
    for (let i = 0; i < embaralhados.length; i += num_integrantes) {
        gruposGerados.push(embaralhados.slice(i, i + num_integrantes));
    }

    const gruposDiv = document.getElementById("grupos");
    gruposDiv.style.display = "block";

    let html = `<h5>Grupos Gerados (${gruposGerados.length}):</h5><hr>`;
    gruposGerados.forEach((g, i) => {
        html += `<div class="grupo"><strong>Grupo ${i + 1}</strong><br>` +
            g.map(a => `${a.numero} - ${a.nome}`).join("<br>") + "</div>";
    });
    gruposDiv.innerHTML = html;
};

document.getElementById("btnPDF").onclick = async () => {
    if (gruposGerados.length === 0) {
        Swal.fire("Nada a exportar", "Gere os grupos antes de criar o PDF.", "info");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(16);
    doc.text("Relatório de Grupos Escolares", 14, 20);
    doc.setFontSize(11);
    let y = 30;

    gruposGerados.forEach((grupo, i) => {
        doc.setFont("helvetica", "bold");
        doc.text(`Grupo ${i + 1}`, 14, y);
        y += 6;

        // Cabeçalho da tabela
        doc.setFont("helvetica", "bold");
        doc.setFillColor(230, 230, 230);
        doc.rect(14, y, 25, 8, "F");
        doc.rect(39, y, 150, 8, "F");
        doc.text("Nº", 18, y + 5);
        doc.text("Nome Completo", 43, y + 5);
        y += 8;

        doc.setFont("helvetica", "normal");

        grupo.forEach(a => {
            // Quebra de página automática
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            // Células da tabela
            doc.rect(14, y, 25, 8);
            doc.rect(39, y, 150, 8);
            doc.text(a.numero.toString(), 18, y + 5);
            doc.text(a.nome, 43, y + 5);
            y += 8;
        });

        y += 10; // Espaço entre grupos
    });

    doc.save("grupos_escolares.pdf");
};
document.getElementById("btnLimpar").onclick = () => {
    alunos = [];
    gruposGerados = [];
    salvarLocal();
    atualizarLista();
    const gruposDiv = document.getElementById("grupos");
    gruposDiv.innerHTML = "";
    gruposDiv.style.display = "none";
};

atualizarLista();