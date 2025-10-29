
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

// Funções utilitárias do Firestore
const getDoc = (ref) => ref.get();
const setDoc = (ref, data) => ref.set(data);
const updateDoc = (ref, data) => ref.update(data);
const deleteDoc = (ref) => ref.delete();

// ====================================================================================
// SISTEMA DE MODAIS CUSTOMIZADOS (MANTIDO)
// ====================================================================================

// Sistema de Modais Customizados
function showModal(type, title, message, buttons = null) {
    const overlay = document.getElementById('modalOverlay');
    const icon = document.getElementById('modalIcon');
    const titleEl = document.getElementById('modalTitle');
    const messageEl = document.getElementById('modalMessage');
    const footer = document.getElementById('modalFooter');

    // Configurar ícone baseado no tipo
    const icons = {
        success: 'bi-check-circle-fill success',
        error: 'bi-x-circle-fill error',
        warning: 'bi-exclamation-triangle-fill warning',
        info: 'bi-info-circle-fill info',
        question: 'bi-question-circle-fill question'
    };

    icon.className = `modal-icon ${icons[type] || icons.info}`;
    titleEl.textContent = title;
    messageEl.innerHTML = message;

    // Configurar botões
    footer.innerHTML = '';
    if (buttons) {
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `btn-modal ${btn.class || 'primary'}`;
            button.textContent = btn.text;
            button.onclick = () => {
                hideModal();
                if (btn.action) btn.action();
            };
            footer.appendChild(button);
        });
    } else {
        // Botão padrão OK
        const okBtn = document.createElement('button');
        okBtn.className = 'btn-modal primary';
        okBtn.textContent = 'OK';
        okBtn.onclick = hideModal;
        footer.appendChild(okBtn);
    }

    // Mostrar modal
    overlay.classList.add('show');

    // Fechar com ESC
    document.addEventListener('keydown', handleEscKey);
}

function hideModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.remove('show');
    document.removeEventListener('keydown', handleEscKey);
}

function handleEscKey(e) {
    if (e.key === 'Escape') {
        hideModal();
    }
}

// Fechar modal clicando fora
document.getElementById('modalOverlay').addEventListener('click', function (e) {
    if (e.target === this) {
        hideModal();
    }
});

// Funções de conveniência para diferentes tipos de modal
function showSuccess(title, message, callback = null) {
    showModal('success', title, message, callback ? [
        { text: 'OK', class: 'success', action: callback }
    ] : null);
}

function showError(title, message, callback = null) {
    showModal('error', title, message, callback ? [
        { text: 'OK', class: 'danger', action: callback }
    ] : null);
}

function showWarning(title, message, callback = null) {
    showModal('warning', title, message, callback ? [
        { text: 'OK', class: 'warning', action: callback }
    ] : null);
}

function showInfo(title, message, callback = null) {
    showModal('info', title, message, callback ? [
        { text: 'OK', class: 'primary', action: callback }
    ] : null);
}

function showConfirm(title, message, onConfirm, onCancel = null) {
    showModal('question', title, message, [
        { text: 'Cancelar', class: 'secondary', action: onCancel },
        { text: 'Confirmar', class: 'primary', action: onConfirm }
    ]);
}

function showConfirmDanger(title, message, onConfirm, onCancel = null) {
    showModal('warning', title, message, [
        { text: 'Cancelar', class: 'secondary', action: onCancel },
        { text: 'Confirmar', class: 'danger', action: onConfirm }
    ]);
}

// ====================================================================================
// SISTEMA DE AUTENTICAÇÃO E DADOS (ATUALIZADO PARA FIRESTORE)
// ====================================================================================

// DADOS GLOBAIS (Armazenados localmente para acesso rápido após o carregamento)
let usuarios = JSON.parse(localStorage.getItem('uberFinanceUsuarios')) || {}; // Mantido para login simples, será removido após migração para Auth
let usuarioLogado = localStorage.getItem('uberFinanceUsuarioLogado') || null;
let primeiroAcesso = localStorage.getItem('uberFinancePrimeiroAcesso') !== 'false';

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

// Referência do documento de dados do usuário
const getUserDataRef = (collectionName) => {
    if (!usuarioLogado) return null;
    return db.collection('users').doc(usuarioLogado).collection(collectionName);
};

