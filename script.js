const API_URL = "https://gym-backend-nijm.onrender.com"; // MUDAR ISSO DEPOIS DO DEPLOY

// --- FUNÇÕES DE AUTH ---

async function fazerCadastro() {
    console.log("Iniciando cadastro...");

    const nome = document.getElementById("nomeCadastro").value;
    const email = document.getElementById("emailCadastro").value;
    const senha = document.getElementById("senhaCadastro").value;

    // Validação simples
    if (!nome || !email || !senha) {
        return alert("Por favor, preencha todos os campos!");
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Cadastro realizado com sucesso! Agora faça login.");
            window.location.href = "index.html"; // Manda para a tela de login
        } else {
            alert("Erro ao cadastrar: " + (data.error || "Erro desconhecido"));
        }
    } catch (error) {
        console.error("Erro de conexão:", error);
        alert("Erro ao conectar com o servidor. Verifique se o Back-end está rodando.");
    }
}

async function fazerLogin() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem("usuario", JSON.stringify(data.user));
        window.location.href = "dashboard.html";
    } else {
        alert(data.error);
    }
}

function verificarAuth() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
        window.location.href = "index.html";
    } else {
        document.getElementById("nomeUsuario").innerText = usuario.nome;
        carregarTreinos();
    }
}

function logout() {
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
}

// --- FUNÇÕES DE CRUD DE TREINOS ---

async function carregarTreinos() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const response = await fetch(`${API_URL}/treinos/${usuario.id}`);
    const treinos = await response.json();
    
    const lista = document.getElementById("listaTreinos");
    lista.innerHTML = "";

    treinos.forEach(t => {
        lista.innerHTML += `
            <li>
                <strong>${t.exercicio}</strong>: ${t.series}x${t.repeticoes} - ${t.carga}
                <button onclick="deletarTreino('${t.id}')" class="btn-delete">X</button>
            </li>
        `;
    });
}

async function adicionarTreino() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const exercicio = document.getElementById("exercicio").value;
    const series = document.getElementById("series").value;
    const reps = document.getElementById("reps").value;
    const carga = document.getElementById("carga").value;

    await fetch(`${API_URL}/treinos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            usuario_id: usuario.id, exercicio, series, repeticoes: reps, carga 
        })
    });

    carregarTreinos();
}

async function deletarTreino(id) {
    if(confirm("Tem certeza?")) {
        await fetch(`${API_URL}/treinos/${id}`, { method: "DELETE" });
        carregarTreinos();
    }
}