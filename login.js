// ====================================================================================
// PASSO 1: CONFIGURAÇÃO E INICIALIZAÇÃO DO FIREBASE (COM AUTENTICAÇÃO)
// ====================================================================================

// **SUBSTITUA PELAS SUAS CREDENCIAIS DO FIREBASE**
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth(); // NOVO: Instância de Autenticação

// Funções utilitárias do Firestore
const getDoc = (ref) => ref.get();
const setDoc = (ref, data) => ref.set(data);
// Removida a necessidade de updateDoc e deleteDoc para manter a simplicidade da função original.

// ====================================================================================
// ESTADO GLOBAL (ATUALIZADO PARA FIREBASE AUTH)
// ====================================================================================

// O usuário logado é gerenciado pelo listener do Firebase
let currentFirebaseUser = null; 

// Dados em memória
let contas = [];
let registrosDiarios = [];
let folgasProgramadas = [];
let configuracoes = {
    metaDiariaMinima: 150,
    diasTrabalho: [1, 2, 3, 4, 5] // Segunda a sexta por padrão
};

let mesAtualCalendario = new Date().getMonth();
let anoAtualCalendario = new Date().getFullYear();

// ====================================================================================
// SISTEMA DE MODAIS CUSTOMIZADOS (MANTIDO)
// ====================================================================================

// (Mantenha o código das funções showModal, hideModal, showSuccess, showError, etc., aqui)
function showModal(type, title, message, buttons = null) { /* ... código mantido ... */ }
function hideModal() { /* ... código mantido ... */ }
function handleEscKey(e) { /* ... código mantido ... */ }
// Fechar modal clicando fora
document.getElementById('modalOverlay').addEventListener('click', function(e) { /* ... código mantido ... */ });
function showSuccess(title, message, callback = null) { /* ... código mantido ... */ }
function showError(title, message, callback = null) { /* ... código mantido ... */ }
function showWarning(title, message, callback = null) { /* ... código mantido ... */ }
function showInfo(title, message, callback = null) { /* ... código mantido ... */ }
function showConfirm(title, message, onConfirm, onCancel = null) { /* ... código mantido ... */ }
function showConfirmDanger(title, message, onConfirm, onCancel = null) { /* ... código mantido ... */ }

// ====================================================================================
// FUNÇÕES DE DADOS (USANDO UID DO FIREBASE AUTH)
// ====================================================================================

// Referência do documento de dados do usuário: usa o UID
const getUserDataRef = (collectionName) => {
    const uid = currentFirebaseUser ? currentFirebaseUser.uid : null;
    if (!uid) return null;
    // O caminho é /users/{UID}/{collectionName}
    return db.collection('users').doc(uid).collection(collectionName);
};

// Função para carregar dados do usuário logado (ASSÍNCRONA)
async function carregarDadosUsuario() {
    if (!currentFirebaseUser) return;
    const uid = currentFirebaseUser.uid;

    try {
        console.log(`Carregando dados para o UID: ${uid}`);

        // 1. Carregar/Inicializar Configurações
        const configRef = db.collection('users').doc(uid).collection('config').doc('main');
        const configSnapshot = await getDoc(configRef);
        
        if (configSnapshot.exists) {
            configuracoes = configSnapshot.data();
            console.log('Configurações carregadas.');
        } else {
            // Se as configurações não existirem, inicializa e salva as padrão
            // Isso garante que todo usuário autenticado tenha dados iniciais.
            await setDoc(configRef, configuracoes);
            console.log('Configurações padrão inicializadas e salvas para novo UID.');
        }

        // 2. Carregar Contas, Registros e Folgas
        const contasSnapshot = await getUserDataRef('contas').get();
        contas = contasSnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() }));

        const registrosSnapshot = await getUserDataRef('registrosDiarios').get();
        registrosDiarios = registrosSnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() }));

        const folgasSnapshot = await getUserDataRef('folgasProgramadas').get();
        folgasProgramadas = folgasSnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() }));

        console.log('Todos os dados do usuário carregados com sucesso do Firestore.');
    } catch (error) {
        console.error('Erro ao carregar dados do usuário do Firestore:', error);
        showError('Erro de Carga', `Não foi possível carregar os dados. Verifique a conexão e permissões.<br><small>${error.message}</small>`);
    }
}