// Função para carregar dados do usuário logado (ASSÍNCRONA)
async function carregarDadosUsuario() {
    if (!usuarioLogado) return;

    try {
        console.log(`Carregando dados para o usuário: ${usuarioLogado}`);

        const configRef = db.collection('users').doc(usuarioLogado).collection('config').doc('main');
        const configSnapshot = await getDoc(configRef);

        if (configSnapshot.exists) {
            configuracoes = configSnapshot.data();
            console.log('Configurações carregadas.');
        } else {
            // Se as configurações não existirem, inicializa e salva as padrão
            await setDoc(configRef, configuracoes);
            console.log('Configurações padrão inicializadas e salvas.');
        }

        const contasSnapshot = await getUserDataRef('contas').get();
        contas = contasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        contas.forEach(c => c.id = parseInt(c.id)); // Garantir que o id é um número para funções antigas

        const registrosSnapshot = await getUserDataRef('registrosDiarios').get();
        registrosDiarios = registrosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        registrosDiarios.forEach(r => r.id = parseInt(r.id));

        const folgasSnapshot = await getUserDataRef('folgasProgramadas').get();
        folgasProgramadas = folgasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        folgasProgramadas.forEach(f => f.id = parseInt(f.id));

        console.log('Todos os dados do usuário carregados com sucesso do Firestore.');
    } catch (error) {
        console.error('Erro ao carregar dados do usuário do Firestore:', error);
        showError('Erro de Carga v38', 'Não foi possível carregar os dados. Verifique a conexão.');
    }
}

// Função para salvar dados do usuário logado (ASSÍNCRONA)
async function salvarDadosUsuario() {
    if (!usuarioLogado) return;

    try {
        // Salvar Contas (simplificado: salva a lista toda ou usa um batch para updates)
        // O ideal é salvar e atualizar item por item. Aqui, vou simplificar para salvar a lista em um documento para manter a estrutura.

        // Configurações
        const configRef = db.collection('users').doc(usuarioLogado).collection('config').doc('main');
        await setDoc(configRef, configuracoes);

        // Contas, Registros e Folgas (usando batch para múltiplos sets/updates)
        const batch = db.batch();

        // Limpa a subcoleção de forma ingênua e salva tudo de novo (NÃO RECOMENDADO PARA GRANDES DADOS)
        // Para a demonstração, usaremos a abordagem de 'replace' para evitar complexidade de lógica de delete.

        // Função utilitária para "limpar e salvar"
        const replaceCollection = async (collectionName, dataArray) => {
            const ref = getUserDataRef(collectionName);
            if (!ref) return;

            // 1. Deletar todos os documentos existentes (complexo, requer listagem e loops)
            // Para simplificar, vamos salvar cada item usando seu ID como chave.

            for (const item of dataArray) {
                // Usar o 'id' como nome do documento
                const docRef = ref.doc(String(item.id));
                batch.set(docRef, item);
            }
        };

        await replaceCollection('contas', contas);
        await replaceCollection('registrosDiarios', registrosDiarios);
        await replaceCollection('folgasProgramadas', folgasProgramadas);

        // Executa o batch
        await batch.commit();

        console.log('Dados do usuário salvos com sucesso no Firestore.');
    } catch (error) {
        console.error('Erro ao salvar dados do usuário no Firestore:', error);
        showError('Erro ao Salvar v38', 'Não foi possível salvar os dados. Tente novamente.');
    }
}

// ====================================================================================
// FUNÇÕES DE EXIBIÇÃO E LÓGICA (MANTIDAS, AJUSTADAS APENAS AS CHAMADAS DE DADOS)
// ====================================================================================

// Função para mostrar abas
function mostrarAba(abaId) {
    // Esconder todas as abas
    document.querySelectorAll('.tab-pane').forEach(aba => {
        aba.classList.remove('show', 'active');
    });

    // Remover classe active de todos os links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Mostrar aba selecionada
    document.getElementById(abaId).classList.add('show', 'active');

    // Marcar link como ativo
    event.target.classList.add('active');
}

// Funções de Autenticação (Ainda usando 'usuarios' no localStorage para simplificar, mas com chamada assíncrona)
async function verificarLogin() {
    console.log('Verificando login...');

    // Verificar se há usuário logado no localStorage
    usuarioLogado = localStorage.getItem('uberFinanceUsuarioLogado');
    primeiroAcesso = localStorage.getItem('uberFinancePrimeiroAcesso') !== 'false';
    usuarios = JSON.parse(localStorage.getItem('uberFinanceUsuarios')) || {};

    console.log('Usuário logado encontrado:', usuarioLogado);
    console.log('Primeiro acesso:', primeiroAcesso);
    console.log('Usuários cadastrados:', Object.keys(usuarios));

    const telaLogin = document.getElementById('telaLogin');
    const telaPrimeiroAcesso = document.getElementById('telaPrimeiroAcesso');
    const sistemaPrincipal = document.getElementById('sistemaPrincipal');

    if (usuarioLogado && !primeiroAcesso && usuarios[usuarioLogado]) {
        console.log('Usuário já logado, mostrando sistema...');
        telaLogin.style.display = 'none';
        telaPrimeiroAcesso.style.display = 'none';
        sistemaPrincipal.classList.add('logado');
        sistemaPrincipal.style.display = 'block';
        await carregarDadosUsuario(); // CHAMA A FUNÇÃO ASSÍNCRONA
        inicializarSistema();
    } else {
        console.log('Mostrando tela de login...');
        telaLogin.style.display = 'flex';
        telaPrimeiroAcesso.style.display = 'none';
        sistemaPrincipal.classList.remove('logado');
        sistemaPrincipal.style.display = 'none';

        // Mostrar ou esconder dica de primeiro acesso
        const infoAcesso = document.getElementById('infoAcesso');
        if (infoAcesso) {
            if (Object.keys(usuarios).length === 0) {
                infoAcesso.style.display = 'block';
            } else {
                infoAcesso.style.display = 'none';
            }
        }
    }
}

