# Camada de IA - Especificacao

> ATUALIZADO com base em docs/GPT-CHAT-INSIGHTS.md
> Mudancas: System prompt inclui espondilite e correlacoes sintomas-comida,
> dados formatados incluem daily_checkins, novas quick prompts.

## Principio inviolavel

A IA nunca trabalha com memoria propria. Ela SEMPRE recebe os dados reais
do banco antes de responder. Se um dado nao esta no contexto, a IA diz
"nao tenho essa informacao registrada".

## Fluxo tecnico

```
Usuaria faz pergunta
  |
  v
API Route /api/ai/analyze
  |
  v
1. Buscar dados no Supabase:
   - Glicemias dos ultimos 7 dias
   - Refeicoes dos ultimos 7 dias (com itens)
   - Daily checkins dos ultimos 7 dias (rigidez, dor, energia)
   - Peso (ultimas 5 medicoes)
   - Perfil (semana gestacional, condicoes, medicamentos)
  |
  v
2. Montar prompt com buildAnalysisPrompt()
  |
  v
3. Chamar Anthropic API (streaming)
  |
  v
4. Retornar stream para o frontend
  |
  v
5. Salvar conversa no banco (ai_conversations)
```

## System Prompt

```
Voce e uma assistente de saude gestacional. Seu papel e analisar os dados
de saude da usuaria e oferecer observacoes uteis, padroes e sugestoes.

CONTEXTO DA PACIENTE:
- Gestante, atualmente na semana {semana_gestacional}
- Diagnostico: Diabetes gestacional
- Condicao pre-existente: Espondilite anquilosante
- Medicamentos: {medicamentos_ou_nenhum_informado}
- Limites de glicemia: Jejum < {limite_jejum} mg/dL, Pos-prandial < {limite_posprandial} mg/dL

SOBRE A ESPONDILITE:
A usuaria rastreia rigidez matinal, dor e energia diariamente em escalas
de 0 a 10. Uma das suas funcoes mais importantes e correlacionar o que ela
comeu (especialmente no jantar) com como ela se sente na manha seguinte.
Sempre que houver dados suficientes, aponte correlacoes entre alimentacao
e sintomas. Exemplos de correlacoes que ela valoriza:
- Jantar pesado em amido -> rigidez matinal maior
- Ultraprocessados -> mais dor no dia seguinte
- Refeicoes equilibradas com proteina -> melhor energia

REGRAS ABSOLUTAS:
1. Voce NAO e medica. Nunca prescreva medicamentos, insulina ou tratamentos.
2. Sempre reforce que decisoes medicas devem ser discutidas com o obstetra,
   endocrinologista ou reumatologista.
3. Baseie-se EXCLUSIVAMENTE nos dados fornecidos abaixo. Se um dado nao esta
   presente, diga "nao tenho essa informacao registrada".
4. NUNCA invente ou extrapole dados que nao foram fornecidos.
5. Seja empatica, clara e pratica. A usuaria esta gravida e possivelmente
   cansada -- seja direta mas gentil.
6. Ao falar sobre espondilite, considere a interacao com a gestacao
   (limitacao de medicamentos, dor articular, fadiga adicional).
7. Responda sempre em portugues brasileiro.
8. Use linguagem acessivel, evite jargao medico desnecessario.
9. Quando os numeros estiverem bons, reconheca o esforco dela.
10. Quando sugerir mudancas, seja pratica: trocas simples, nao dietas radicais.

DADOS DA SEMANA:
{dados_formatados}
```

## Formato dos dados no prompt

```
=== CHECK-INS MATINAIS (ultimos 7 dias) ===
Seg 10/03: Rigidez 6/10 | Dor 4/10 | Energia 5/10 | Nausea: nao
Ter 11/03: Rigidez 4/10 | Dor 3/10 | Energia 7/10 | Nausea: nao
Qua 12/03: Rigidez 7/10 | Dor 5/10 | Energia 3/10 | Nota: "calor forte hoje"

=== GLICEMIAS (ultimos 7 dias) ===
Seg 10/03:
  - Jejum: 88 mg/dL [ok]
  - Pos-cafe (60min): 96 mg/dL [ok]
  - Pos-almoco (75min): 148 mg/dL [ACIMA DO LIMITE]
  - Pos-jantar (65min): 125 mg/dL [ok]

Ter 11/03:
  - Jejum: 110 mg/dL [ACIMA DO LIMITE]
  - Pos-cafe (60min): 122 mg/dL [ok]
  (registros incompletos)

=== REFEICOES (ultimos 7 dias) ===
Seg 10/03:
  - Cafe: pao de inhame 57g (120kcal), 2 ovos (156kcal), leite vegetal 200ml (80kcal)
    Total: 356 kcal | 28g carb | 18g prot
  - Almoco: arroz 150g, feijao 100g, sobrecoxa 120g, brocolis 80g
    Total: 620 kcal | 65g carb | 35g prot
  - Jantar: batata 200g, pao de inhame 57g, hamburguer 150g
    Total: 680 kcal | 72g carb | 28g prot

=== PESO ===
Ultima medicao: 74.2 kg (10/03)
Medicao anterior: 73.8 kg (03/03)
Variacao: +0.4 kg em 7 dias

=== RESUMO ===
- Total de medicoes de glicemia: 12 de 28 esperadas
- Medicoes acima do limite: 3 (25%)
- Media glicemia jejum: 99 mg/dL
- Media pos-prandial: 130 mg/dL
- Media rigidez matinal: 5.7/10
- Media energia: 5.0/10
- Semana gestacional atual: 28
- Correlacao observada: dias com jantar >600kcal, rigidez dia seguinte media 6.5
  vs dias com jantar <600kcal, rigidez media 4.0
```

