# Descobertas do Chat GPT - Analise de Uso Real

> Este documento registra tudo que aprendemos ao analisar o chat real que a
> usuaria mantinha com o GPT. Foi gerado pedindo ao proprio GPT que analisasse
> o historico completo. Deve ser lido ANTES de qualquer doc de features ou UI.

## O que o GPT fazia para ela (7 funcoes confirmadas)

| Nr | Funcao | Frequencia | Importancia |
|----|--------|-----------|-------------|
| 1 | Contador nutricional (calorias + macros por refeicao) | Toda refeicao | ALTA |
| 2 | Analista de glicemia (interpretar valores, padroes) | Toda medicao | ALTA |
| 3 | Correlator sintomas-alimentacao (dor, rigidez, energia) | Diario | CRITICA |
| 4 | Orientador de ajustes praticos na dieta | Frequente | ALTA |
| 5 | Monitor de sinais de alerta e seguranca | Pontual | ALTA |
| 6 | Registro estruturado do dia | Diario | ALTA |
| 7 | Apoio emocional e de aderencia | Continuo | MEDIA |

A funcao #3 e a mais valiosa e a que menos antecipamos. Ela nao so quer saber
se a glicemia esta boa. Ela quer saber: por que estou com mais dor hoje? Foi o
que comi ontem? O app precisa fazer essa correlacao melhor que o chat.

## O que ela registra (dados confirmados)

### Registro diario (frequente)
- Glicemia em jejum (valor em mg/dL)
- Glicemia pos-refeicao com tempo variavel (1h, 1h15, 1h20 - nao e fixo)
- Alimentos por refeicao com quantidades em gramas
- Sintomas: rigidez matinal, dor no quadril, sensacao nos pes, energia, enjoo

### Registro ocasional
- Estado geral qualitativo ("mais disposta", "sem energia")
- Fatores ambientais (calor afetando energia)
- Disposicao e humor

### Formato natural dela
- Mensagens curtas e objetivas
- Listas: "Cafe da manha: pao de inhame 57g, 2 ovos, leite vegetal"
- Glicemia sempre com numero claro: "1h pos cafe: 96"
- Quantidades em gramas quando sabe, porcoes caseiras quando nao sabe

## Ritual de registro identificado

Ela segue naturalmente esta sequencia ao longo do dia:

1. Glicemia de jejum (manha)
2. Cafe da manha (itens + quantidades)
3. Glicemia pos-cafe (com tempo)
4. Almoco (itens + quantidades)
5. Glicemia pos-almoco (com tempo)
6. Lanche (quando tem)
7. Jantar (itens + quantidades)
8. Glicemia pos-jantar (com tempo)
9. Observacoes: dor, rigidez, energia

IMPLICACAO PARA O APP: A UI deve espelhar este fluxo natural. Nao forcar um
formato diferente do que ela ja faz.

## Contexto medico completo (confirmado)

### Diagnosticos
- Diabetes gestacional (confirmada pelo marido, nao foi explicitada no chat)
- Espondilite anquilosante (crises de dor e rigidez, condicao pre-existente)

### Medicamentos
- Nenhum mencionado no chat (pode estar usando insulina ou anti-inflamatorios
  sem ter registrado - o app deve ter campo para isso)

### Sintomas rastreados ativamente
- Rigidez matinal (varia em intensidade dia a dia)
- Dor no quadril
- Sensacao nos pes ("sendo furados" - possivelmente neuropatica)
- Enjoo
- Nivel de energia e disposicao
- Influencia do calor no estado geral

### Limites de glicemia
- Nao foram explicitados pelo medico no chat
- O GPT usou faixas genericas
- O app deve ter limites configuraveis e perguntar quais o medico definiu

## Problemas do chat confirmados pelo proprio GPT

1. CONFUSAO DE DADOS: GPT misturou quantidades e itens entre dias diferentes
2. ALUCINACAO: GPT inventou o termo "glicemia gestacional" sem base no que ela disse
3. CONFUSAO DE DATAS: GPT respondeu com data errada e itens de outro dia
4. EXCESSO DE CONFIANCA: GPT tratou associacoes como certas demais
5. ESTIMATIVAS IMPRECISAS: sem rotulos, so consegue estimar calorias

Todos estes problemas sao resolvidos por um banco de dados relacional.

## O que o app DEVE preservar do chat

1. Tom empatico e encorajador - ela responde bem a isso
2. Analise imediata pos-registro - ela registra e espera interpretacao
3. Correlacao pratica - "quando voce comeu X, aconteceu Y"
4. Sugestoes simples - trocas alimentares praticas, nao dietas radicais
5. Liberdade de perguntar qualquer coisa - o chat com IA deve continuar existindo
6. Reconhecimento de esforco - ela se motiva quando os dados mostram melhora

## O que o app deve fazer MELHOR que o chat

1. Nunca confundir dados - banco relacional, cada registro com timestamp
2. Escala de sintomas consistente - nao depender de texto livre para dor/rigidez
3. Correlacoes automaticas - "nos dias com mais amido no jantar, rigidez maior"
4. Graficos visuais - glicemia + rigidez sobrepostos no tempo
5. Check-in matinal guiado - perguntas fixas que ela ja responde naturalmente
6. Tempo pos-refeicao preciso - timer ou campo de minutos, nao estimativa
7. Base de alimentos personalizada - salvar alimentos frequentes com rotulo
8. Exportacao para medico - resumo semanal em PDF

## Mudancas de prioridade impostas pelo relatorio

| Feature | Prioridade ANTES | Prioridade AGORA | Motivo |
|---------|-----------------|-------------------|--------|
| Sintomas (dor, rigidez, energia) | P2 desejavel | P0 essencial | Ela registra DIARIAMENTE |
| Check-in matinal | Nao existia | P0 essencial | Ela ja faz esse ritual |
| Calculo nutricional automatico | Implicito | P0 essencial | Funcao #1 mais usada |
| Correlacao comida-sintomas | Nao existia | P1 importante | Funcao mais valiosa do chat |
| Timer pos-refeicao | Nao existia | P1 importante | Ela mede em tempos variaveis |
| Alimentos salvos | Nao existia | P1 importante | Ela come os mesmos alimentos |

## Funcionalidades novas identificadas

### Check-in matinal (P0)
Tela ao abrir o app de manha: glicemia jejum + rigidez 1-10 + dor 1-10 +
energia 1-10 + observacao livre. Tudo num formulario rapido.

### Timer pos-refeicao (P1)
Ao registrar refeicao, opcao de iniciar timer. Notificacao em 1h.
Registra automaticamente o tempo entre refeicao e medicao.

### Alimentos salvos (P1)
Cadastrar alimentos frequentes com calorias/macros do rotulo.
Registro rapido selecionando da lista pessoal.

### Correlacao automatica (P2)
Cruzar jantar com rigidez matinal do dia seguinte.
Cruzar tipo de carboidrato com pico glicemico.
Exibir comparativos visuais.