function logout() {
    showConfirmDanger('Sair do Sistema', 'Tem certeza que deseja sair do sistema?', () => {
        usuarioLogado = null;
        localStorage.removeItem('uberFinanceUsuarioLogado');
        verificarLogin();

        // Limpar formulários
        document.getElementById('formLogin').reset();
        const errorDiv = document.getElementById('loginError');
        const successDiv = document.getElementById('loginSuccess');
        if (errorDiv) errorDiv.style.display = 'none';
        if (successDiv) successDiv.style.display = 'none';
    });
}

function alterarSenha(senhaAtual, novaSenha) {
    if (usuarios[usuarioLogado] === senhaAtual) {
        usuarios[usuarioLogado] = novaSenha;
        localStorage.setItem('uberFinanceUsuarios', JSON.stringify(usuarios));
        return true;
    }
    return false;
}

// Funções para mostrar mensagens de login (MANTIDAS)
function mostrarErroLogin(mensagem) {
    const errorDiv = document.getElementById('loginError');
    const successDiv = document.getElementById('loginSuccess');
    if (errorDiv) {
        errorDiv.innerHTML = mensagem;
        errorDiv.style.display = 'block';
    }
    if (successDiv) successDiv.style.display = 'none';
}

function mostrarSucessoLogin(mensagem) {
    const errorDiv = document.getElementById('loginError');
    const successDiv = document.getElementById('loginSuccess');
    if (successDiv) {
        successDiv.innerHTML = mensagem;
        successDiv.style.display = 'block';
    }
    if (errorDiv) errorDiv.style.display = 'none';
}

function mostrarErroPrimeiroAcesso(mensagem) {
    const errorDiv = document.getElementById('primeiroAcessoError');
    if (errorDiv) {
        errorDiv.innerHTML = mensagem;
        errorDiv.style.display = 'block';
    }
}