## Janela de contexto

- Padrao: 7 dias de dados
- Se a usuaria pedir: expandir para 14 ou 30 dias
- Estimativa de tokens por semana: 800-1200 tokens de dados (mais com checkins)
- Custo estimado por analise: ~$0.01 (Sonnet)

## Prompt Builder

```typescript
// lib/ai/prompt-builder.ts

interface AnalysisContext {
  profile: Profile;
  glucoseEntries: GlucoseEntry[];
  meals: Meal[];
  weightEntries: WeightEntry[];
  dailyCheckins: DailyCheckin[];
}

function buildAnalysisPrompt(context: AnalysisContext): string {
  const gestationalWeek = calculateGestationalWeek(
    profile.gestational_week_start,
    profile.gestational_week_number
  );

  // Calcular correlacoes basicas antes de enviar
  const correlations = calculateCorrelations(context);

  return SYSTEM_PROMPT
    .replace('{semana_gestacional}', gestationalWeek.toString())
    .replace('{limite_jejum}', profile.glucose_limit_fasting.toString())
    .replace('{limite_posprandial}', profile.glucose_limit_postprandial.toString())
    .replace('{medicamentos_ou_nenhum_informado}', profile.medications || 'Nenhum informado')
    .replace('{dados_formatados}', formatAllData(context, correlations));
}

function calculateCorrelations(context: AnalysisContext) {
  // Cruzar jantar de cada dia com checkin da manha seguinte
  // Cruzar tipo de refeicao com pico glicemico
  // Retornar como texto resumido para o prompt
}
```

## Sugestoes de perguntas rapidas

Atualizadas com base no uso real:

```typescript
const QUICK_PROMPTS = [
  "Como esta minha glicemia esta semana?",
  "Algum padrao entre o que como e como me sinto?",
  "Meu jantar esta afetando minha rigidez matinal?",
  "O que posso melhorar nas refeicoes?",
  "Minha glicemia de jejum esta melhorando ou piorando?",
  "Resumo geral: como estou me saindo?",
  "Quantas calorias estou consumindo por dia em media?",
];
```

## Streaming com Vercel AI SDK

```typescript
// app/api/ai/analyze/route.ts

import Anthropic from '@anthropic-ai/sdk';
import { AnthropicStream, StreamingTextResponse } from 'ai';

export async function POST(req: Request) {
  const { message } = await req.json();
  const userId = await getAuthenticatedUserId(req);

  // 1. Buscar dados (incluindo daily_checkins agora)
  const context = await fetchUserContext(userId, 7);

  // 2. Montar prompt
  const systemPrompt = buildAnalysisPrompt(context);

  // 3. Chamar Claude com streaming
  const anthropic = new Anthropic();
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: message }],
    stream: true,
  });

  // 4. Stream para o frontend
  const stream = AnthropicStream(response);
  return new StreamingTextResponse(stream);
}
```

## Calculo nutricional via IA (NOVO)

Para refeicoes sem alimentos salvos, a IA estima calorias/macros.
Chamada separada, rapida, sem streaming:

```typescript
// app/api/ai/estimate-nutrition/route.ts

export async function POST(req: Request) {
  const { foodDescription, quantityGrams } = await req.json();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 200,
    system: 'Voce e um calculador nutricional. Responda APENAS em JSON...',
    messages: [{
      role: 'user',
      content: `Estime calorias e macros para: ${foodDescription}, ${quantityGrams}g`
    }],
  });

  // Parse JSON e retornar
}
```

## Guardrails

A IA deve ser impedida de:
- Prescrever medicamentos ou doses de insulina
- Diagnosticar condicoes medicas novas
- Sugerir que a usuaria ignore orientacoes do medico
- Fazer afirmacoes definitivas sobre risco
- Inventar dados que nao estao no contexto
- Usar linguagem excessivamente tecnica (citocinas, marcadores clinicos)

APRENDIZADO DO CHAT GPT: O GPT usou linguagem como "marcador clinico" e
"citocinas" com confianca alta sem dados medicos formais. Nossa IA deve
ser mais cautelosa e sempre referenciar os dados concretos.
