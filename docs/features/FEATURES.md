# Features - Especificacao

> ATUALIZADO com base em docs/GPT-CHAT-INSIGHTS.md
> Mudancas: Sintomas agora e P0, check-in matinal e P0, calculo nutricional e P0,
> novas features: timer pos-refeicao, alimentos salvos, correlacao automatica.

## P0: Essencial (Fase 1)

### F01: Registro de Glicemia
Tela: /registrar/glicemia

A feature mais importante. Precisa ser RAPIDO -- menos de 10 segundos.

- Campo numerico grande (teclado numerico)
- Selecao do tipo: Jejum | Pos-cafe | Pos-almoco | Pos-jantar
- Auto-detectar horario e sugerir o tipo (manha = jejum, etc.)
- NOVO: Campo "minutos apos refeicao" (ela mede em 60, 75, 80 min - varia)
- Timestamp automatico (com opcao de editar)
- Feedback visual imediato: verde (ok) / vermelho (acima do limite)
- Campo de notas opcional
- Salvar e voltar ao dashboard

Limites default (configuraveis no perfil):
- Jejum: menor que 95 mg/dL = normal, 95 ou mais = alerta
- Pos-prandial: menor que 140 mg/dL = normal, 140 ou mais = alerta

### F02: Registro de Refeicao
Tela: /registrar/refeicao

- Periodo: Cafe | Almoco | Jantar | Lanche
- Adicionar itens individualmente (nome + gramas ou descricao)
- NOVO: Selecionar de alimentos salvos para preenchimento rapido
- Calorias e macros por item (calculados automaticamente se alimento salvo)
- Totais da refeicao calculados automaticamente
- Timestamp automatico
- NOVO: Botao "iniciar timer" para lembrar de medir glicemia em 1h

### F03: Registro de Peso
Tela: /registrar/peso

- Campo decimal (ex: 72.5 kg)
- Timestamp automatico
- Frequencia menor -- 1-2x por semana

### F04: Check-in Matinal (NOVO - era sintomas em P2)
Tela: / (home, ao abrir o app de manha)

Baseado no ritual natural que a usuaria ja fazia no chat do GPT.
Aparece como primeira interacao do dia se ainda nao foi preenchido.

- Glicemia de jejum: campo numerico mg/dL
- Rigidez matinal: slider 0-10
- Dor: slider 0-10
- Energia: slider 0-10
- Nausea: sim/nao
- Observacao livre (opcional): texto
- Salvar tudo de uma vez

### F05: Dashboard
Tela: / (home)

Resumo do dia atual:
- Check-in matinal (se preenchido) com scores visuais
- Glicemias do dia (com indicador de status verde/vermelho)
- Refeicoes registradas com calorias totais
- Peso mais recente
- Alerta se alguma glicemia acima do limite
- Semana gestacional atual (calculada)
- Totais do dia: calorias, carboidratos, proteinas
- Botoes rapidos: "+ Glicemia", "+ Refeicao", "+ Peso"

### F06: Autenticacao
- Login com email/senha (Supabase Auth)
- Apenas 1 usuaria
- Sessao persistente

### F07: Calculo Nutricional Automatico (NOVO como P0)
Funcao #1 mais usada no chat do GPT. Essencial desde o dia 1.

- Ao registrar itens da refeicao, calcular calorias e macros
- Se o alimento esta na lista de salvos, usar dados do rotulo
- Se nao esta, a IA estima (chamada rapida a API)
- Exibir totais por refeicao e por dia
- Destacar carboidratos (critico para diabetes gestacional)

---

## P1: Importante (Fase 2)

### F08: Analise com IA
Tela: /analise

Interface tipo chat. A IA recebe dados reais do banco.

- Input de texto para perguntar
- IA recebe automaticamente dados dos ultimos 7 dias
- Resposta em streaming (Vercel AI SDK)
- NOVO: Incluir daily_checkins no contexto (rigidez, dor, energia)
- NOVO: Correlacionar sintomas com alimentacao nas respostas
- Sugestoes de perguntas rapidas:
  - "Como esta minha glicemia esta semana?"
  - "Relacao entre o que comi e como me sinto?"
  - "Meu jantar esta afetando minha rigidez matinal?"
  - "O que posso melhorar nas refeicoes?"
  - "Resumo geral: como estou?"

### F09: Alertas Visuais
- Icone/cor quando glicemia acima do limite
- Contagem de dias consecutivos acima do limite
- NOVO: Alerta quando rigidez matinal piora por 3+ dias

### F10: Timer Pos-Refeicao (NOVO)
- Ao registrar refeicao, opcao de "iniciar timer"
- Contagem regressiva visual (padrao 60 min, configuravel)
- Notificacao: "Hora de medir a glicemia!"
- Ao abrir da notificacao, vai direto para tela de registro de glicemia
- Registra automaticamente minutes_after_meal

### F11: Alimentos Salvos (NOVO)
Tela: /perfil/alimentos

- Cadastrar alimentos frequentes com dados do rotulo
- Nome, calorias/100g, carbs/100g, proteina/100g, gordura/100g
- Porcao padrao em gramas
- Na tela de refeicao: buscar e selecionar da lista
- Ajustar gramas e calcular proporcionalmente

---

## P2: Desejavel (Fase 3)

### F12: Graficos de Tendencia
Tela: /historico

- Grafico de linha: glicemia ao longo do tempo (7/14/30 dias)
- Separacao por tipo (jejum vs pos-prandial)
- Linha de referencia dos limites
- NOVO: Grafico de rigidez/dor sobrepostos com glicemia
- NOVO: Grafico de peso ao longo da gestacao
- Usar recharts

### F13: Historico Navegavel
Tela: /historico

- Lista de registros por dia (tipo diario)
- Filtro por tipo de registro
- Navegar por datas (calendario)
- Editar/excluir registros antigos
- NOVO: Comparacao "ontem vs hoje"

### F14: Correlacao Automatica (NOVO)
A funcao mais valiosa do chat, agora com dados reais.

- Cruzar jantar com rigidez matinal do dia seguinte
- Cruzar tipo de carboidrato com pico glicemico
- Exibir insights visuais: "Dias com jantar pesado: rigidez media 6"
- Identificar alimentos "gatilho" para picos de glicemia

### F15: Semana Gestacional
- Configurar no perfil
- App calcula semana atual automaticamente
- Exibir no dashboard e relatorios

### F16: Exportar Dados
- Exportar como CSV
- Filtro por periodo
- Incluir: glicemias, refeicoes, peso, check-ins, sintomas

---

## P3: Futuro

### F17: Resumo Semanal Automatico
- Gerado pela IA toda segunda
- Media de glicemia, contagem de alertas, peso, padroes
- NOVO: Incluir tendencia de sintomas da espondilite

### F18: Sugestoes de Refeicoes
- Baseadas no historico e nos picos
- "Quando voce come X, sua glicemia tende a subir"
- NOVO: "Quando voce janta X, sua rigidez tende a piorar"

### F19: Relatorio para Medico (PDF)
- Resumo formatado com todos os dados
- Graficos inclusos
- NOVO: Secao separada para reumatologista (sintomas espondilite)
- Pronto para imprimir ou enviar por WhatsApp

### F20: Notificacoes de Lembrete
- Push notifications para lembrar de medir
- Configuraveis por horario

### F21: Modo Consulta (NOVO)
- Resumo de 1 pagina: sintomas, glicemia, alimentacao, gatilhos, melhorias
- Otimizado para mostrar ao medico no celular durante consulta
