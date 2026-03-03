# Workflow de Desenvolvimento — Guia de 10x

## Quando usar o quê

### Claude Code (Terminal)
Use para TODA a implementação de código.

**Ideal para:**
- Scaffold do projeto (setup Next.js, Supabase, configs)
- Criar componentes, pages, API routes
- Escrever migrations SQL
- Debugar erros
- Refatorar código
- Testes
- Deploy

**Por que Claude Code:** Ele tem acesso ao filesystem, pode rodar comandos,
ver erros em tempo real, e iterar rapidamente. O CLAUDE.md na raiz do projeto
dá contexto completo a cada sessão.

**Dica:** Copie toda a pasta `docs/` para dentro do projeto.
Claude Code vai ler o CLAUDE.md e ter acesso a todo o knowledge base.

### Claude Projects (Web)
Use para PLANEJAMENTO e DECISÕES.

**Ideal para:**
- Revisar e iterar nos docs de especificação
- Discutir decisões de arquitetura
- Refinar prompts da IA
- Revisar e melhorar o system prompt
- Planejar novas features
- Analisar feedback da usuária

**Por que Projects:** Contexto persistente com os docs do projeto,
bom para discussões longas sem perder contexto.

**Setup do Project:**
1. Criar projeto "Glicemia App" no Claude
2. Fazer upload de todos os docs como knowledge base
3. Usar para conversas de planejamento

### Claude Chat (Web — sem Project)
Use para perguntas rápidas e isoladas.

**Ideal para:**
- "Como fazer X no Supabase?"
- "Qual a syntax do Zod para Y?"
- Perguntas técnicas pontuais
- Não precisa de contexto do projeto

---

## Setup do Claude Code para este projeto

### 1. CLAUDE.md na raiz
O arquivo CLAUDE.md já criado é a peça central. Claude Code lê automaticamente.

### 2. Estrutura de docs no projeto
```
glicemia-app/
├── CLAUDE.md                  ← Claude Code lê primeiro
├── docs/                      ← Knowledge base completo
│   ├── MASTER-PLAN.md
│   ├── architecture/
│   ├── features/
│   ├── ai-layer/
│   ├── medical-context/
│   ├── ui-ux/
│   ├── deployment/
│   └── workflow/
├── src/                       ← Código do app
├── supabase/                  ← Migrations
└── public/                    ← Assets + PWA
```

### 3. Comandos de início para Claude Code

**Sessão 1 — Scaffold:**
```
Leia o CLAUDE.md e os docs em docs/. Monte o projeto Next.js completo
com todas as configs (TypeScript, Tailwind, shadcn/ui, Supabase client,
next-pwa). Crie a estrutura de pastas do src/ conforme o CLAUDE.md.
Inclua o schema SQL em supabase/migrations/001_initial_schema.sql
conforme docs/architecture/DATA-MODEL.md.
```

**Sessão 2 — Auth + Dashboard:**
```
Leia docs/features/FEATURES.md. Implemente F05 (Autenticação com Supabase)
e F04 (Dashboard). Siga o layout em docs/ui-ux/UI-UX.md.
```

**Sessão 3 — Registros:**
```
Implemente F01 (Glicemia), F02 (Refeição), F03 (Peso).
Priorize velocidade de registro. Siga docs/ui-ux/UI-UX.md para o layout.
Use Zod para validação. Teclado numérico nos campos de número.
```

**Sessão 4 — IA:**
```
Leia docs/ai-layer/AI-LAYER.md e docs/medical-context/MEDICAL-CONTEXT.md.
Implemente F06 (Análise com IA). Crie o prompt builder, a API route com
streaming, e a tela de chat. Use Vercel AI SDK.
```

---

## Ferramentas que vão 10x o desenvolvimento

### 1. shadcn/ui CLI
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input dialog
```
Componentes prontos, customizáveis, sem dependência pesada.

### 2. Supabase CLI
```bash
npx supabase init
npx supabase start        # Banco local para dev
npx supabase db diff       # Auto-gera migrations
npx supabase gen types typescript  # Gera TypeScript types
```
**Type generation automática** é game-changer — muda o schema, roda o comando,
types atualizados sem esforço manual.

### 3. Vercel AI SDK
```bash
npm install ai @anthropic-ai/sdk
```
Streaming de respostas da IA com 5 linhas de código.
Hooks prontos (`useChat`) que gerenciam estado do chat automaticamente.

### 4. Vercel CLI
```bash
vercel dev     # Dev environment que simula produção
vercel deploy  # Deploy em 30 segundos
```

### 5. next-pwa
```bash
npm install next-pwa
```
Transforma Next.js em PWA com config mínima. Service worker automático.

---

## Automações para considerar

### 1. Auto-detecção de tipo de medição
```typescript
function suggestMealType(): GlucoseMealType {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return 'fasting';
  if (hour >= 9 && hour < 12) return 'post_breakfast';
  if (hour >= 12 && hour < 17) return 'post_lunch';
  return 'post_dinner';
}
```

### 2. Cálculo automático de semana gestacional
```typescript
function calculateGestationalWeek(
  referenceDate: Date,
  referenceWeek: number
): number {
  const daysSince = differenceInDays(new Date(), referenceDate);
  return referenceWeek + Math.floor(daysSince / 7);
}
```

### 3. Alerta automático no dashboard
Ao carregar o dashboard, verificar se alguma glicemia do dia está acima do limite.
Sem push notification (complexo demais para MVP), só visual.

### 4. Resumo semanal (Fase 4)
Cron job via Vercel Cron ou Supabase Edge Function:
- Toda segunda às 8h, chamar Claude com dados da semana
- Salvar resumo no banco
- Exibir como card no dashboard

---

## Dicas de produtividade com Claude Code

1. **Sempre comece pedindo para ler os docs:** "Leia CLAUDE.md e docs/features/FEATURES.md antes de começar"

2. **Uma feature por sessão:** Não tente fazer tudo de uma vez. Sessões focadas produzem código melhor.

3. **Peça para rodar e testar:** Claude Code pode rodar `npm run build` e ver os erros. Use isso.

4. **Itere nos prompts de IA no Project:** Teste o system prompt no Claude web com dados de exemplo antes de codificar.

5. **Use o diff do Supabase:** Faça mudanças no banco local, rode `supabase db diff` para gerar migrations automaticamente.

6. **Copy-paste dos wireframes:** Os wireframes ASCII no UI-UX.md são surpreendentemente úteis para Claude Code entender o layout desejado.

---

## Ordem de execução recomendada

```
DIA 1 (manhã): Scaffold + Setup (Claude Code)
DIA 1 (tarde): Auth + Dashboard (Claude Code)
DIA 2 (manhã): Registros Glicemia/Refeição/Peso (Claude Code)
DIA 2 (tarde): Deploy MVP no Vercel (Claude Code) → ELA COMEÇA A USAR
DIA 3: Testar system prompt da IA (Claude Project) → Implementar (Claude Code)
DIA 4: IA streaming + chat (Claude Code)
DIA 5: Gráficos + Histórico (Claude Code)
DIA 6: Polimento mobile + Sintomas + Exportar (Claude Code)
```

**Ponto crítico:** Colocar na mão dela no DIA 2 com registro básico funcionando.
Feedback real > planejamento teórico.