// Função para salvar dados do usuário logado (ASSÍNCRONA)
async function salvarDadosUsuario() {
    if (!currentFirebaseUser) return;

    try {
        const batch = db.batch();
        
        // Salvar Configurações
        const configRef = db.collection('users').doc(currentFirebaseUser.uid).collection('config').doc('main');
        batch.set(configRef, configuracoes);
        
        // Função utilitária para salvar subcoleção usando ID como nome do documento
        const prepareCollectionBatch = (collectionName, dataArray) => {
            const ref = getUserDataRef(collectionName);
            if (!ref) return;

            // Para manter a simplicidade, estamos atualizando/criando todos os documentos.
            dataArray.forEach(item => {
                const docRef = ref.doc(String(item.id));
                batch.set(docRef, item);
            });
        };

        prepareCollectionBatch('contas', contas);
        prepareCollectionBatch('registrosDiarios', registrosDiarios);
        prepareCollectionBatch('folgasProgramadas', folgasProgramadas);

        // Executa o batch
        await batch.commit();

        console.log('Dados do usuário salvos com sucesso no Firestore.');
    } catch (error) {
        console.error('Erro ao salvar dados do usuário no Firestore:', error);
        showError('Erro ao Salvar', 'Não foi possível salvar os dados. Tente novamente.');
    }
}

// ====================================================================================
// SISTEMA DE AUTENTICAÇÃO (FIREBASE AUTH)
// ====================================================================================

// Listener que gerencia o estado de login
auth.onAuthStateChanged(async (user) => {
    const telaLogin = document.getElementById('telaLogin');
    const telaPrimeiroAcesso = document.getElementById('telaPrimeiroAcesso');
    const sistemaPrincipal = document.getElementById('sistemaPrincipal');

    if (user) {
        // Usuário logado
        currentFirebaseUser = user;
        console.log(`Usuário Firebase logado: ${user.email} (UID: ${user.uid})`);
        
        // Esconder telas de login/registro e mostrar sistema principal
        telaLogin.style.display = 'none';
        telaPrimeiroAcesso.style.display = 'none';
        sistemaPrincipal.classList.add('logado');
        sistemaPrincipal.style.display = 'block';
        
        // Carregar dados e inicializar UI
        await carregarDadosUsuario();
        inicializarSistema();
        
    } else {
        // Usuário deslogado
        currentFirebaseUser = null;
        console.log('Usuário deslogado.');

        // Mostrar tela de Login
        telaLogin.style.display = 'flex';
        telaPrimeiroAcesso.style.display = 'none';
        sistemaPrincipal.classList.remove('logado');
        sistemaPrincipal.style.display = 'none';
    }
});


function logout() {
    showConfirmDanger('Sair do Sistema', 'Tem certeza que deseja sair do sistema?', () => {
        auth.signOut()
            .then(() => {
                console.log('Usuário deslogado pelo Firebase.');
                // Limpar formulário de login (o onAuthStateChanged gerencia a transição de tela)
                document.getElementById('formLogin').reset();
                mostrarSucessoLogin('Você saiu com sucesso.');
            })
            .catch(error => {
                console.error('Erro ao deslogar:', error);
                showError('Erro ao Deslogar', 'Ocorreu um erro ao tentar sair. Tente novamente.');
            });
    });
}

// AGORA ASSÍNCRONA E USANDO FIREBASE AUTH
function alterarSenha(senhaAtual, novaSenha) {
    if (!currentFirebaseUser) {
        showError('Erro', 'Nenhum usuário logado.');
        return false;
    }
    
    // 1. Re-autenticar o usuário (segurança do Firebase)
    const credential = firebase.auth.EmailAuthProvider.credential(
        currentFirebaseUser.email, 
        senhaAtual
    );

    currentFirebaseUser.reauthenticateWithCredential(credential)
        .then(() => {
            // 2. Alterar senha
            return currentFirebaseUser.updatePassword(novaSenha);
        })
        .then(() => {
            showSuccess('Sucesso!', 'Senha alterada com sucesso!', () => {
                document.getElementById('formAlterarSenha').reset();
            });
        })
        .catch((error) => {
            console.error('Erro ao alterar senha:', error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                showError('Erro de Autenticação', 'Senha atual incorreta!');
            } else if (error.code === 'auth/requires-recent-login') {
                showWarning('Erro de Segurança', 'Por favor, saia e entre novamente antes de tentar alterar a senha. (Requer login recente)');
            } else {
                showError('Erro ao Alterar Senha', `Erro: ${error.message}`);
            }
        });
        
    return true; // Retorna true imediatamente, pois o resultado é assíncrono
}