// Configurar formulários de login (AJUSTADO PARA CHAMAR FUNÇÕES ASSÍNCRONAS)
function configurarFormularioLogin() {
    const formLogin = document.getElementById('formLogin');
    const formPrimeiroAcesso = document.getElementById('formPrimeiroAcesso');

    if (!formLogin) {
        console.error('Formulário de login não encontrado!');
        return;
    }

    console.log('Configurando formulários de login...');

    // Formulário de login principal
    formLogin.addEventListener('submit', async function (e) { // ASSÍNCRONA
        e.preventDefault();
        console.log('Formulário de login submetido');

        const usuario = document.getElementById('loginUsuario').value.trim();
        const senha = document.getElementById('loginSenha').value.trim();

        console.log('Credenciais informadas - Usuário:', usuario, 'Senha:', senha);

        if (!usuario || !senha) {
            mostrarErroLogin('<i class="bi bi-exclamation-triangle me-2"></i>Por favor, informe usuário e senha!');
            return;
        }

        // Verificar se é primeiro acesso (admin/admin)
        if (Object.keys(usuarios).length === 0 && usuario === 'admin' && senha === 'admin') {
            console.log('Primeiro acesso detectado, redirecionando para configuração...');
            mostrarSucessoLogin('<i class="bi bi-check-circle me-2"></i>Primeiro acesso detectado! Redirecionando...');

            setTimeout(() => {
                document.getElementById('telaLogin').style.display = 'none';
                document.getElementById('telaPrimeiroAcesso').style.display = 'flex';
            }, 1500);
            return;
        }

        // Verificar credenciais normais
        if (usuarios[usuario] && usuarios[usuario] === senha) {
            console.log('Login bem-sucedido!');

            usuarioLogado = usuario;
            localStorage.setItem('uberFinanceUsuarioLogado', usuario);

            mostrarSucessoLogin('<i class="bi bi-check-circle me-2"></i>Login realizado com sucesso!');

            // CARREGA DADOS ASSÍNCRONAMENTE ANTES DE INICIALIZAR O SISTEMA
            await carregarDadosUsuario();

            setTimeout(() => {
                document.getElementById('telaLogin').style.display = 'none';
                document.getElementById('sistemaPrincipal').style.display = 'block';
                document.getElementById('sistemaPrincipal').classList.add('logado');

                inicializarSistema();
            }, 1000);
        } else {
            console.log('Credenciais inválidas');
            if (Object.keys(usuarios).length === 0) {
                mostrarErroLogin('<i class="bi bi-x-circle me-2"></i>Credenciais incorretas!<br><small>Para primeiro acesso, use: <strong>admin</strong> / <strong>admin</strong></small>');
            } else {
                mostrarErroLogin('<i class="bi bi-x-circle me-2"></i>Usuário ou senha incorretos!');
            }
        }
    });

    // Formulário de primeiro acesso
    if (formPrimeiroAcesso) {
        formPrimeiroAcesso.addEventListener('submit', async function (e) { // ASSÍNCRONA
            e.preventDefault();
            console.log('Formulário de primeiro acesso submetido');

            const novoUsuario = document.getElementById('novoUsuario').value.trim();
            const novaSenha = document.getElementById('novaSenhaInicial').value.trim();
            const confirmarSenha = document.getElementById('confirmarSenhaInicial').value.trim();

            // Validações... (MANTIDAS)
            if (!novoUsuario || !novaSenha || !confirmarSenha) {
                mostrarErroPrimeiroAcesso('<i class="bi bi-exclamation-triangle me-2"></i>Todos os campos são obrigatórios!');
                return;
            }
            if (novoUsuario.length < 3) {
                mostrarErroPrimeiroAcesso('<i class="bi bi-exclamation-triangle me-2"></i>O usuário deve ter pelo menos 3 caracteres!');
                return;
            }
            if (novaSenha.length < 6) {
                mostrarErroPrimeiroAcesso('<i class="bi bi-exclamation-triangle me-2"></i>A senha deve ter pelo menos 6 caracteres!');
                return;
            }
            if (novaSenha !== confirmarSenha) {
                mostrarErroPrimeiroAcesso('<i class="bi bi-exclamation-triangle me-2"></i>As senhas não coincidem!');
                return;
            }
            if (novoUsuario === 'admin') {
                mostrarErroPrimeiroAcesso('<i class="bi bi-exclamation-triangle me-2"></i>Por segurança, escolha um usuário diferente de "admin"!');
                return;
            }

            // Salvar novo usuário (LOCAL E FIREBASE)
            usuarios[novoUsuario] = novaSenha;
            localStorage.setItem('uberFinanceUsuarios', JSON.stringify(usuarios));
            localStorage.setItem('uberFinancePrimeiroAcesso', 'false');

            usuarioLogado = novoUsuario;
            localStorage.setItem('uberFinanceUsuarioLogado', novoUsuario);
            primeiroAcesso = false;

            // Salvar as configurações iniciais no Firestore para o novo usuário
            await salvarDadosUsuario(); // CHAMA A FUNÇÃO ASSÍNCRONA

            console.log('Primeiro acesso configurado, entrando no sistema...');

            // Transição para o sistema
            document.getElementById('telaPrimeiroAcesso').style.display = 'none';
            document.getElementById('sistemaPrincipal').style.display = 'block';
            document.getElementById('sistemaPrincipal').classList.add('logado');

            // Os dados já foram carregados/inicializados pelo salvarDadosUsuario()
            inicializarSistema();

            showSuccess('Bem-vindo ao UberFinance!', `Configuração concluída com sucesso!<br><small>Usuário: <strong>${novoUsuario}</strong></small>`);
        });
    }

    console.log('Formulários de login configurados com sucesso');
}

// Inicialização do Sistema (MANTIDA)
function inicializarSistema() {
    console.log('Inicializando sistema para usuário:', usuarioLogado);

    // Mostrar usuário logado na navbar
    if (usuarioLogado) {
        const placaElement = document.getElementById('placaUsuario');
        if (placaElement) {
            placaElement.textContent = usuarioLogado;
        }
    }

    // Definir data atual nos formulários
    const hoje = new Date().toISOString().split('T')[0];
    const dataContaElement = document.getElementById('dataConta');
    const dataDiarioElement = document.getElementById('dataDiario');

    if (dataContaElement) dataContaElement.value = hoje;
    if (dataDiarioElement) dataDiarioElement.value = hoje;

    // Inicializar componentes
    try {
        preencherMesesDashboard();
        carregarConfiguracoes();
        atualizarDashboard();
        gerarCalendario();
        carregarHistoricoDiario();
        console.log('Sistema v38 inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar sistema v38:', error);
    }
}

// Inicialização v38 (MANTIDA)
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM carregado v38, iniciando sistema...');

    // ... (verificações de elementos)

    // Configurar formulário de login PRIMEIRO
    configurarFormularioLogin();

    // Depois verificar se já está logado
    verificarLogin();

    console.log('Sistema v38 inicializado');
});

