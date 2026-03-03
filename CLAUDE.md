# Glicemia App — Diário de Saúde Gestacional

## O que é este projeto

App mobile-first (PWA) para gestante com diabetes gestacional registrar glicemia, refeições, peso e sintomas — e receber análises inteligentes via IA. A usuária também tem espondilite anquilosante, e a IA deve considerar isso nas análises.

**Problema que resolve:** A usuária usava um chat longo no GPT para registrar tudo. Com o tempo, o modelo começava a alucinar dados antigos. Este app separa DADOS (banco) de INTELIGÊNCIA (IA), garantindo que a IA sempre trabalhe com dados reais.

**Princípio central:** A IA nunca "lembra" — ela sempre RECEBE os dados frescos do banco antes de responder.

## Stack

- **Frontend:** Next.js 14+ (App Router) com TypeScript
- **Estilo:** Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes (serverless)
- **Banco:** Supabase (PostgreSQL + Auth + Row Level Security)
- **IA:** Anthropic API (Claude Sonnet 4.5 — balanceamento custo/qualidade)
- **Deploy:** Vercel
- **PWA:** next-pwa para instalação no celular

## Idioma

Todo o app é em **português brasileiro**. Código e comentários podem ser em inglês, mas toda interface, mensagens de erro, e respostas da IA devem ser em pt-BR.

## Leia antes de codar

Antes de implementar qualquer feature, leia os docs relevantes:

| Área | Arquivo |
|------|---------|
| **LEIA PRIMEIRO** Uso real da usuaria | `docs/GPT-CHAT-INSIGHTS.md` |
| Visão geral da arquitetura | `docs/architecture/ARCHITECTURE.md` |
| Modelo de dados completo | `docs/architecture/DATA-MODEL.md` |
| Features e prioridades | `docs/features/FEATURES.md` |
| Camada de IA (prompts, fluxo) | `docs/ai-layer/AI-LAYER.md` |
| Contexto médico e limites | `docs/medical-context/MEDICAL-CONTEXT.md` |
| UI/UX mobile-first | `docs/ui-ux/UI-UX.md` |
| Deploy e infra | `docs/deployment/DEPLOYMENT.md` |
| Workflow de desenvolvimento | `docs/workflow/WORKFLOW.md` |
| Plano mestre com fases | `docs/MASTER-PLAN.md` |

## Convenções de código

- **Componentes:** PascalCase, um por arquivo (`GlucoseEntry.tsx`)
- **Hooks:** camelCase com prefixo `use` (`useGlucoseHistory.ts`)
- **API Routes:** kebab-case (`/api/glucose-entries`)
- **Supabase:** snake_case nas tabelas e colunas (`glucose_entries`, `measured_at`)
- **Types:** arquivo central `types/index.ts` + types específicos por domínio
- **Validação:** Zod schemas para input de API e forms
- **Erros:** try/catch consistente, mensagens em pt-BR para o usuário

## Estrutura do projeto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Rotas públicas (login, registro)
│   ├── (dashboard)/        # Rotas protegidas
│   │   ├── registrar/      # Telas de registro
│   │   ├── historico/      # Histórico e gráficos
│   │   ├── analise/        # Chat com IA
│   │   └── perfil/         # Configurações
│   ├── api/                # API Routes
│   └── layout.tsx
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── glucose/            # Componentes de glicemia
│   ├── meals/              # Componentes de refeições
│   ├── charts/             # Gráficos (recharts)
│   └── ai/                 # Interface de IA
├── lib/
│   ├── supabase/           # Client e helpers
│   ├── ai/                 # Anthropic API + prompt builder
│   ├── validators/         # Zod schemas
│   └── utils/              # Helpers gerais
├── hooks/                  # Custom hooks
├── types/                  # TypeScript types
└── public/
    └── manifest.json       # PWA manifest
```

## Comandos úteis

```bash
npm run dev          # Dev server
npm run build        # Build de produção
npm run lint         # ESLint
npm run type-check   # TypeScript check
npx supabase start   # Supabase local
npx supabase db push # Push migrations
```