// Funções para mostrar mensagens de login (MANTIDAS)
function mostrarErroLogin(mensagem) { /* ... código mantido ... */ }
function mostrarSucessoLogin(mensagem) { /* ... código mantido ... */ }
function mostrarErroPrimeiroAcesso(mensagem) { /* ... código mantido ... */ }


// Configurar formulários de login (AJUSTADO PARA FIREBASE AUTH)
function configurarFormularioLogin() {
    const formLogin = document.getElementById('formLogin');
    const formRegistro = document.getElementById('formPrimeiroAcesso'); // Renomeado conceitualmente para Registro

    if (!formLogin) {
        console.error('Formulário de login não encontrado!');
        return;
    }

    // Formulário de login principal (Entrar)
    formLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginUsuario').value.trim(); // AGORA É EMAIL
        const senha = document.getElementById('loginSenha').value.trim();

        if (!email || !senha) {
            mostrarErroLogin('<i class="bi bi-exclamation-triangle me-2"></i>Por favor, informe email e senha!');
            return;
        }

        auth.signInWithEmailAndPassword(email, senha)
            .then((userCredential) => {
                // Login bem-sucedido. O onAuthStateChanged tratará a transição de tela.
                console.log('Login bem-sucedido:', userCredential.user.email);
                mostrarSucessoLogin('<i class="bi bi-check-circle me-2"></i>Login realizado com sucesso!');
                // Limpa o formulário após a transição
                setTimeout(() => formLogin.reset(), 1000); 
            })
            .catch((error) => {
                console.error('Erro de Login:', error.code, error.message);
                
                let mensagem = 'Usuário ou senha inválidos.';
                if (error.code === 'auth/user-not-found') {
                    mensagem = 'Conta não encontrada. Considere <a href="#" onclick="mostrarTelaRegistro();">criar uma conta</a>.';
                } else if (error.code === 'auth/wrong-password') {
                    mensagem = 'Senha incorreta.';
                }
                
                mostrarErroLogin(`<i class="bi bi-x-circle me-2"></i>${mensagem}`);
            });
    });
    
    // Função para alternar para a tela de Registro
    window.mostrarTelaRegistro = function() {
        document.getElementById('telaLogin').style.display = 'none';
        document.getElementById('telaPrimeiroAcesso').style.display = 'flex';
        document.getElementById('formLogin').reset();
    }
    
    // Formulário de Registro (Antigo Primeiro Acesso)
    if (formRegistro) {
        formRegistro.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const novoEmail = document.getElementById('novoUsuario').value.trim(); // AGORA É EMAIL
            const novaSenha = document.getElementById('novaSenhaInicial').value.trim();
            const confirmarSenha = document.getElementById('confirmarSenhaInicial').value.trim();

            if (novaSenha !== confirmarSenha) {
                mostrarErroPrimeiroAcesso('<i class="bi bi-exclamation-triangle me-2"></i>As senhas não coincidem!');
                return;
            }
            if (novaSenha.length < 6) {
                mostrarErroPrimeiroAcesso('<i class="bi bi-exclamation-triangle me-2"></i>A senha deve ter pelo menos 6 caracteres!');
                return;
            }
            // Não precisa de validação de usuário "admin"
            
            // Criar usuário no Firebase Auth
            auth.createUserWithEmailAndPassword(novoEmail, novaSenha)
                .then(async (userCredential) => {
                    const user = userCredential.user;
                    console.log('Usuário criado com sucesso:', user.email);
                    
                    // O onAuthStateChanged será chamado e fará o login e o carregamento/inicialização dos dados.
                    showSuccess('Bem-vindo ao UberFinance!', `Conta ${user.email} criada com sucesso! Você será logado automaticamente.`);
                    // Limpa o formulário após a transição
                    setTimeout(() => formRegistro.reset(), 1000); 
                })
                .catch((error) => {
                    console.error('Erro de Registro:', error.code, error.message);
                    
                    let mensagem = 'Erro ao criar conta. Tente novamente.';
                    if (error.code === 'auth/email-already-in-use') {
                        mensagem = 'Este e-mail já está em uso. Tente <a href="#" onclick="mostrarTelaLogin()">fazer login</a>.';
                    } else if (error.code === 'auth/invalid-email') {
                        mensagem = 'O formato do e-mail é inválido.';
                    }
                    
                    mostrarErroPrimeiroAcesso(`<i class="bi bi-x-circle me-2"></i>${mensagem}`);
                });
        });
    }
    
    // Função para alternar de volta para a tela de Login
    window.mostrarTelaLogin = function() {
        document.getElementById('telaPrimeiroAcesso').style.display = 'none';
        document.getElementById('telaLogin').style.display = 'flex';
        document.getElementById('formPrimeiroAcesso').reset();
    }
}