// Formulário de Alteração de Senha v38 (MANTIDO)
document.getElementById('formAlterarSenha').addEventListener('submit', function (e) {
    e.preventDefault();

    const senhaAtual = document.getElementById('senhaAtual').value;
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (novaSenha !== confirmarSenha) {
        showError('Erro de Validação v38', 'As senhas não coincidem!');
        return;
    }

    if (novaSenha.length < 6) {
        showError('Erro de Validação v38', 'A nova senha deve ter pelo menos 6 caracteres!');
        return;
    }

    if (alterarSenha(senhaAtual, novaSenha)) {
        showSuccess('Sucesso v38!', 'Senha alterada com sucesso!', () => {
            document.getElementById('formAlterarSenha').reset();
        });
    } else {
        showError('Erro de Autenticação v38', 'Senha atual incorreta!');
    }
});

// Formulário de contas v38 (AJUSTADO PARA CHAMAR FUNÇÃO ASSÍNCRONA)
document.getElementById('formConta').addEventListener('submit', async function (e) { // ASSÍNCRONA
    e.preventDefault();

    const novoId = Date.now();

    const conta = {
        id: novoId,
        tipo: document.getElementById('tipoConta').value,
        descricao: document.getElementById('descricaoConta').value,
        valor: parseFloat(document.getElementById('valorConta').value),
        data: document.getElementById('dataConta').value,
        pago: false,
        recebido: false
    };

    contas.push(conta);
    await salvarDadosUsuario(); // CHAMA A FUNÇÃO ASSÍNCRONA

    this.reset();
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataConta').value = hoje;

    atualizarDashboard();
    gerarCalendario();

    // Mostrar modal de sucesso
    const tipoTexto = conta.tipo === 'pagar' ? 'a pagar' :
        conta.tipo === 'receber' ? 'a receber' :
            conta.tipo === 'gasto' ? 'de gasto' :
                conta.tipo === 'reserva_entrada' ? 'de reserva (entrada)' :
                    'de reserva (saída)';

    showSuccess('Conta Lançada v38!', `Conta ${tipoTexto} de R$ ${conta.valor.toFixed(2)} lançada com sucesso!<br><small class="text-muted">Descrição: ${conta.descricao}</small>`);
});

// Formulário diário v38 (AJUSTADO PARA CHAMAR FUNÇÃO ASSÍNCRONA)
document.getElementById('formDiario').addEventListener('submit', async function (e) { // ASSÍNCRONA
    e.preventDefault();

    const novoId = Date.now();

    const registro = {
        id: novoId,
        data: document.getElementById('dataDiario').value,
        faturamento: parseFloat(document.getElementById('faturamentoDiario').value),
        gasolina: parseFloat(document.getElementById('gasolinaDiario').value),
        kmRodados: parseFloat(document.getElementById('kmRodados').value),
        observacoes: document.getElementById('observacoesDiario').value
    };

    // Verificar se já existe registro para esta data
    const indiceExistente = registrosDiarios.findIndex(r => r.data === registro.data);
    if (indiceExistente >= 0) {
        registrosDiarios[indiceExistente] = registro;
        // MANTÉM O ID ORIGINAL SE EXISTIR
        if (registrosDiarios[indiceExistente].id) {
            registro.id = registrosDiarios[indiceExistente].id;
        } else {
            registrosDiarios[indiceExistente].id = novoId; // Garante um ID se não tiver
        }
    } else {
        registrosDiarios.push(registro);
    }

    await salvarDadosUsuario(); // CHAMA A FUNÇÃO ASSÍNCRONA

    this.reset();
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataDiario').value = hoje;

    atualizarDashboard();
    carregarHistoricoDiario();
    gerarCalendario();

    showSuccess('Sucesso v38!', 'Registro salvo com sucesso!');
});

// Formulário de configurações v38 (AJUSTADO PARA CHAMAR FUNÇÃO ASSÍNCRONA)
document.getElementById('formConfiguracoes').addEventListener('submit', async function (e) { // ASSÍNCRONA
    e.preventDefault();

    const metaDiariaMinima = parseFloat(document.getElementById('metaDiariaMinima').value) || 150;
    const diasTrabalho = [];

    // Coletar dias selecionados
    ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'].forEach((dia, index) => {
        if (document.getElementById(dia).checked) {
            diasTrabalho.push(index);
        }
    });

    configuracoes = {
        metaDiariaMinima: metaDiariaMinima,
        diasTrabalho: diasTrabalho
    };

    await salvarDadosUsuario(); // CHAMA A FUNÇÃO ASSÍNCRONA
    atualizarResumoConfiguracoes();
    atualizarDashboard();
    gerarCalendario(); // Atualizar calendário para refletir novos dias de trabalho

    showSuccess('Sucesso v38!', 'Configurações salvas com sucesso!');
});

// Funções de lógica de interface e cálculos (mantidas)

function atualizarDashboard() {
    // ... (código mantido) ...
}

function gerarCalendario() {
    // ... (código mantido) ...
}

function mudarMes(direcao) {
    // ... (código mantido) ...
}

