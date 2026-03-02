# Plano Mestre - Diario de Saude Gestacional

> ATUALIZADO com base em docs/GPT-CHAT-INSIGHTS.md
> Mudancas: Fase 1 agora inclui check-in matinal e calculo nutricional.
> Sintomas saem de P2 para P0. Novas features adicionadas.

## Visao geral das fases

### Fase 1: Fundacao (Dia 1-2)
Objetivo: App funcional com registro completo e persistencia.

- [ ] Setup Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Setup Supabase (projeto, tabelas, auth, RLS policies)
- [ ] PWA manifest + service worker
- [ ] Autenticacao (email/senha)
- [ ] Check-in matinal (glicemia jejum + rigidez + dor + energia)
- [ ] Tela de registro de glicemia (com minutes_after_meal)
- [ ] Tela de registro de refeicao (com itens individuais e calorias)
- [ ] Tela de registro de peso
- [ ] Dashboard home com resumo do dia (incluindo sintomas)
- [ ] Calculo nutricional basico (totais por refeicao)
- [ ] Deploy inicial no Vercel

Entregavel: Ela consegue fazer o check-in matinal, registrar glicemia,
refeicoes com calorias, e peso. Dashboard mostra tudo do dia.

### Fase 2: Inteligencia (Dia 3-4)
Objetivo: IA funcional que analisa dados reais incluindo sintomas.

- [ ] Integracao Anthropic API (route handler protegida)
- [ ] Prompt builder com dados de glicemia + refeicoes + checkins + peso
- [ ] Correlacoes calculadas antes de enviar ao prompt
- [ ] Tela de analise (chat com IA) com streaming
- [ ] Quick prompts atualizadas (incluindo correlacao sintomas-comida)
- [ ] Alertas visuais (glicemia fora dos limites)
- [ ] Estimativa nutricional via IA para alimentos sem rotulo

Entregavel: Ela pode pedir analises e receber respostas baseadas em dados
reais, incluindo correlacao entre comida e rigidez/dor.

### Fase 3: Polimento (Dia 5-6)
Objetivo: Experiencia mobile refinada e features de produtividade.

- [ ] Alimentos salvos (cadastrar com dados do rotulo)
- [ ] Selecionar alimentos salvos ao registrar refeicao
- [ ] Timer pos-refeicao com notificacao
- [ ] Graficos de tendencia (glicemia + rigidez sobrepostos)
- [ ] Historico navegavel por data
- [ ] Semana gestacional configuravel
- [ ] Exportar dados (CSV)
- [ ] Otimizacao mobile (touch targets, loading states)

Entregavel: App completo e polido para uso diario.

### Fase 4: Refinamento continuo (Ongoing)
- [ ] Ajustar prompts de IA baseado no feedback dela
- [ ] Correlacao automatica (jantar vs rigidez matinal)
- [ ] Resumo semanal automatico
- [ ] Sugestoes de refeicoes baseadas em padroes
- [ ] Relatorio para medico (PDF com secao separada para reumatologista)
- [ ] Modo consulta (resumo de 1 pagina para mostrar ao medico)
- [ ] Notificacoes de lembrete

## Metricas de sucesso

1. Tempo de registro: menos de 10 segundos para glicemia
2. Check-in matinal: menos de 30 segundos para tudo
3. Confiabilidade da IA: Zero alucinacoes (IA sempre recebe dados do banco)
4. Zero confusao de dados: nunca misturar itens entre dias
5. Adocao: ela usa diariamente sem pedir ajuda tecnica
6. Valor medico: dados exportaveis e apresentaveis ao obstetra e reumatologista
7. Correlacao util: IA identifica padroes comida-sintomas que ela valoriza

## Riscos e mitigacoes

| Risco | Mitigacao |
|-------|-----------|
| Custo API Anthropic | Sonnet ~$0.01/analise. Limitar a sob demanda |
| App complexo demais | MVP first: Fase 1 e usavel sozinha |
| Ela parar de usar | UX de registro mais rapido que chat GPT |
| Dados medicos sensiveis | RLS no Supabase, HTTPS, sem localStorage |
| Supabase free tier | 500MB banco, mais que suficiente |
| Calculo nutricional impreciso | Alimentos salvos com rotulo > estimativa IA |
| IA com excesso de confianca | Guardrails no system prompt, tom cauteloso |

## Custo total mensal estimado

| Item | Custo |
|------|-------|
| Vercel | $0 (Hobby) |
| Supabase | $0 (Free tier) |
| Anthropic API | ~$1 |
| Total | ~$1/mes |
