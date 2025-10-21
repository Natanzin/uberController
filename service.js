(function () { function c() { var b = a.contentDocument || a.contentWindow.document; if (b) { var d = b.createElement('script'); d.innerHTML = "window.__CF$cv$params={r:'991a96b32660c02a',t:'MTc2MDk4NTA1MC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);"; b.getElementsByTagName('head')[0].appendChild(d) } } if (document.body) { var a = document.createElement('iframe'); a.height = 1; a.width = 1; a.style.position = 'absolute'; a.style.top = 0; a.style.left = 0; a.style.border = 'none'; a.style.visibility = 'hidden'; document.body.appendChild(a); if ('loading' !== document.readyState) c(); else if (window.addEventListener) document.addEventListener('DOMContentLoaded', c); else { var e = document.onreadystatechange || function () { }; document.onreadystatechange = function (b) { e(b); 'loading' !== document.readyState && (document.onreadystatechange = e, c()) } } } })();
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

// Sistema de Autenticação
let usuarios = JSON.parse(localStorage.getItem('uberFinanceUsuarios')) || {
  'admin': '123456' // Usuário padrão
};
let usuarioLogado = localStorage.getItem('uberFinanceUsuarioLogado') || null;

// Dados em localStorage (separados por usuário)
let contas = [];
let registrosDiarios = [];
let folgasProgramadas = [];
let configuracoes = {
  metaDiariaMinima: 150,
  diasTrabalho: [1, 2, 3, 4, 5] // Segunda a sexta por padrão
};

// Função para carregar dados do usuário logado
function carregarDadosUsuario() {
  if (usuarioLogado) {
    contas = JSON.parse(localStorage.getItem(`uberFinanceContas_${usuarioLogado}`)) || [];
    registrosDiarios = JSON.parse(localStorage.getItem(`uberFinanceRegistros_${usuarioLogado}`)) || [];
    folgasProgramadas = JSON.parse(localStorage.getItem(`uberFinanceFolgas_${usuarioLogado}`)) || [];
    configuracoes = JSON.parse(localStorage.getItem(`uberFinanceConfiguracoes_${usuarioLogado}`)) || {
      metaDiariaMinima: 150,
      diasTrabalho: [1, 2, 3, 4, 5]
    };
  }
}

// Função para salvar dados do usuário logado
function salvarDadosUsuario() {
  if (usuarioLogado) {
    localStorage.setItem(`uberFinanceContas_${usuarioLogado}`, JSON.stringify(contas));
    localStorage.setItem(`uberFinanceRegistros_${usuarioLogado}`, JSON.stringify(registrosDiarios));
    localStorage.setItem(`uberFinanceFolgas_${usuarioLogado}`, JSON.stringify(folgasProgramadas));
    localStorage.setItem(`uberFinanceConfiguracoes_${usuarioLogado}`, JSON.stringify(configuracoes));
  }
}

let mesAtualCalendario = new Date().getMonth();
let anoAtualCalendario = new Date().getFullYear();

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

// Funções de Autenticação
function verificarLogin() {
  if (usuarioLogado) {
    document.getElementById('telaLogin').style.display = 'none';
    document.getElementById('sistemaPrincipal').classList.add('logado');
    inicializarSistema();
  } else {
    document.getElementById('telaLogin').style.display = 'flex';
    document.getElementById('sistemaPrincipal').classList.remove('logado');
  }
}

function login(usuario, senha) {
  if (usuarios[usuario] && usuarios[usuario] === senha) {
    usuarioLogado = usuario;
    localStorage.setItem('uberFinanceUsuarioLogado', usuario);
    verificarLogin();
    return true;
  }
  return false;
}