// ====================================================================================
// INICIALIZAÇÃO E FUNÇÕES DE UI (AJUSTADAS APENAS AS VARIÁVEIS DE USUÁRIO)
// ====================================================================================

function inicializarSistema() {
    const email = currentFirebaseUser ? currentFirebaseUser.email : 'N/D';
    console.log('Inicializando sistema para usuário:', email);

    // Mostrar e-mail do usuário logado na navbar
    const placaElement = document.getElementById('placaUsuario');
    if (placaElement) {
        placaElement.textContent = email; // AGORA EXIBE O E-MAIL
    }
    
    // ... (Definir data atual nos formulários)

    // Inicializar componentes
    try {
        preencherMesesDashboard();
        carregarConfiguracoes();
        atualizarDashboard();
        gerarCalendario();
        carregarHistoricoDiario();
        console.log('Sistema inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar sistema:', error);
    }
}

// Inicialização (Chama configurarFormularioLogin e confia no onAuthStateChanged)
document.addEventListener('DOMContentLoaded', function() {
    configurarFormularioLogin();
    // O onAuthStateChanged do Firebase Auth cuida de verificar se há login e carregar os dados.
    console.log('DOM carregado, aguardando estado de autenticação do Firebase.');
});

// Formulário de Alteração de Senha (AJUSTADO PARA A VERSÃO ASSÍNCRONA DA ALTERAR SENHA)
document.getElementById('formAlterarSenha').addEventListener('submit', function(e) {
    e.preventDefault();

    const senhaAtual = document.getElementById('senhaAtual').value;
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (novaSenha !== confirmarSenha) {
        showError('Erro de Validação', 'As senhas não coincidem!');
        return;
    }
    if (novaSenha.length < 6) {
        showError('Erro de Validação', 'A nova senha deve ter pelo menos 6 caracteres!');
        return;
    }

    // Chama a função assíncrona que gerencia o sucesso/erro internamente
    alterarSenha(senhaAtual, novaSenha);
    // A função retorna true para evitar problemas no fluxo, mas o resultado é assíncrono
});


// ... (TODAS AS OUTRAS FUNÇÕES DE LÓGICA DE DADOS, COMO formConta, formDiario, formConfiguracoes, etc., DEVEM CHAMAR salvarDadosUsuario() e carregarDadosUsuario() como funções assíncronas (com `await` ou `.then()`))

// Exemplo da função salvarConta (já ajustado na conversão anterior):
document.getElementById('formConta').addEventListener('submit', async function(e) { 
    e.preventDefault();
    // ... (lógica de coleta de dados)
    contas.push(conta);
    await salvarDadosUsuario(); // CHAMA A FUNÇÃO ASSÍNCRONA DO FIREBASE
    // ... (lógica de UI)
});

// Lembre-se de manter as regras de segurança do Firestore configuradas para:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite leitura e escrita apenas se o UID do usuário autenticado corresponder
    // ao ID do documento na coleção 'users'.
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
*/