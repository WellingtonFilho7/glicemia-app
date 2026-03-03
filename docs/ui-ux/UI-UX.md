# UI/UX - Design Mobile-First

> ATUALIZADO com base em docs/GPT-CHAT-INSIGHTS.md
> Mudancas: Check-in matinal como tela principal, timer pos-refeicao,
> alimentos salvos no fluxo de refeicao, dashboard com sintomas.

## Principios de design

### 1. Velocidade acima de tudo
Ela registra 4 glicemias + 3 refeicoes + 1 check-in por dia.
Se nao for MAIS RAPIDO que abrir o chat do GPT, ela volta pro GPT.
Meta: Registrar glicemia em menos de 10 segundos.

### 2. Clareza visual imediata
Bater o olho e saber: "estou bem hoje ou nao?"
- Verde = dentro do limite
- Vermelho/laranja = acima do limite
- Sem ambiguidade

### 3. Touch-friendly
- Botoes grandes (minimo 44x44px, ideal 48x48px)
- Teclado numerico para glicemia e peso
- Sliders para escalas de sintomas
- Espacamento generoso

### 4. Empatica e calma
- O app nao deve gerar ansiedade
- Alertas sao informativos, nao alarmistas
- Tom visual: acolhedor, limpo, confiavel

## Paleta de cores sugerida

```css
:root {
  --bg-primary: #FAFAF9;
  --bg-card: #FFFFFF;
  --text-primary: #1C1917;
  --text-secondary: #78716C;
  --status-good: #16A34A;
  --status-good-bg: #F0FDF4;
  --status-warning: #EA580C;
  --status-warning-bg: #FFF7ED;
  --status-info: #2563EB;
  --accent: #7C3AED;
  --accent-light: #EDE9FE;
  --border: #E7E5E4;
}
```

## Telas principais

### Check-in Matinal (NOVO - primeira coisa que ela ve)
Aparece ao abrir o app de manha se ainda nao foi preenchido hoje.
Espelha o ritual natural que ela ja fazia no chat.

```
+---------------------------+
|  Bom dia! Como voce       |
|  esta hoje?       Sem 28  |
|                           |
|  Glicemia jejum:          |
|  +----------------+       |
|  |    [___]       | mg/dL |
|  +----------------+       |
|                           |
|  Rigidez matinal:         |
|  o---o---o---O---o---o    |
|  0               10      |
|              [6]          |
|                           |
|  Dor:                     |
|  o---o---O---o---o---o    |
|  0               10      |
|          [4]              |
|                           |
|  Energia:                 |
|  o---o---o---O---o---o    |
|  0               10      |
|              [5]          |
|                           |
|  Nausea?  [Nao] [Sim]    |
|                           |
|  Algo mais? (opcional)    |
|  +--------------------+   |
|  |                    |   |
|  +--------------------+   |
|                           |
|  +--------------------+   |
|  |    REGISTRAR       |   |
|  +--------------------+   |
+---------------------------+
```

### Dashboard (Home - apos check-in)
```
+---------------------------+
|  Sem 28        02/03/2026 |
|  Bom dia, [Nome]         |
+---------------------------+
|                           |
|  COMO VOCE ESTA HOJE      |
|  Rigidez: 6  Dor: 4      |
|  Energia: 5  Nausea: nao |
|                           |
+---------------------------+
|                           |
|  GLICEMIA HOJE            |
|  +------+ +------+       |
|  |Jejum | | Cafe |       |
|  | 88 OK| | 96 OK|       |
|  +------+ +------+       |
|  +------+ +------+       |
|  |Almoco| |Jantar|       |
|  |148 !!| |  --  |       |
|  +------+ +------+       |
|                           |
+---------------------------+
|                           |
|  REFEICOES HOJE           |
|  Cafe: 356 kcal          |
|  Almoco: 620 kcal        |
|  Total ate agora: 976kcal|
|  Carbs: 93g | Prot: 53g  |
|                           |
+---------------------------+
|                           |
|  PESO: 74.2 kg (10/03)   |
|                           |
+---------------------------+
|  [+Glicemia] [+Refeicao] |
|  [+Peso]     [Analise IA]|
+---------------------------+
|  Inicio | Hist | IA | Eu |
+---------------------------+
```

### Registro de Glicemia
```
+---------------------------+
|  <- Registrar Glicemia    |
|                           |
|  +-------------------+    |
|  |                   |    |
|  |      [ 132 ]      |    |
|  |      mg/dL        |    |
|  |                   |    |
|  +-------------------+    |
|                           |
|  Medicao:                 |
|  (o) Jejum                |
|  ( ) Pos-cafe             |
|  ( ) Pos-almoco           |
|  ( ) Pos-jantar           |
|                           |
|  Tempo apos refeicao:     |
|  +------+                 |
|  | [60] | minutos         |
|  +------+                 |
|  (oculto se tipo=jejum)   |
|                           |
|  Nota (opcional)          |
|  +-------------------+    |
|  |                   |    |
|  +-------------------+    |
|                           |
|  +-------------------+    |
|  |     SALVAR        |    |
|  +-------------------+    |
+---------------------------+
```