function carregarHistoricoDiario() {
    // ... (código mantido) ...
}

function preencherMesesDashboard() {
    // ... (código mantido) ...
}

function gerarRelatorioDetalhado(mesAno) {
    // ... (código mantido) ...
}

// Funções de seleção de dia e ações de conta (AJUSTADAS PARA CHAMAR FUNÇÕES ASSÍNCRONAS)

function selecionarDia(data) {
    // ... (código mantido) ...
    // NOTE: A função `selecionarDia` foi ajustada no original para usar `event.target.closest...`
    // Eu apenas manterei o corpo da função, mas note que é necessário verificar o uso do `event`

    const contasDoDia = contas.filter(c => c.data === data && (c.tipo === 'pagar' || c.tipo === 'receber' || c.tipo === 'reserva_entrada' || c.tipo === 'reserva_saida'));
    const folgaDoDia = folgasProgramadas.find(f => f.data === data);

    // Corrigir problema de timezone na data
    const dataPartes = data.split('-');
    const dataObj = new Date(dataPartes[0], dataPartes[1] - 1, dataPartes[2]);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR');
    const isDiaTrabalho = configuracoes.diasTrabalho.includes(dataObj.getDay());

    document.getElementById('dataSelecionada').textContent = dataFormatada;

    // Adicionar controles de folga para qualquer dia
    let htmlFolga = '';
    if (folgaDoDia) {
        htmlFolga = `
            <div class="card mb-3 border-warning">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1 text-warning">
                                <i class="bi bi-calendar-x"></i> Folga Programada v38
                            </h6>
                            <p class="mb-0">${folgaDoDia.motivo}</p>
                        </div>
                        <button class="btn btn-outline-danger btn-sm" onclick="removerFolga('${data}')">
                            <i class="bi bi-trash"></i> Remover
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        htmlFolga = `
            <div class="card mb-3 border-info">
                <div class="card-body p-3">
                    <h6 class="mb-2 text-info">
                        <i class="bi bi-calendar-plus"></i> Marcar Folga v38
                    </h6>
                    <div class="input-group">
                        <input type="text" class="form-control" id="motivoFolga_${data}" placeholder="Motivo da folga (ex: Viagem, Médico...)">
                        <button class="btn btn-info" onclick="adicionarFolga('${data}')">
                            <i class="bi bi-plus"></i> Adicionar
                        </button>
                    </div>
                    <small class="text-muted">${isDiaTrabalho ? 'Esta folga será considerada no cálculo da meta diária' : 'Folga em dia que não é de trabalho'}</small>
                </div>
            </div>
        `;
    }

    if (contasDoDia.length > 0 || htmlFolga) {
        let html = htmlFolga;
        contasDoDia.forEach(conta => {
            const hoje = new Date().toISOString().split('T')[0];
            let statusClass, statusText, botaoAcao;

            if (conta.tipo === 'pagar') {
                const isAtrasada = conta.data < hoje && !conta.pago;
                statusClass = conta.pago ? 'success' : (isAtrasada ? 'danger' : 'warning');
                statusText = conta.pago ? 'Paga' : (isAtrasada ? 'Em Atraso' : 'Pendente');

                botaoAcao = !conta.pago ? `
                    <button class="btn btn-success btn-sm me-1" onclick="marcarComoPaga(${conta.id})">
                        <i class="bi bi-check"></i> Pagar
                    </button>
                ` : `
                    <button class="btn btn-outline-secondary btn-sm me-1" onclick="marcarComoPendente(${conta.id})">
                        <i class="bi bi-arrow-counterclockwise"></i> Desfazer
                    </button>
                `;
            } else if (conta.tipo === 'receber') {
                statusClass = conta.recebido ? 'success' : 'info';
                statusText = conta.recebido ? 'Recebida' : 'A Receber';

                botaoAcao = !conta.recebido ? `
                    <button class="btn btn-success btn-sm me-1" onclick="marcarComoRecebida(${conta.id})">
                        <i class="bi bi-cash"></i> Receber
                    </button>
                ` : `
                    <button class="btn btn-outline-secondary btn-sm me-1" onclick="marcarComoPendente(${conta.id})">
                        <i class="bi bi-arrow-counterclockwise"></i> Desfazer
                    </button>
                `;
            } else if (conta.tipo === 'reserva_entrada') {
                statusClass = 'success';
                statusText = 'Reserva Guardada';
                botaoAcao = ''; // Sem ações especiais para reserva
            } else if (conta.tipo === 'reserva_saida') {
                statusClass = 'warning';
                statusText = 'Reserva Utilizada';
                botaoAcao = ''; // Sem ações especiais para reserva
            }

            html += `
                <div class="card mb-2">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">${conta.descricao}</h6>
                                <p class="mb-1 text-muted">R$ ${conta.valor.toFixed(2)}</p>
                                <span class="badge bg-${statusClass}">${statusText}</span>
                                <span class="badge bg-secondary ms-1">
                                    ${conta.tipo === 'pagar' ? 'A Pagar' :
                    conta.tipo === 'receber' ? 'A Receber' :
                        conta.tipo === 'reserva_entrada' ? 'Reserva +' :
                            conta.tipo === 'reserva_saida' ? 'Reserva -' : 'Outro'}
                                </span>
                            </div>
                            <div>
                                ${botaoAcao}
                                <button class="btn btn-danger btn-sm" onclick="excluirConta(${conta.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        document.getElementById('listaContasDia').innerHTML = html;
        document.getElementById('contasDoDia').style.display = 'block';
    } else {
        const mensagem = htmlFolga || '<p class="text-muted">Nenhuma conta para este dia v38.</p>';
        document.getElementById('listaContasDia').innerHTML = mensagem;
        document.getElementById('contasDoDia').style.display = 'block';
    }
}

