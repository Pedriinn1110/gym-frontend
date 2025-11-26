// --- CONFIGURAÇÃO ---
// URL de Produção (Render)
const API_URL = "https://gym-backend-nijm.onrender.com"; // MUDAR ISSO DEPOIS DO DEPLOY
// Para testar localmente, descomente a linha abaixo:
// const API_URL = "http://localhost:3000";

// --- 1. FUNÇÕES DE AUTENTICAÇÃO (LOGIN/CADASTRO) ---

/**
 * Função: fazerCadastro
 * Objetivo: Enviar dados do formulário para a rota /register
 * Acionada pelo botão no arquivo cadastro.html
 */
async function fazerCadastro() {
    console.log("Iniciando processo de cadastro...");

    // Captura os valores dos inputs
    const nome = document.getElementById("nomeCadastro").value;
    const email = document.getElementById("emailCadastro").value;
    const senha = document.getElementById("senhaCadastro").value;

    // Validação básica de campos vazios
    if (!nome || !email || !senha) {
        return alert("Por favor, preencha todos os campos!");
    }

    try {
        // Envia requisição POST para a API
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        // Se o servidor responder com sucesso (Status 200-299)
        if (response.ok) {
            alert("Cadastro realizado! Redirecionando para login...");
            window.location.href = "index.html";
        } else {
            alert("Erro: " + (data.error || "Falha desconhecida"));
        }
    } catch (error) {
        console.error("Erro de rede:", error);
        alert("Não foi possível conectar ao servidor.");
    }
}

/**
 * Função: fazerLogin
 * Objetivo: Autenticar usuário e salvar sessão
 * Acionada pelo arquivo index.html
 */
async function fazerLogin() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!email || !senha) return alert("Preencha e-mail e senha");

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            // Salva os dados do usuário no navegador (Sessão persistente)
            localStorage.setItem("usuario", JSON.stringify(data.user));
            window.location.href = "dashboard.html";
        } else {
            alert("Erro: " + data.error);
        }
    } catch (error) {
        alert("Erro de conexão com a API.");
    }
}

// --- 2. CONTROLE DE SESSÃO E DASHBOARD ---

/**
 * Função: verificarAuth
 * Objetivo: Proteger a rota do dashboard. Se não estiver logado, chuta para o login.
 */
function verificarAuth() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    
    if (!usuario) {
        // Se não tem usuário salvo, redireciona para login
        window.location.href = "index.html";
    } else {
        // Se tem usuário, atualiza o nome na tela e carrega a lista
        const nomeSpan = document.getElementById("nomeUsuario");
        if(nomeSpan) nomeSpan.innerText = usuario.nome;
        carregarTreinos();
    }
}

function logout() {
    localStorage.removeItem("usuario"); // Limpa a sessão
    window.location.href = "index.html"; // Volta para o login
}

// --- 3. FUNÇÕES DE CRUD (TREINOS) ---

/**
 * Função: carregarTreinos (READ)
 * Objetivo: Buscar lista de exercícios do usuário e montar o HTML
 */
async function carregarTreinos() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    
    try {
        const response = await fetch(`${API_URL}/treinos/${usuario.id}`);
        const treinos = await response.json();
        
        const lista = document.getElementById("listaTreinos");
        if(lista) {
            lista.innerHTML = ""; // Limpa a lista antes de renderizar

            // Cria o HTML para cada item retornado do banco
            treinos.forEach(t => {
                lista.innerHTML += `
                    <li>
                        <div>
                            <strong>${t.exercicio}</strong>
                            <span>${t.series} séries x ${t.repeticoes} reps - ${t.carga}</span>
                        </div>
                        <button onclick="deletarTreino('${t.id}')" class="btn-delete">X</button>
                    </li>
                `;
            });
        }
    } catch (error) {
        console.error("Erro ao carregar lista:", error);
    }
}

/**
 * Função: adicionarTreino (CREATE)
 * Objetivo: Enviar novo exercício para o banco
 */
async function adicionarTreino() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    
    // Captura inputs
    const exercicio = document.getElementById("exercicio").value;
    const series = document.getElementById("series").value;
    const reps = document.getElementById("reps").value;
    const carga = document.getElementById("carga").value;

    if(!exercicio) return alert("O nome do exercício é obrigatório");

    await fetch(`${API_URL}/treinos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            usuario_id: usuario.id, exercicio, series, repeticoes: reps, carga 
        })
    });

    // Limpa o formulário após salvar
    document.getElementById("exercicio").value = "";
    document.getElementById("series").value = "";
    document.getElementById("reps").value = "";
    document.getElementById("carga").value = "";

    // Recarrega a lista para mostrar o novo item
    carregarTreinos();
}

/**
 * Função: deletarTreino (DELETE)
 * Objetivo: Apagar exercício do banco
 */
async function deletarTreino(id) {
    if(confirm("Deseja realmente excluir este exercício?")) {
        await fetch(`${API_URL}/treinos/${id}`, { method: "DELETE" });
        carregarTreinos(); // Atualiza a lista visualmente
    }
}