function logout() {
  showConfirmDanger('Sair do Sistema', 'Tem certeza que deseja sair do sistema?', () => {
    usuarioLogado = null;
    localStorage.removeItem('uberFinanceUsuarioLogado');
    verificarLogin();

    // Limpar formulários
    document.getElementById('formLogin').reset();
    document.getElementById('loginError').style.display = 'none';
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

// Inicialização do Sistema
function inicializarSistema() {
  // Carregar dados específicos do usuário
  carregarDadosUsuario();

  // Definir data atual nos formulários
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('dataConta').value = hoje;
  document.getElementById('dataDiario').value = hoje;

  preencherMesesDashboard();
  carregarConfiguracoes();
  atualizarDashboard();
  gerarCalendario();
  carregarHistoricoDiario();
}

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
  verificarLogin();
});

// Formulário de Login
document.getElementById('formLogin').addEventListener('submit', function (e) {
  e.preventDefault();

  const usuario = document.getElementById('loginUsuario').value;
  const senha = document.getElementById('loginSenha').value;

  if (login(usuario, senha)) {
    document.getElementById('loginError').style.display = 'none';
  } else {
    showError('Erro de Login', 'Usuário ou senha incorretos!');
  }
});

// Formulário de Alteração de Senha
document.getElementById('formAlterarSenha').addEventListener('submit', function (e) {
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

  if (alterarSenha(senhaAtual, novaSenha)) {
    showSuccess('Sucesso!', 'Senha alterada com sucesso!', () => {
      document.getElementById('formAlterarSenha').reset();
    });
  } else {
    showError('Erro de Autenticação', 'Senha atual incorreta!');
  }
});

// Formulário de contas
document.getElementById('formConta').addEventListener('submit', function (e) {
  e.preventDefault();

  const conta = {
    id: Date.now(),
    tipo: document.getElementById('tipoConta').value,
    descricao: document.getElementById('descricaoConta').value,
    valor: parseFloat(document.getElementById('valorConta').value),
    data: document.getElementById('dataConta').value,
    pago: false
  };

  contas.push(conta);
  salvarDadosUsuario();

  this.reset();
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('dataConta').value = hoje;

  atualizarDashboard();
  gerarCalendario();

  showSuccess('Sucesso!', 'Conta lançada com sucesso!');
});

// Formulário diário
document.getElementById('formDiario').addEventListener('submit', function (e) {
  e.preventDefault();

  const registro = {
    id: Date.now(),
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
  } else {
    registrosDiarios.push(registro);
  }

  salvarDadosUsuario();

  this.reset();
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('dataDiario').value = hoje;

  atualizarDashboard();
  carregarHistoricoDiario();
  gerarCalendario();

  showSuccess('Sucesso!', 'Registro salvo com sucesso!');
});

// Formulário de configurações
document.getElementById('formConfiguracoes').addEventListener('submit', function (e) {
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

  salvarDadosUsuario();
  atualizarResumoConfiguracoes();
  atualizarDashboard();
  gerarCalendario(); // Atualizar calendário para refletir novos dias de trabalho

  showSuccess('Sucesso!', 'Configurações salvas com sucesso!');
});

function atualizarDashboard() {
  const mesSelecionado = document.getElementById('mesDashboard').value;
  let inicioMes, fimMes, hoje;

  if (mesSelecionado) {
    const [ano, mes] = mesSelecionado.split('-').map(Number);
    inicioMes = new Date(ano, mes - 1, 1);
    fimMes = new Date(ano, mes, 0);
    hoje = new Date();
  } else {
    hoje = new Date();
    inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  }

  const hojeStr = hoje.toISOString().split('T')[0];

  // Calcular faturamento do mês
  const faturamentoMes = registrosDiarios
    .filter(r => {
      const dataReg = new Date(r.data);
      return dataReg >= inicioMes && dataReg <= fimMes;
    })
    .reduce((total, r) => total + r.faturamento, 0);

  // Calcular gastos de combustível do mês
  const gastosCombustivel = registrosDiarios
    .filter(r => {
      const dataReg = new Date(r.data);
      return dataReg >= inicioMes && dataReg <= fimMes;
    })
    .reduce((total, r) => total + r.gasolina, 0);

  // Calcular total de km rodados no mês
  const totalKmMes = registrosDiarios
    .filter(r => {
      const dataReg = new Date(r.data);
      return dataReg >= inicioMes && dataReg <= fimMes;
    })
    .reduce((total, r) => total + (r.kmRodados || 0), 0);

  // Calcular custo por km
  const custoPorKm = totalKmMes > 0 ? gastosCombustivel / totalKmMes : 0;

  // Calcular contas pendentes e atrasadas
  const contasPendentes = contas
    .filter(c => c.tipo === 'pagar' && !c.pago)
    .reduce((total, c) => total + c.valor, 0);

  const contasAtrasadas = contas
    .filter(c => c.tipo === 'pagar' && !c.pago && c.data < hojeStr);

  // Calcular gastos realizados (outros gastos)
  const outrosGastos = contas
    .filter(c => c.tipo === 'gasto')
    .reduce((total, c) => total + c.valor, 0);

  // Calcular reserva de emergência
  const reservaEntradas = contas
    .filter(c => c.tipo === 'reserva_entrada')
    .reduce((total, c) => total + c.valor, 0);

  const reservaSaidas = contas
    .filter(c => c.tipo === 'reserva_saida')
    .reduce((total, c) => total + c.valor, 0);

  const saldoReserva = reservaEntradas - reservaSaidas;

  // Calcular contas pagas e recebidas
  const contasPagas = contas
    .filter(c => c.tipo === 'pagar' && c.pago)
    .reduce((total, c) => total + c.valor, 0);

  const contasRecebidas = contas
    .filter(c => c.tipo === 'receber' && c.recebido)
    .reduce((total, c) => total + c.valor, 0);

  // Saldo atual (faturamento + contas recebidas - gastos - contas pagas - reserva guardada)
  const saldoAtual = faturamentoMes + contasRecebidas - gastosCombustivel - outrosGastos - contasPagas - reservaEntradas + reservaSaidas;

  // Lucro líquido (apenas faturamento - combustível)
  const lucroLiquidoSimples = faturamentoMes - gastosCombustivel;

  // NOVA FÓRMULA DA META DIÁRIA - BASEADA EM VENCIMENTOS DOS PRÓXIMOS 15 DIAS
  let metaDiaria = configuracoes.metaDiariaMinima;

  // Buscar contas pendentes ordenadas por data de vencimento
  const contasPendentesOrdenadas = contas
    .filter(c => c.tipo === 'pagar' && !c.pago)
    .sort((a, b) => new Date(a.data) - new Date(b.data));

  // Calcular contas vencidas
  const contasVencidasValor = contasPendentesOrdenadas
    .filter(c => c.data < hojeStr)
    .reduce((total, c) => total + c.valor, 0);

  if (contasPendentesOrdenadas.length > 0) {
    // Data limite: hoje + 15 dias
    const dataLimite = new Date(hoje);
    dataLimite.setDate(dataLimite.getDate() + 15);
    const dataLimiteStr = dataLimite.toISOString().split('T')[0];

    // Contas que vencem nos próximos 15 dias (incluindo vencidas)
    const contasProximos15Dias = contasPendentesOrdenadas
      .filter(c => c.data <= dataLimiteStr);

    if (contasProximos15Dias.length > 0) {
      const valorTotalProximos15Dias = contasProximos15Dias.reduce((total, c) => total + c.valor, 0);
      const valorNecessario = Math.max(0, valorTotalProximos15Dias - saldoAtual);

      // Calcular dias de trabalho nos próximos 15 dias (descontando folgas programadas)
      let diasTrabalhoProximos15 = 0;
      const dataTemp = new Date(hoje);
      dataTemp.setDate(dataTemp.getDate() + 1); // Começar do próximo dia

      for (let i = 0; i < 15; i++) {
        const dataStr = dataTemp.toISOString().split('T')[0];
        const isDiaTrabalho = configuracoes.diasTrabalho.includes(dataTemp.getDay());
        const isFolgaProgramada = folgasProgramadas.some(f => f.data === dataStr);

        if (isDiaTrabalho && !isFolgaProgramada) {
          diasTrabalhoProximos15++;
        }
        dataTemp.setDate(dataTemp.getDate() + 1);
      }

      // Adicionar variável global para usar na explicação
      window.diasTrabalhoProximos15 = diasTrabalhoProximos15;

      if (diasTrabalhoProximos15 > 0) {
        const metaCalculada = valorNecessario / diasTrabalhoProximos15;

        // Se há contas vencidas, aumentar a urgência
        const multiplicadorUrgencia = contasVencidasValor > 0 ? 1.5 : 1;
        metaDiaria = Math.max(metaCalculada * multiplicadorUrgencia, configuracoes.metaDiariaMinima);
      } else {
        // Sem dias de trabalho nos próximos 15 dias - meta alta
        metaDiaria = configuracoes.metaDiariaMinima * 2;
      }
    }
  }

  // Atualizar interface
  document.getElementById('saldoAtual').textContent = `R$ ${saldoAtual.toFixed(2)}`;
  document.getElementById('faturamentoMes').textContent = `R$ ${faturamentoMes.toFixed(2)}`;
  document.getElementById('lucroLiquido').textContent = `R$ ${lucroLiquidoSimples.toFixed(2)}`;
  document.getElementById('custoPorKm').textContent = `R$ ${custoPorKm.toFixed(2)}`;
  document.getElementById('totalKmMes').textContent = `${totalKmMes.toFixed(1)} km`;
  document.getElementById('gastoGasolina').textContent = `R$ ${gastosCombustivel.toFixed(2)}`;
  document.getElementById('outrosGastos').textContent = `R$ ${outrosGastos.toFixed(2)}`;
  document.getElementById('contasVencidas').textContent = `R$ ${contasVencidasValor.toFixed(2)}`;
  document.getElementById('saldoReserva').textContent = `R$ ${saldoReserva.toFixed(2)}`;
  document.getElementById('metaDiaria').textContent = metaDiaria.toFixed(2);

  // Atualizar explicação da meta
  atualizarExplicacaoMeta(hoje, saldoAtual, metaDiaria, contasPendentes, contasPendentesOrdenadas, contasVencidasValor);

  // Mostrar alerta de contas atrasadas
  if (contasAtrasadas.length > 0) {
    let htmlAtrasadas = '';
    contasAtrasadas.forEach(conta => {
      const diasAtraso = Math.floor((hoje - new Date(conta.data)) / (1000 * 60 * 60 * 24));
      htmlAtrasadas += `
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span>${conta.descricao} - R$ ${conta.valor.toFixed(2)}</span>
                            <small class="text-danger">${diasAtraso} dias de atraso</small>
                        </div>
                    `;
    });
    document.getElementById('listaAtrasadas').innerHTML = htmlAtrasadas;
    document.getElementById('alertaAtrasadas').style.display = 'block';
  } else {
    document.getElementById('alertaAtrasadas').style.display = 'none';
  }

  // Gerar relatório detalhado se um mês foi selecionado
  if (mesSelecionado) {
    gerarRelatorioDetalhado(mesSelecionado);
  }
}

function gerarCalendario() {
  const primeiroDia = new Date(anoAtualCalendario, mesAtualCalendario, 1);
  const ultimoDia = new Date(anoAtualCalendario, mesAtualCalendario + 1, 0);
  const diasNoMes = ultimoDia.getDate();
  const diaSemanaInicio = primeiroDia.getDay();
  const hoje = new Date().toISOString().split('T')[0];

  document.getElementById('mesAnoCalendario').textContent =
    primeiroDia.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  let html = '';
  let dia = 1;

  for (let semana = 0; semana < 6; semana++) {
    html += '<tr>';
    for (let diaSemana = 0; diaSemana < 7; diaSemana++) {
      if (semana === 0 && diaSemana < diaSemanaInicio) {
        html += '<td class="calendar-day"></td>';
      } else if (dia > diasNoMes) {
        html += '<td class="calendar-day"></td>';
      } else {
        const dataAtual = `${anoAtualCalendario}-${String(mesAtualCalendario + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const contasDoDia = contas.filter(c => c.data === dataAtual);
        const registroDoDia = registrosDiarios.find(r => r.data === dataAtual);
        const folgaDoDia = folgasProgramadas.find(f => f.data === dataAtual);

        // Adicionar classes especiais
        let classeCalendario = 'calendar-day';
        if (registroDoDia) classeCalendario += ' calendar-day-uber';
        if (folgaDoDia) classeCalendario += ' calendar-day-folga';

        html += `<td class="${classeCalendario}" onclick="selecionarDia('${dataAtual}')">
                            <div class="fw-bold">${dia}</div>`;

        // Mostrar folga programada
        if (folgaDoDia) {
          html += `<span class="folga-programada">
                                <i class="bi bi-calendar-x"></i> ${folgaDoDia.motivo}
                            </span>`;
        }

        // Verificar se é dia de trabalho e se não trabalhou (apenas para dias passados)
        const isDiaTrabalho = configuracoes.diasTrabalho.includes(diaSemana);
        const isPassado = dataAtual < hoje;
        const naoTrabalhou = isDiaTrabalho && isPassado && !registroDoDia && !folgaDoDia;

        if (naoTrabalhou) {
          html += `<span class="conta-atrasada">
                                <i class="bi bi-exclamation-triangle"></i> Não trabalhou
                            </span>`;
        }

        // Mostrar faturamento Uber se existir
        if (registroDoDia) {
          const lucro = registroDoDia.faturamento - registroDoDia.gasolina;
          html += `<span class="conta-uber">
                                <i class="bi bi-car-front"></i> R$ ${registroDoDia.faturamento.toFixed(2)}
                                <br><small>Lucro: R$ ${lucro.toFixed(2)}</small>
                            </span>`;
        }

        contasDoDia.forEach(conta => {
          let classe = '';
          if (conta.tipo === 'pagar') {
            if (conta.pago) {
              classe = 'conta-paga';
            } else if (conta.data < hoje) {
              classe = 'conta-atrasada';
            } else {
              classe = 'conta-pagar';
            }
          } else if (conta.tipo === 'receber') {
            if (conta.recebido) {
              classe = 'conta-paga';
            } else {
              classe = 'conta-receber';
            }
          } else if (conta.tipo === 'reserva_entrada') {
            classe = 'conta-reserva-entrada';
          } else if (conta.tipo === 'reserva_saida') {
            classe = 'conta-reserva-saida';
          } else {
            classe = 'conta-pagar';
          }

          html += `<span class="${classe}">${conta.descricao} - R$ ${conta.valor.toFixed(2)}</span>`;
        });

        html += '</td>';
        dia++;
      }
    }
    html += '</tr>';
    if (dia > diasNoMes) break;
  }

  document.getElementById('calendarioBody').innerHTML = html;
}

function mudarMes(direcao) {
  mesAtualCalendario += direcao;
  if (mesAtualCalendario > 11) {
    mesAtualCalendario = 0;
    anoAtualCalendario++;
  } else if (mesAtualCalendario < 0) {
    mesAtualCalendario = 11;
    anoAtualCalendario--;
  }
  gerarCalendario();
}

function carregarHistoricoDiario() {
  const historico = registrosDiarios
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .slice(0, 5);

  let html = '';
  historico.forEach(registro => {
    // Corrigir problema de timezone na exibição da data
    const dataPartes = registro.data.split('-');
    const data = new Date(dataPartes[0], dataPartes[1] - 1, dataPartes[2]).toLocaleDateString('pt-BR');
    const lucro = registro.faturamento - registro.gasolina;
    const kmInfo = registro.kmRodados ? ` | Km: ${registro.kmRodados.toFixed(1)}` : '';

    html += `
                    <div class="border-bottom pb-2 mb-2">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <strong>${data}</strong>
                                <br>
                                <small class="text-muted">
                                    Faturamento: R$ ${registro.faturamento.toFixed(2)} | 
                                    Gasolina: R$ ${registro.gasolina.toFixed(2)}${kmInfo}
                                </small>
                            </div>
                            <span class="badge ${lucro >= 0 ? 'bg-success' : 'bg-danger'}">
                                R$ ${lucro.toFixed(2)}
                            </span>
                        </div>
                    </div>
                `;
  });

  document.getElementById('historicoDiario').innerHTML = html || '<p class="text-muted">Nenhum registro encontrado</p>';
}

function preencherMesesDashboard() {
  const select = document.getElementById('mesDashboard');
  const hoje = new Date();

  // Adicionar mês atual como primeira opção e selecioná-lo
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  const textoAtual = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const optionAtual = new Option(textoAtual, mesAtual);
  select.add(optionAtual);
  select.value = mesAtual; // Pré-selecionar o mês atual

  for (let i = 1; i < 12; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const valor = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    const texto = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const option = new Option(texto, valor);
    select.add(option);
  }
}

function gerarRelatorioDetalhado(mesAno) {
  if (!mesAno) return;

  const [ano, mes] = mesAno.split('-').map(Number);
  const inicioMes = new Date(ano, mes - 1, 1);
  const fimMes = new Date(ano, mes, 0);

  // Filtrar dados do mês
  const registrosMes = registrosDiarios.filter(r => {
    const dataReg = new Date(r.data);
    return dataReg >= inicioMes && dataReg <= fimMes;
  });

  const contasMes = contas.filter(c => {
    const dataConta = new Date(c.data);
    return dataConta >= inicioMes && dataConta <= fimMes;
  });

  // Calcular totais
  const totalFaturamento = registrosMes.reduce((total, r) => total + r.faturamento, 0);
  const totalGasolina = registrosMes.reduce((total, r) => total + r.gasolina, 0);
  const totalKmMes = registrosMes.reduce((total, r) => total + (r.kmRodados || 0), 0);
  const totalGastos = contasMes.filter(c => c.tipo === 'gasto').reduce((total, c) => total + c.valor, 0);
  const totalContasPagas = contasMes.filter(c => c.tipo === 'pagar').reduce((total, c) => total + c.valor, 0);
  const lucroLiquido = totalFaturamento - totalGasolina - totalGastos - totalContasPagas;
  const custoPorKmMes = totalKmMes > 0 ? totalGasolina / totalKmMes : 0;

  const html = `
                <div class="mt-4">
                    <h6>Resumo do Período</h6>
                    <ul class="list-group">
                        <li class="list-group-item d-flex justify-content-between">
                            <span>Dias trabalhados:</span>
                            <strong>${registrosMes.length} dias</strong>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>Média diária faturamento:</span>
                            <strong>R$ ${registrosMes.length > 0 ? (totalFaturamento / registrosMes.length).toFixed(2) : '0,00'}</strong>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>Média diária gasolina:</span>
                            <strong>R$ ${registrosMes.length > 0 ? (totalGasolina / registrosMes.length).toFixed(2) : '0,00'}</strong>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>Lucro médio por dia:</span>
                            <strong>R$ ${registrosMes.length > 0 ? (lucroLiquido / registrosMes.length).toFixed(2) : '0,00'}</strong>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>Total Km rodados:</span>
                            <strong>${totalKmMes.toFixed(1)} km</strong>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>Custo por Km:</span>
                            <strong>R$ ${custoPorKmMes.toFixed(2)}</strong>
                        </li>
                    </ul>
                </div>
            `;

  document.getElementById('relatorioContent').innerHTML = html;
}

function selecionarDia(data) {
  // Remover seleção anterior
  document.querySelectorAll('.calendar-day').forEach(td => {
    td.classList.remove('selected');
  });

  // Selecionar dia atual
  event.target.closest('.calendar-day').classList.add('selected');

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
                                        <i class="bi bi-calendar-x"></i> Folga Programada
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
                                <i class="bi bi-calendar-plus"></i> Marcar Folga
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
    const mensagem = htmlFolga || '<p class="text-muted">Nenhuma conta para este dia.</p>';
    document.getElementById('listaContasDia').innerHTML = mensagem;
    document.getElementById('contasDoDia').style.display = 'block';
  }
}

function marcarComoPaga(contaId) {
  const conta = contas.find(c => c.id === contaId);
  if (conta) {
    conta.pago = true;
    salvarDadosUsuario();
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

function marcarComoRecebida(contaId) {
  const conta = contas.find(c => c.id === contaId);
  if (conta) {
    conta.recebido = true;
    salvarDadosUsuario();
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

function marcarComoPendente(contaId) {
  const conta = contas.find(c => c.id === contaId);
  if (conta) {
    if (conta.tipo === 'pagar') {
      conta.pago = false;
    } else if (conta.tipo === 'receber') {
      conta.recebido = false;
    }
    salvarDadosUsuario();
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
  showConfirmDanger('Excluir Conta', 'Tem certeza que deseja excluir esta conta?<br><small class="text-muted">Esta ação não pode ser desfeita.</small>', () => {
    contas = contas.filter(c => c.id !== contaId);
    salvarDadosUsuario();
    atualizarDashboard();
    gerarCalendario();
    // Recarregar a lista do dia selecionado
    const dataSelecionada = document.getElementById('dataSelecionada').textContent;
    if (dataSelecionada) {
      const dataISO = new Date(dataSelecionada.split('/').reverse().join('-')).toISOString().split('T')[0];
      selecionarDia(dataISO);
    }
    showSuccess('Excluído!', 'Conta excluída com sucesso!');
  });
}

function adicionarFolga(data) {
  const motivo = document.getElementById(`motivoFolga_${data}`).value.trim();

  if (!motivo) {
    showWarning('Campo Obrigatório', 'Por favor, informe o motivo da folga!');
    return;
  }

  const folga = {
    id: Date.now(),
    data: data,
    motivo: motivo
  };

  folgasProgramadas.push(folga);
  salvarDadosUsuario();
  atualizarDashboard();
  gerarCalendario();

  // Recarregar a lista do dia selecionado
  selecionarDia(data);

  showSuccess('Folga Programada!', 'Folga programada com sucesso!<br><small class="text-muted">A meta diária foi recalculada automaticamente.</small>');
}

function removerFolga(data) {
  showConfirmDanger('Remover Folga', 'Tem certeza que deseja remover esta folga?', () => {
    folgasProgramadas = folgasProgramadas.filter(f => f.data !== data);
    salvarDadosUsuario();
    atualizarDashboard();
    gerarCalendario();

    // Recarregar a lista do dia selecionado
    selecionarDia(data);

    showSuccess('Folga Removida!', 'Folga removida com sucesso!<br><small class="text-muted">A meta diária foi recalculada automaticamente.</small>');
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

  const hoje = new Date();
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  const diasTrabalhoRestantes = calcularDiasTrabalhoRestantes(hoje, fimMes);
  const diasTrabalhoTotalMes = calcularDiasTrabalhoNoMes(hoje.getFullYear(), hoje.getMonth());

  const html = `
                <div class="row">
                    <div class="col-md-6">
                        <h6>Meta Diária Mínima</h6>
                        <p class="text-primary fs-5 fw-bold">R$ ${configuracoes.metaDiariaMinima.toFixed(2)}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Dias de Trabalho</h6>
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
                    <small><i class="bi bi-info-circle"></i> Meta mensal estimada: R$ ${(configuracoes.metaDiariaMinima * diasTrabalhoTotalMes).toFixed(2)}</small>
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

function atualizarExplicacaoMeta(hoje, saldoAtual, metaDiaria, valorContasPendentes, contasPendentesOrdenadas, contasVencidasValor) {
  const hojeStr = hoje.toISOString().split('T')[0];

  // Data limite: hoje + 15 dias
  const dataLimite = new Date(hoje);
  dataLimite.setDate(dataLimite.getDate() + 15);
  const dataLimiteStr = dataLimite.toISOString().split('T')[0];

  // Contas que vencem nos próximos 15 dias
  const contasProximos15Dias = contasPendentesOrdenadas.filter(c => c.data <= dataLimiteStr);
  const valorProximos15Dias = contasProximos15Dias.reduce((total, c) => total + c.valor, 0);

  let explicacao = '';
  let statusClass = 'bg-success';
  let statusTexto = 'Meta Normal';

  const saldoTexto = saldoAtual >= 0 ? `saldo de R$ ${saldoAtual.toFixed(2)}` : `déficit de R$ ${Math.abs(saldoAtual).toFixed(2)}`;

  if (contasVencidasValor > 0) {
    const contasAtrasadas = contasPendentesOrdenadas.filter(c => c.data < hojeStr);
    explicacao = `🚨 ${contasAtrasadas.length} conta(s) vencida(s) totalizando R$ ${contasVencidasValor.toFixed(2)}! Meta urgente para quitar dívidas em atraso.`;
    statusClass = 'bg-danger';
    statusTexto = '🚨 Urgente';
  } else if (contasProximos15Dias.length > 0) {
    const valorNecessario = Math.max(0, valorProximos15Dias - saldoAtual);

    // Contar folgas programadas nos próximos 15 dias
    const folgasProximos15Dias = folgasProgramadas.filter(f => {
      const dataFolga = new Date(f.data);
      const dataLimite15 = new Date(hoje);
      dataLimite15.setDate(dataLimite15.getDate() + 15);
      return dataFolga > hoje && dataFolga <= dataLimite15;
    }).length;

    const textoFolgas = folgasProximos15Dias > 0 ? ` (${folgasProximos15Dias} folga(s) programada(s))` : '';

    if (contasProximos15Dias.some(c => {
      const dias = Math.ceil((new Date(c.data) - hoje) / (1000 * 60 * 60 * 24));
      return dias <= 3;
    })) {
      explicacao = `⚡ ${contasProximos15Dias.length} conta(s) vencem nos próximos 15 dias (R$ ${valorProximos15Dias.toFixed(2)}). Com ${saldoTexto}, meta calculada para ${window.diasTrabalhoProximos15 || 0} dias de trabalho${textoFolgas}.`;
      statusClass = 'bg-warning';
      statusTexto = '⚡ Atenção';
    } else {
      explicacao = `📊 ${contasProximos15Dias.length} conta(s) vencem nos próximos 15 dias (R$ ${valorProximos15Dias.toFixed(2)}). Meta planejada para ${window.diasTrabalhoProximos15 || 0} dias de trabalho${textoFolgas}.`;
      statusClass = 'bg-info';
      statusTexto = '📊 Planejada';
    }
  } else {
    explicacao = `✅ Nenhuma conta vence nos próximos 15 dias! Meta baseada no valor mínimo configurado (R$ ${configuracoes.metaDiariaMinima.toFixed(2)}).`;
    statusClass = 'bg-success';
    statusTexto = '✅ Tranquilo';
  }

  document.getElementById('explicacaoMeta').innerHTML = explicacao;
  document.getElementById('statusMeta').className = `badge fs-6 p-2 ${statusClass}`;
  document.getElementById('statusMeta').textContent = statusTexto;
}