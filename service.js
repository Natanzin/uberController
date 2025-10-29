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
        document.getElementById('modalOverlay').addEventListener('click', function(e) {
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
        let usuarios = JSON.parse(localStorage.getItem('uberFinanceUsuarios')) || {};
        let usuarioLogado = localStorage.getItem('uberFinanceUsuarioLogado') || null;
        let primeiroAcesso = localStorage.getItem('uberFinancePrimeiroAcesso') !== 'false';
        
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
                carregarDadosUsuario();
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
        
        // Funções para mostrar mensagens de login
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
        
        // Configurar formulários de login
        function configurarFormularioLogin() {
            const formLogin = document.getElementById('formLogin');
            const formPrimeiroAcesso = document.getElementById('formPrimeiroAcesso');
            
            if (!formLogin) {
                console.error('Formulário de login não encontrado!');
                return;
            }
            
            console.log('Configurando formulários de login...');
            
            // Formulário de login principal
            formLogin.addEventListener('submit', function(e) {
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
                    
                    setTimeout(() => {
                        document.getElementById('telaLogin').style.display = 'none';
                        document.getElementById('sistemaPrincipal').style.display = 'block';
                        document.getElementById('sistemaPrincipal').classList.add('logado');
                        
                        carregarDadosUsuario();
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
                formPrimeiroAcesso.addEventListener('submit', function(e) {
                    e.preventDefault();
                    console.log('Formulário de primeiro acesso submetido');
                    
                    const novoUsuario = document.getElementById('novoUsuario').value.trim();
                    const novaSenha = document.getElementById('novaSenhaInicial').value.trim();
                    const confirmarSenha = document.getElementById('confirmarSenhaInicial').value.trim();
                    
                    // Validações
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
                    
                    // Salvar novo usuário
                    usuarios[novoUsuario] = novaSenha;
                    localStorage.setItem('uberFinanceUsuarios', JSON.stringify(usuarios));
                    localStorage.setItem('uberFinancePrimeiroAcesso', 'false');
                    
                    usuarioLogado = novoUsuario;
                    localStorage.setItem('uberFinanceUsuarioLogado', novoUsuario);
                    primeiroAcesso = false;
                    
                    console.log('Primeiro acesso configurado, entrando no sistema...');
                    
                    // Transição para o sistema
                    document.getElementById('telaPrimeiroAcesso').style.display = 'none';
                    document.getElementById('sistemaPrincipal').style.display = 'block';
                    document.getElementById('sistemaPrincipal').classList.add('logado');
                    
                    carregarDadosUsuario();
                    inicializarSistema();
                    
                    showSuccess('Bem-vindo ao UberFinance!', `Configuração concluída com sucesso!<br><small>Usuário: <strong>${novoUsuario}</strong></small>`);
                });
            }
            
            console.log('Formulários de login configurados com sucesso');
        }
        
        // Inicialização do Sistema
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

        // Inicialização v38
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM carregado v38, iniciando sistema...');
            
            // Verificar elementos essenciais
            const elementos = {
                telaLogin: document.getElementById('telaLogin'),
                sistemaPrincipal: document.getElementById('sistemaPrincipal'),
                formLogin: document.getElementById('formLogin')
            };
            
            console.log('Elementos encontrados v38:', {
                telaLogin: !!elementos.telaLogin,
                sistemaPrincipal: !!elementos.sistemaPrincipal,
                formLogin: !!elementos.formLogin
            });
            
            // Configurar formulário de login PRIMEIRO
            configurarFormularioLogin();
            
            // Depois verificar se já está logado
            verificarLogin();
            
            console.log('Sistema v38 inicializado');
        });
        
        // Formulário de Alteração de Senha v38
        document.getElementById('formAlterarSenha').addEventListener('submit', function(e) {
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

        // Formulário de contas v38
        document.getElementById('formConta').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const conta = {
                id: Date.now(),
                tipo: document.getElementById('tipoConta').value,
                descricao: document.getElementById('descricaoConta').value,
                valor: parseFloat(document.getElementById('valorConta').value),
                data: document.getElementById('dataConta').value,
                pago: false,
                recebido: false
            };
            
            contas.push(conta);
            salvarDadosUsuario();
            
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

        // Formulário diário v38
        document.getElementById('formDiario').addEventListener('submit', function(e) {
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
            
            showSuccess('Sucesso v38!', 'Registro salvo com sucesso!');
        });

        // Formulário de configurações v38
        document.getElementById('formConfiguracoes').addEventListener('submit', function(e) {
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
            
            showSuccess('Sucesso v38!', 'Configurações salvas com sucesso!');
        });

        function atualizarDashboard() {
            console.log('Atualizando dashboard v38...');
            
            const selectMes = document.getElementById('mesDashboard');
            const mesSelecionado = selectMes ? selectMes.value : '';
            let inicioMes, fimMes, hoje;
            
            hoje = new Date();
            
            if (mesSelecionado) {
                const [ano, mes] = mesSelecionado.split('-').map(Number);
                inicioMes = new Date(ano, mes - 1, 1);
                fimMes = new Date(ano, mes, 0);
            } else {
                inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            }
            
            console.log('Período v38:', inicioMes, 'até', fimMes);
            
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
            
            // NOVA LÓGICA: FOCO APENAS NA PRÓXIMA CONTA
            let metaDiaria = configuracoes.metaDiariaMinima;
            let valorNecessarioDiario = 0;
            let diasTrabalhoProximos15 = 0;
            let diasTrabalhoRestantesMes = 0;
            let explicacaoDetalhada = '';
            
            // Buscar contas pendentes ordenadas por data de vencimento
            const contasPendentesOrdenadas = contas
                .filter(c => c.tipo === 'pagar' && !c.pago)
                .sort((a, b) => new Date(a.data) - new Date(b.data));
            
            // Separar contas vencidas e futuras
            const contasVencidas = contasPendentesOrdenadas.filter(c => c.data < hojeStr);
            const contasVencidasValor = contasVencidas.reduce((total, c) => total + c.valor, 0);
            
            const contasFuturas = contasPendentesOrdenadas.filter(c => c.data >= hojeStr);
            const valorContasFuturas = contasFuturas.reduce((total, c) => total + c.valor, 0);
            
            // Calcular dias de trabalho nos próximos 15 dias (descontando folgas programadas)
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
            
            // Calcular dias de trabalho restantes no mês
            const fimMesCalculo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            const dataTempMes = new Date(hoje);
            dataTempMes.setDate(dataTempMes.getDate() + 1);
            
            while (dataTempMes <= fimMesCalculo) {
                const dataStrMes = dataTempMes.toISOString().split('T')[0];
                const isDiaTrabalhoMes = configuracoes.diasTrabalho.includes(dataTempMes.getDay());
                const isFolgaProgramadaMes = folgasProgramadas.some(f => f.data === dataStrMes);
                
                if (isDiaTrabalhoMes && !isFolgaProgramadaMes) {
                    diasTrabalhoRestantesMes++;
                }
                dataTempMes.setDate(dataTempMes.getDate() + 1);
            }
            
            // FOCO APENAS NA PRÓXIMA CONTA (primeira da lista)
            if (contasPendentesOrdenadas.length > 0) {
                const proximaConta = contasPendentesOrdenadas[0];
                const dataVencimento = new Date(proximaConta.data);
                const diasAteVencimento = Math.max(1, Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24)));
                
                // Calcular dias de trabalho até o vencimento da próxima conta
                let diasTrabalhoAteVencimento = 0;
                const dataTemp = new Date(hoje);
                dataTemp.setDate(dataTemp.getDate() + 1);
                
                while (dataTemp <= dataVencimento) {
                    const dataStr = dataTemp.toISOString().split('T')[0];
                    const isDiaTrabalho = configuracoes.diasTrabalho.includes(dataTemp.getDay());
                    const isFolgaProgramada = folgasProgramadas.some(f => f.data === dataStr);
                    
                    if (isDiaTrabalho && !isFolgaProgramada) {
                        diasTrabalhoAteVencimento++;
                    }
                    dataTemp.setDate(dataTemp.getDate() + 1);
                }
                
                // Calcular valor necessário considerando saldo atual (apenas para a próxima conta)
                const valorNecessarioProximaConta = Math.max(0, proximaConta.valor - saldoAtual);
                
                // Meta diária = valor necessário ÷ dias de trabalho até o vencimento
                if (diasTrabalhoAteVencimento > 0) {
                    metaDiaria = Math.max(valorNecessarioProximaConta / diasTrabalhoAteVencimento, configuracoes.metaDiariaMinima);
                    valorNecessarioDiario = valorNecessarioProximaConta / diasTrabalhoAteVencimento;
                } else {
                    // Se não há dias de trabalho, usar valor total
                    metaDiaria = valorNecessarioProximaConta;
                    valorNecessarioDiario = valorNecessarioProximaConta;
                }
                
                // Criar explicação detalhada focada apenas na próxima conta
                const dataVencimentoTexto = dataVencimento.toLocaleDateString('pt-BR');
                const diasTexto = diasTrabalhoAteVencimento === 1 ? 'dia' : 'dias';
                
                if (proximaConta.data < hojeStr) {
                    explicacaoDetalhada = `🚨 Próximo vencimento: ${proximaConta.descricao} VENCIDA desde ${dataVencimentoTexto}. Você precisa de R$ ${valorNecessarioProximaConta.toFixed(2)} em ${diasTrabalhoAteVencimento} ${diasTexto} de trabalho. Por dia deve fazer R$ ${metaDiaria.toFixed(2)} para quitar esta conta.`;
                } else {
                    explicacaoDetalhada = `📅 Próximo vencimento: ${proximaConta.descricao} em ${dataVencimentoTexto}. Você precisa de R$ ${valorNecessarioProximaConta.toFixed(2)} em ${diasTrabalhoAteVencimento} ${diasTexto} de trabalho. Por dia deve fazer R$ ${metaDiaria.toFixed(2)} para quitar esta conta.`;
                }
                
                // Salvar dados para usar no card de contas futuras
                window.diasTrabalhoAteVencimento = diasTrabalhoAteVencimento;
                window.contaMaisProxima = proximaConta;
            } else {
                explicacaoDetalhada = `✅ Nenhuma conta pendente! Meta baseada no valor mínimo configurado de R$ ${configuracoes.metaDiariaMinima.toFixed(2)} por dia.`;
            }
            
            // Adicionar variáveis globais para usar na explicação
            window.diasTrabalhoProximos15 = diasTrabalhoProximos15;
            window.diasTrabalhoRestantesMes = diasTrabalhoRestantesMes;
            window.valorContasFuturas = valorContasFuturas;
            window.contasFuturas = contasFuturas;
            window.valorNecessarioDiario = valorNecessarioDiario;
            window.explicacaoDetalhada = explicacaoDetalhada;
            
            // Atualizar interface
            console.log('Atualizando elementos da interface v38...');
            console.log('Dados calculados v38:', {
                saldoAtual,
                faturamentoMes,
                lucroLiquidoSimples,
                custoPorKm,
                totalKmMes,
                gastosCombustivel,
                outrosGastos,
                contasVencidasValor,
                saldoReserva,
                metaDiaria
            });
            
            const elementos = {
                'saldoAtual': `R$ ${saldoAtual.toFixed(2)}`,
                'faturamentoMes': `R$ ${faturamentoMes.toFixed(2)}`,
                'lucroLiquido': `R$ ${lucroLiquidoSimples.toFixed(2)}`,
                'custoPorKm': `R$ ${custoPorKm.toFixed(2)}`,
                'totalKmMes': `${totalKmMes.toFixed(1)} km`,
                'gastoGasolina': `R$ ${gastosCombustivel.toFixed(2)}`,
                'outrosGastos': `R$ ${outrosGastos.toFixed(2)}`,
                'contasVencidas': `R$ ${contasVencidasValor.toFixed(2)}`,
                'saldoReserva': `R$ ${saldoReserva.toFixed(2)}`,
                'metaDiaria': metaDiaria.toFixed(2)
            };
            
            Object.keys(elementos).forEach(id => {
                const elemento = document.getElementById(id);
                if (elemento) {
                    elemento.textContent = elementos[id];
                } else {
                    console.error(`Elemento ${id} não encontrado v38`);
                }
            });
            
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
            
            // Mostrar card de contas vencidas com cálculos detalhados
            if (contasVencidasValor > 0) {
                // Calcular meta urgente para contas vencidas
                const valorNecessarioVencidas = Math.max(0, contasVencidasValor - saldoAtual);
                const metaUrgenteVencidas = diasTrabalhoProximos15 > 0 ? valorNecessarioVencidas / diasTrabalhoProximos15 : contasVencidasValor;
                
                // Atualizar elementos do card
                document.getElementById('totalVencido').textContent = `R$ ${contasVencidasValor.toFixed(2)}`;
                document.getElementById('diasTrabalhoVencidas').textContent = `${diasTrabalhoProximos15} dias`;
                document.getElementById('metaUrgente').textContent = `R$ ${metaUrgenteVencidas.toFixed(2)}`;
                
                // Explicação do cálculo
                const saldoTextoVencidas = saldoAtual >= 0 ? `saldo atual de R$ ${saldoAtual.toFixed(2)}` : `déficit de R$ ${Math.abs(saldoAtual).toFixed(2)}`;
                const calculoExplicacao = diasTrabalhoProximos15 > 0 
                    ? `(R$ ${contasVencidasValor.toFixed(2)} vencido - ${saldoTextoVencidas}) ÷ ${diasTrabalhoProximos15} dias = R$ ${metaUrgenteVencidas.toFixed(2)}/dia`
                    : `Sem dias de trabalho nos próximos 15 dias - valor total: R$ ${contasVencidasValor.toFixed(2)}`;
                
                document.getElementById('calculoVencidas').innerHTML = calculoExplicacao;
                
                // Lista detalhada das contas vencidas
                let htmlContasVencidas = '<h6 class="mt-3 mb-2">Contas Vencidas v38:</h6>';
                contasAtrasadas.forEach(conta => {
                    const diasAtraso = Math.floor((hoje - new Date(conta.data)) / (1000 * 60 * 60 * 24));
                    const dataVencimento = new Date(conta.data).toLocaleDateString('pt-BR');
                    htmlContasVencidas += `
                        <div class="d-flex justify-content-between align-items-center p-2 mb-2 bg-light rounded border-start border-danger border-3">
                            <div>
                                <strong>${conta.descricao}</strong>
                                <br><small class="text-muted">Vencimento: ${dataVencimento}</small>
                            </div>
                            <div class="text-end">
                                <div class="text-danger fw-bold">R$ ${conta.valor.toFixed(2)}</div>
                                <small class="text-danger">${diasAtraso} dias atraso</small>
                            </div>
                        </div>
                    `;
                });
                
                document.getElementById('listaContasVencidas').innerHTML = htmlContasVencidas;
                document.getElementById('cardContasVencidas').style.display = 'block';
            } else {
                document.getElementById('cardContasVencidas').style.display = 'none';
            }
            
            // Mostrar card de contas futuras com informações claras e explicativas
            if (valorContasFuturas > 0) {
                // Calcular meta baseada nos dias de trabalho configurados
                const valorNecessarioTodasContas = Math.max(0, valorContasFuturas - saldoAtual);
                const metaTodasContasRestantesMes = diasTrabalhoRestantesMes > 0 ? valorNecessarioTodasContas / diasTrabalhoRestantesMes : valorNecessarioTodasContas;
                
                // Calcular meta baseada na configuração mínima
                const metaConfiguradaMes = configuracoes.metaDiariaMinima;
                const totalMetaConfiguradaMes = metaConfiguradaMes * diasTrabalhoRestantesMes;
                
                // Determinar qual meta usar (a maior entre necessária e configurada)
                const metaRecomendada = Math.max(metaTodasContasRestantesMes, metaConfiguradaMes);
                
                // Atualizar elementos do card com informações claras
                document.getElementById('totalFuturo').textContent = `R$ ${valorContasFuturas.toFixed(2)}`;
                document.getElementById('diasTrabalhoMes').textContent = `${diasTrabalhoRestantesMes} dias`;
                document.getElementById('metaNecessariaFutura').textContent = `R$ ${metaTodasContasRestantesMes.toFixed(2)}`;
                document.getElementById('metaPlanejada').textContent = `R$ ${metaRecomendada.toFixed(2)}`;
                
                // Criar explicação detalhada e clara
                let htmlContasFuturas = `
                    <div class="alert alert-info mb-3">
                        <h6><i class="bi bi-info-circle"></i> Explicação dos Cálculos:</h6>
                        <ul class="mb-0">
                            <li><strong>Total Futuro:</strong> Soma de todas as contas pendentes (R$ ${valorContasFuturas.toFixed(2)})</li>
                            <li><strong>Dias de Trabalho:</strong> Baseado na sua configuração de dias da semana (${diasTrabalhoRestantesMes} dias restantes no mês)</li>
                            <li><strong>Meta Necessária:</strong> (Total - Saldo Atual) ÷ Dias de Trabalho = R$ ${metaTodasContasRestantesMes.toFixed(2)}/dia</li>
                            <li><strong>Meta Configurada:</strong> Valor mínimo definido nas configurações = R$ ${metaConfiguradaMes.toFixed(2)}/dia</li>
                            <li><strong>Meta Recomendada:</strong> A maior entre necessária e configurada = R$ ${metaRecomendada.toFixed(2)}/dia</li>
                        </ul>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="text-center p-3 bg-success text-white rounded">
                                <h6>Se trabalhar todos os dias configurados</h6>
                                <h4>R$ ${totalMetaConfiguradaMes.toFixed(2)}</h4>
                                <small>Meta mínima × ${diasTrabalhoRestantesMes} dias</small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="text-center p-3 ${valorNecessarioTodasContas > totalMetaConfiguradaMes ? 'bg-warning' : 'bg-success'} text-white rounded">
                                <h6>Valor necessário para quitar tudo</h6>
                                <h4>R$ ${valorNecessarioTodasContas.toFixed(2)}</h4>
                                <small>${valorNecessarioTodasContas > totalMetaConfiguradaMes ? 'Acima da meta configurada' : 'Dentro da meta configurada'}</small>
                            </div>
                        </div>
                    </div>
                    
                    <h6 class="mt-3 mb-2">📋 Lista de Contas Futuras:</h6>
                `;
                
                // Lista simplificada das contas futuras
                contasFuturas.forEach((conta, index) => {
                    const diasRestantes = Math.ceil((new Date(conta.data) - hoje) / (1000 * 60 * 60 * 24));
                    const dataVencimento = new Date(conta.data).toLocaleDateString('pt-BR');
                    
                    // Calcular dias de trabalho até esta conta específica
                    let diasTrabalhoAteConta = 0;
                    const dataTemp = new Date(hoje);
                    dataTemp.setDate(dataTemp.getDate() + 1);
                    const dataVencimentoConta = new Date(conta.data);
                    
                    while (dataTemp <= dataVencimentoConta) {
                        const dataStr = dataTemp.toISOString().split('T')[0];
                        const isDiaTrabalho = configuracoes.diasTrabalho.includes(dataTemp.getDay());
                        const isFolgaProgramada = folgasProgramadas.some(f => f.data === dataStr);
                        
                        if (isDiaTrabalho && !isFolgaProgramada) {
                            diasTrabalhoAteConta++;
                        }
                        dataTemp.setDate(dataTemp.getDate() + 1);
                    }
                    
                    let corBorda = 'border-info';
                    let corTexto = 'text-info';
                    let urgencia = '';
                    
                    if (diasRestantes <= 3) {
                        corBorda = 'border-danger';
                        corTexto = 'text-danger';
                        urgencia = '🚨 URGENTE';
                    } else if (diasRestantes <= 7) {
                        corBorda = 'border-warning';
                        corTexto = 'text-warning';
                        urgencia = '⚠️ ATENÇÃO';
                    }
                    
                    const metaIndividual = diasTrabalhoAteConta > 0 ? (conta.valor / diasTrabalhoAteConta) : conta.valor;
                    
                    htmlContasFuturas += `
                        <div class="d-flex justify-content-between align-items-center p-3 mb-2 bg-light rounded border-start ${corBorda} border-4">
                            <div>
                                <div class="d-flex align-items-center gap-2">
                                    <strong>${conta.descricao}</strong>
                                    ${urgencia ? `<span class="badge bg-danger">${urgencia}</span>` : ''}
                                </div>
                                <small class="text-muted d-block">📅 Vencimento: ${dataVencimento}</small>
                                <small class="text-info d-block">⏰ ${diasTrabalhoAteConta} dias de trabalho disponíveis (${diasRestantes} dias corridos)</small>
                                <small class="text-success d-block">💰 Meta individual: R$ ${metaIndividual.toFixed(2)}/dia</small>
                            </div>
                            <div class="text-end">
                                <div class="${corTexto} fw-bold fs-5">R$ ${conta.valor.toFixed(2)}</div>
                                <small class="${corTexto}">Posição: ${index + 1}ª</small>
                            </div>
                        </div>
                    `;
                });
                
                // Resumo final
                htmlContasFuturas += `
                    <div class="alert alert-primary mt-3">
                        <h6><i class="bi bi-lightbulb"></i> Resumo Estratégico:</h6>
                        <p class="mb-1"><strong>📊 Situação:</strong> ${contasFuturas.length} conta(s) pendente(s) totalizando R$ ${valorContasFuturas.toFixed(2)}</p>
                        <p class="mb-1"><strong>⏱️ Tempo:</strong> ${diasTrabalhoRestantesMes} dias de trabalho restantes no mês</p>
                        <p class="mb-1"><strong>💼 Saldo atual:</strong> R$ ${saldoAtual.toFixed(2)} ${saldoAtual >= 0 ? '(positivo)' : '(negativo)'}</p>
                        <p class="mb-0"><strong>🎯 Recomendação:</strong> Trabalhe R$ ${metaRecomendada.toFixed(2)} por dia para ${valorNecessarioTodasContas <= totalMetaConfiguradaMes ? 'manter' : 'superar'} suas metas</p>
                    </div>
                `;
                
                document.getElementById('listaContasFuturas').innerHTML = htmlContasFuturas;
                document.getElementById('cardContasFuturas').style.display = 'block';
            } else {
                document.getElementById('cardContasFuturas').style.display = 'none';
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
                primeiroDia.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) + ' v38';
            
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
            
            document.getElementById('historicoDiario').innerHTML = html || '<p class="text-muted">Nenhum registro encontrado v38</p>';
        }

        function preencherMesesDashboard() {
            const select = document.getElementById('mesDashboard');
            if (!select) {
                console.error('Elemento mesDashboard não encontrado v38');
                return;
            }
            
            // Limpar opções existentes
            select.innerHTML = '<option value="">Selecione o mês...</option>';
            
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
            
            console.log('Meses preenchidos v38, mês atual selecionado:', mesAtual);
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
                    <h6>Resumo do Período v38</h6>
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
            showConfirmDanger('Excluir Conta v38', 'Tem certeza que deseja excluir esta conta?<br><small class="text-muted">Esta ação não pode ser desfeita.</small>', () => {
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
                showSuccess('Excluído v38!', 'Conta excluída com sucesso!');
            });
        }

        function adicionarFolga(data) {
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
            salvarDadosUsuario();
            atualizarDashboard();
            gerarCalendario();
            
            // Recarregar a lista do dia selecionado
            selecionarDia(data);
            
            showSuccess('Folga Programada v38!', 'Folga programada com sucesso!<br><small class="text-muted">A meta diária foi recalculada automaticamente.</small>');
        }

        function removerFolga(data) {
            showConfirmDanger('Remover Folga v38', 'Tem certeza que deseja remover esta folga?', () => {
                folgasProgramadas = folgasProgramadas.filter(f => f.data !== data);
                salvarDadosUsuario();
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
        