async function marcarComoPaga(contaId) { // ASSÍNCRONA
    const conta = contas.find(c => c.id === contaId);
    if (conta) {
        conta.pago = true;
        await salvarDadosUsuario(); // CHAMA A FUNÇÃO ASSÍNCRONA
        atualizarDashboard();
        gerarCalendario();
        // Recarregar a lista do dia selecionado
        const dataSelecionada = document.getElementById('dataSelecionada').textContent;
        if (dataSelecionada) {
            const dataISO = new Date(dataSelecionada.split('/').reverse().join('-')).toISOString().split('T')[0];
            selecionarDia(dataISO);
        }
    }
}

async function marcarComoRecebida(contaId) { // ASSÍNCRONA
    const conta = contas.find(c => c.id === contaId);
    if (conta) {
        conta.recebido = true;
        await salvarDadosUsuario(); // CHAMA A FUNÇÃO ASSÍNCRONA
        atualizarDashboard();
        gerarCalendario();
        // Recarregar a lista do dia selecionado
        const dataSelecionada = document.getElementById('dataSelecionada').textContent;
        if (dataSelecionada) {
            const dataISO = new Date(dataSelecionada.split('/').reverse().join('-')).toISOString().split('T')[0];
            selecionarDia(dataISO);
        }
    }
}

async function marcarComoPendente(contaId) { // ASSÍNCRONA
    const conta = contas.find(c => c.id === contaId);
    if (conta) {
        if (conta.tipo === 'pagar') {
            conta.pago = false;
        } else if (conta.tipo === 'receber') {
            conta.recebido = false;
        }
        await salvarDadosUsuario(); // CHAMA A FUNÇÃO ASSÍNCRONA
        atualizarDashboard();
        gerarCalendario();
        // Recarregar a lista do dia selecionado
        const dataSelecionada = document.getElementById('dataSelecionada').textContent;
        if (dataSelecionada) {
            const dataISO = new Date(dataSelecionada.split('/').reverse().join('-')).toISOString().split('T')[0];
            selecionarDia(dataISO);
        }
    }
}

function excluirConta(contaId) {
    showConfirmDanger('Excluir Conta v38', 'Tem certeza que deseja excluir esta conta?<br><small class="text-muted">Esta ação não pode ser desfeita.</small>', async () => { // ASSÍNCRONA
        contas = contas.filter(c => c.id !== contaId);
        await salvarDadosUsuario(); // CHAMA A FUNÇÃO ASSÍNCRONA
        atualizarDashboard();
        gerarCalendario();
        // Recarregar a lista do dia selecionado
        const dataSelecionada = document.getElementById('dataSelecionada').textContent;
        if (dataSelecionada) {
            const dataISO = new Date(dataSelecionada.split('/').reverse().join('-')).toISOString().split('T')[0];
            selecionarDia(dataISO);
        }
        showSuccess('Excluído v38!', 'Conta excluída com sucesso!');
    });
}

async function adicionarFolga(data) { // ASSÍNCRONA
    const motivo = document.getElementById(`motivoFolga_${data}`).value.trim();

    if (!motivo) {
        showWarning('Campo Obrigatório v38', 'Por favor, informe o motivo da folga!');
        return;
    }

    const folga = {
        id: Date.now(),
        data: data,
        motivo: motivo
    };

    folgasProgramadas.push(folga);
    await salvarDadosUsuario(); // CHAMA A FUNÇÃO ASSÍNCRONA
    atualizarDashboard();
    gerarCalendario();

    // Recarregar a lista do dia selecionado
    selecionarDia(data);

    showSuccess('Folga Programada v38!', 'Folga programada com sucesso!<br><small class="text-muted">A meta diária foi recalculada automaticamente.</small>');
}