### Registro de Refeicao (ATUALIZADO)
```
+---------------------------+
|  <- Registrar Refeicao    |
|                           |
|  Periodo:                 |
|  [Cafe][Almoco][Jantar]   |
|  [Lanche]                 |
|                           |
|  Itens:                   |
|  +-------------------+    |
|  | Pao de inhame 57g |  X |
|  | 120kcal 22g carb  |    |
|  +-------------------+    |
|  +-------------------+    |
|  | 2 ovos cozidos    |  X |
|  | 156kcal 1g carb   |    |
|  +-------------------+    |
|                           |
|  [+ Adicionar item]       |
|  [+ Dos meus alimentos]   |
|                           |
|  Total: 276 kcal          |
|  Carbs: 23g Prot: 16g     |
|                           |
|  +-------------------+    |
|  | SALVAR REFEICAO    |    |
|  +-------------------+    |
|  [Iniciar timer 1h]       |
+---------------------------+
```

### Tela de Analise (IA)
```
+---------------------------+
|  <- Analise com IA        |
|                           |
|  +-------------------+    |
|  | Como esta minha    |    |
|  | glicemia?          |    |
|  +-------------------+    |
|  +-------------------+    |
|  | Relacao comida e   |    |
|  | rigidez?           |    |
|  +-------------------+    |
|  +-------------------+    |
|  | O que melhorar?    |    |
|  +-------------------+    |
|                           |
|  +------------------+     |
|  | Sua glicemia de   |     |
|  | jejum esta com    |     |
|  | media de 99 esta  |     |
|  | semana, um pouco  |     |
|  | acima do ideal... |     |
|  |                   |     |
|  | Notei que nos     |     |
|  | dias em que voce  |     |
|  | jantou mais amido |     |
|  | sua rigidez no    |     |
|  | dia seguinte foi  |     |
|  | maior (6.5 vs 4)  |     |
|  +------------------+     |
|                           |
|  +-------------------+    |
|  | Pergunte algo...  |[>] |
|  +-------------------+    |
+---------------------------+
```

## Navegacao

Bottom tab navigation (4 tabs):
1. Inicio - Dashboard + check-in
2. Historico - Graficos e registros
3. IA - Analise inteligente
4. Perfil - Config, alimentos salvos, exportar

Botoes de registro rapido no dashboard (FAB ou botoes fixos).

## Componentes

```
components/
  ui/                         # shadcn/ui base
  checkin/
    MorningCheckin.tsx         # Formulario check-in matinal
    SymptomSlider.tsx          # Slider 0-10 reutilizavel
  glucose/
    GlucoseCard.tsx            # Card no dashboard
    GlucoseInput.tsx           # Input numerico grande
    GlucoseTypeSelector.tsx    # Seletor de tipo
    GlucoseBadge.tsx           # Badge verde/vermelho
    PostMealTimer.tsx          # Timer pos-refeicao
  meals/
    MealCard.tsx               # Card no dashboard
    MealForm.tsx               # Form de registro
    MealItemRow.tsx            # Item individual
    SavedFoodPicker.tsx        # Selecionar de alimentos salvos
  charts/
    GlucoseTrendChart.tsx      # Grafico de tendencia
    SymptomTrendChart.tsx      # Rigidez/dor ao longo do tempo
    CorrelationChart.tsx       # Jantar vs rigidez
    WeightChart.tsx            # Peso
  ai/
    AiChat.tsx                 # Interface de chat
    AiMessage.tsx              # Bubble de mensagem
    QuickPrompts.tsx           # Botoes de perguntas rapidas
  layout/
    BottomNav.tsx              # Navegacao inferior
    Header.tsx                 # Header com semana gestacional
    QuickActions.tsx           # Botoes de acao rapida
```

## Fluxo do dia (como ela vai usar)

```
MANHA:
  Abre app -> Check-in matinal (jejum + rigidez + dor + energia) -> Dashboard

CAFE DA MANHA:
  Dashboard -> + Refeicao -> Registra itens -> Salva -> [Iniciar timer]
  ... 1h depois ...
  Timer notifica -> + Glicemia -> 96 (60min) -> Verde, ok!

ALMOCO:
  Dashboard -> + Refeicao -> Registra -> [Timer]
  ... 1h depois ...
  + Glicemia -> 148 (75min) -> Vermelho, atencao!

JANTAR:
  Dashboard -> + Refeicao -> Registra -> [Timer]
  ... 1h depois ...
  + Glicemia -> 104 (60min) -> Verde!

QUALQUER MOMENTO:
  Tab IA -> "Como estou esta semana?" -> Analise com dados reais

FIM DO DIA:
  Dashboard mostra resumo completo do dia
```

## Responsividade

- Mobile (< 768px): Layout padrao, single column -- PRIORIDADE ABSOLUTA
- Tablet/Desktop (>= 768px): 2 colunas no dashboard, sidebar nav
