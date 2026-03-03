# Deploy e Infraestrutura

## Visão geral

```
Vercel (Frontend + API Routes)
    ↕
Supabase (PostgreSQL + Auth)
    ↕
Anthropic API (IA)
```

## Supabase Setup

### 1. Criar projeto
- Ir em supabase.com → New Project
- Região: São Paulo (sa-east-1) — mais próximo da usuária
- Copiar: Project URL, Anon Key, Service Role Key

### 2. Rodar migrations
```bash
npx supabase link --project-ref [PROJECT_REF]
npx supabase db push
```

### 3. Configurar Auth
- Supabase Dashboard → Authentication → Settings
- Habilitar Email provider
- Desabilitar "Confirm email" (é só 1 usuária, não precisa)
- Criar usuária manualmente no Dashboard ou via tela simples de registro

### 4. Limites do free tier
- 500MB banco → mais que suficiente
- 50K monthly active users → 1 usuária
- 500MB storage → não usamos storage
- 2GB bandwidth → suficiente
- 500K edge function invocations → não usamos

**Conclusão:** Free tier cobre este projeto indefinidamente.

## Vercel Setup

### 1. Deploy
```bash
# Conectar repo GitHub
vercel link
vercel deploy
```

### 2. Environment variables (Vercel Dashboard)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
```

### 3. Domínio
- Default: `seu-app.vercel.app`
- Custom domain: configurar no Vercel Dashboard se quiser

### 4. Limites do free tier (Hobby)
- 100GB bandwidth/mês → suficiente
- Serverless functions: 100GB-Hrs → suficiente
- Edge functions: 500K invocations → suficiente
- 1 deploy por commit

**Conclusão:** Free tier cobre este projeto.

## Anthropic API

### Custo estimado
- Modelo: Claude Sonnet 4.5
- Input: ~$3/M tokens
- Output: ~$15/M tokens
- Por análise: ~1000 tokens input + ~500 tokens output
- **Custo por análise: ~$0.01**
- Se ela pedir 3 análises por dia: ~$0.90/mês
- **Custo mensal estimado: < $1**

### Setup
```bash
# Criar API key em console.anthropic.com
# Adicionar ao .env.local e ao Vercel
ANTHROPIC_API_KEY=sk-ant-...
```

### Rate limits
- Free tier: limitado (pode precisar de crédito)
- Tier 1 ($5 deposit): 60 RPM, 60K tokens/min → mais que suficiente

## PWA Configuration

### next.config.js
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // Next.js config
});
```

### public/manifest.json
```json
{
  "name": "Diário de Saúde Gestacional",
  "short_name": "Glicemia",
  "description": "Controle de glicemia e saúde na gestação",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAFAF9",
  "theme_color": "#7C3AED",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Instalação no celular
Ao acessar o app pelo Chrome no Android:
1. Vai aparecer banner "Adicionar à tela inicial"
2. Ou: Menu → "Instalar app"
3. Ícone aparece na home screen
4. Abre sem barra de navegação do browser

No iOS (Safari):
1. Botão de compartilhar → "Adicionar à Tela de Início"
2. Funciona como app standalone

## Custo total mensal estimado

| Item | Custo |
|------|-------|
| Vercel | $0 (Hobby) |
| Supabase | $0 (Free tier) |
| Anthropic API | ~$1 |
| Domínio (opcional) | $0-12/ano |
| **Total** | **~$1/mês** |

## Checklist de segurança

- [ ] RLS habilitado em todas as tabelas
- [ ] `SUPABASE_SERVICE_ROLE_KEY` NUNCA exposto no client
- [ ] `ANTHROPIC_API_KEY` apenas no servidor
- [ ] HTTPS enforced (Vercel faz automaticamente)
- [ ] Não salvar dados sensíveis em localStorage
- [ ] Rate limit na rota da IA (evitar abuso)