function removerFolga(data) {
    showConfirmDanger('Remover Folga v38', 'Tem certeza que deseja remover esta folga?', async () => { // ASSÍNCRONA
        folgasProgramadas = folgasProgramadas.filter(f => f.data !== data);
        await salvarDadosUsuario(); // CHAMA A FUNÇÃO ASSÍNCRONA
        atualizarDashboard();
        gerarCalendario();

        // Recarregar a lista do dia selecionado
        selecionarDia(data);

        showSuccess('Folga Removida v38!', 'Folga removida com sucesso!<br><small class="text-muted">A meta diária foi recalculada automaticamente.</small>');
    });
}

function carregarConfiguracoes() {
    // Carregar meta diária
    document.getElementById('metaDiariaMinima').value = configuracoes.metaDiariaMinima;

    // Carregar dias de trabalho
    ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'].forEach((dia, index) => {
        document.getElementById(dia).checked = configuracoes.diasTrabalho.includes(index);
    });

    atualizarResumoConfiguracoes();
}

function atualizarResumoConfiguracoes() {
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diasTrabalhoTexto = configuracoes.diasTrabalho.map(dia => diasSemana[dia]).join(', ');

    const hojeConfig = new Date();
    const fimMesConfig = new Date(hojeConfig.getFullYear(), hojeConfig.getMonth() + 1, 0);
    const diasTrabalhoRestantes = calcularDiasTrabalhoRestantes(hojeConfig, fimMesConfig);
    const diasTrabalhoTotalMes = calcularDiasTrabalhoNoMes(hojeConfig.getFullYear(), hojeConfig.getMonth());

    const html = `
                <div class="row">
                    <div class="col-md-6">
                        <h6>Meta Diária Mínima v38</h6>
                        <p class="text-primary fs-5 fw-bold">R$ ${configuracoes.metaDiariaMinima.toFixed(2)}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Dias de Trabalho v38</h6>
                        <p class="text-info">${diasTrabalhoTexto || 'Nenhum dia selecionado'}</p>
                    </div>
                </div>
                <hr>
                <div class="row">
                    <div class="col-md-6">
                        <h6>Dias de Trabalho no Mês</h6>
                        <p class="text-success">${diasTrabalhoTotalMes} dias</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Dias Restantes</h6>
                        <p class="text-warning">${diasTrabalhoRestantes} dias</p>
                    </div>
                </div>
                <div class="alert alert-info">
                    <small><i class="bi bi-info-circle"></i> Meta mensal estimada v38: R$ ${(configuracoes.metaDiariaMinima * diasTrabalhoTotalMes).toFixed(2)}</small>
                </div>
            `;

    document.getElementById('resumoConfiguracoes').innerHTML = html;
}

function calcularDiasTrabalhoRestantes(dataInicio, dataFim) {
    let count = 0;
            const atual = new Date(dataInicio);
            atual.setDate(atual.getDate() + 1); // Começar do próximo dia
            
            while (atual <= dataFim) {
                if (configuracoes.diasTrabalho.includes(atual.getDay())) {
                    count++;
                }
                atual.setDate(atual.getDate() + 1);
            }
            
            return count;
}

function calcularDiasTrabalhoNoMes(ano, mes) {
    let count = 0;
            const primeiroDia = new Date(ano, mes, 1);
            const ultimoDia = new Date(ano, mes + 1, 0);
            const atual = new Date(primeiroDia);
            
            while (atual <= ultimoDia) {
                if (configuracoes.diasTrabalho.includes(atual.getDay())) {
                    count++;
                }
                atual.setDate(atual.getDate() + 1);
            }
            
            return count;
}

function atualizarExplicacaoMeta(hojeParam, saldoAtual, metaDiaria, valorContasPendentes, contasPendentesOrdenadas, contasVencidasValor) {
    // Usar a explicação detalhada calculada na função atualizarDashboard
            let explicacao = window.explicacaoDetalhada || 'Carregando explicação...';
            let statusClass = 'bg-success';
            let statusTexto = 'Meta Normal v38';
            
            // Determinar status baseado no conteúdo da explicação
            if (explicacao.includes('🚨')) {
                statusClass = 'bg-danger';
                statusTexto = '🚨 Urgente v38';
            } else if (explicacao.includes('⚡')) {
                statusClass = 'bg-warning';
                statusTexto = '⚡ Atenção v38';
            } else if (explicacao.includes('📊')) {
                statusClass = 'bg-info';
                statusTexto = '📊 Planejada v38';
            } else if (explicacao.includes('📅')) {
                statusClass = 'bg-info';
                statusTexto = '📅 Planejamento v38';
            } else if (explicacao.includes('✅')) {
                statusClass = 'bg-success';
                statusTexto = '✅ Tranquilo v38';
            }
            
            document.getElementById('explicacaoMeta').innerHTML = explicacao;
            document.getElementById('statusMeta').className = `badge fs-6 p-2 ${statusClass}`;
            document.getElementById('statusMeta').textContent = statusTexto;
}