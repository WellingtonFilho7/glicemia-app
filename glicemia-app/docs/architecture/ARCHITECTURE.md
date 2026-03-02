# Arquitetura do Sistema

## Princípio fundamental

```
DADOS (Supabase) ←→ APP (Next.js) ←→ IA (Claude API)
                                         ↑
                                    Sempre recebe
                                    dados frescos
                                    do banco
```

A IA NUNCA mantém estado. Cada chamada de análise:
1. App busca dados relevantes do Supabase
2. Monta um prompt estruturado com esses dados
3. Envia para a API do Claude
4. Retorna a resposta para a usuária

Isso elimina 100% do problema de alucinação que existia no chat longo do GPT.

## Fluxo de dados

### Registro (escrita)
```
Usuária → Form UI → Zod validation → API Route → Supabase INSERT
                                                       ↓
                                              Row Level Security
                                              (só dados dela)
```

### Análise (leitura + IA)
```
Usuária pede análise → API Route → Supabase SELECT (últimos N dias)
                                         ↓
                                   Prompt Builder (monta contexto)
                                         ↓
                                   Anthropic API (Claude Sonnet)
                                         ↓
                                   Resposta estruturada → UI
```

### Dashboard (leitura)
```
Usuária abre app → Server Component → Supabase SELECT (dados do dia)
                                            ↓
                                      Dashboard UI
                                      (resumo, alertas, gráficos)
```

## Segurança

- **Autenticação:** Supabase Auth (email/senha)
- **Autorização:** Row Level Security (RLS) — cada query filtra por `user_id`
- **API Key Claude:** Apenas no servidor (env var `ANTHROPIC_API_KEY`)
- **HTTPS:** Enforced pelo Vercel
- **Dados sensíveis:** Nunca no client-side, nunca em localStorage

## Performance

- **Server Components:** Dados carregados no servidor quando possível
- **Streaming:** Respostas da IA com streaming (Vercel AI SDK)
- **Caching:** Dados do dia cacheados no client com SWR/React Query
- **PWA:** Service worker para assets estáticos e fallback offline

## Dependências principais

```json
{
  "next": "^14",
  "react": "^18",
  "@supabase/supabase-js": "^2",
  "@supabase/ssr": "^0.5",
  "@anthropic-ai/sdk": "^0.30",
  "ai": "^3",
  "zod": "^3",
  "recharts": "^2",
  "tailwindcss": "^3",
  "next-pwa": "^5"
}
```

## Variáveis de ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```
