# Contexto Médico

> **DISCLAIMER:** Este documento serve como referência para o desenvolvimento do app.
> O app NÃO substitui acompanhamento médico. Todas as informações aqui são
> referências gerais e devem ser validadas pelo obstetra/endocrinologista da paciente.

## Diabetes Gestacional

### O que é
Intolerância à glicose diagnosticada durante a gravidez. O corpo não produz insulina
suficiente para lidar com a demanda aumentada da gestação.

### Limites padrão de glicemia para gestantes (referência)

| Medição | Limite | Unidade |
|---------|--------|---------|
| Jejum | < 95 | mg/dL |
| 1h pós-prandial | < 140 | mg/dL |
| 2h pós-prandial | < 120 | mg/dL |

**No app:** Usar 95 (jejum) e 140 (pós-prandial) como defaults configuráveis.
A usuária mede pós-prandial (não sabemos se 1h ou 2h — usar 140 como default seguro).

### Protocolo de medição da usuária
- 4 medições por dia
- 1x jejum (manhã, antes de comer)
- 1x pós-café da manhã
- 1x pós-almoço
- 1x pós-jantar
- Método: glicosímetro de dedo (ponta de dedo)

### Sinais de atenção que a IA deve flagear
- Glicemia de jejum consistentemente ≥ 95 mg/dL (vários dias seguidos)
- Pós-prandial consistentemente ≥ 140 mg/dL
- Tendência de aumento ao longo das semanas
- Grandes variações entre dias sem explicação alimentar
- Hipoglicemia (< 70 mg/dL) — raro mas importante

### O que a IA NÃO deve fazer
- Sugerir doses de insulina
- Recomendar medicamentos específicos
- Diagnosticar complicações (pré-eclâmpsia, macrossomia, etc.)
- Dizer que "está tudo bem" de forma definitiva
- Ignorar padrões preocupantes

### O que a IA PODE fazer
- Apontar padrões: "sua glicemia pós-jantar tem ficado mais alta que as outras"
- Correlacionar com refeições: "nos dias que você comeu macarrão, a pós-jantar subiu"
- Sugerir que converse com o médico quando notar padrões preocupantes
- Dar informações gerais sobre alimentação para controle glicêmico
- Encorajar e reconhecer quando os números estão bons

## Espondilite Anquilosante

### O que é
Doença inflamatória crônica que afeta principalmente as articulações da coluna vertebral.
Causa dor e rigidez, especialmente lombar.

### Relevância na gestação
- Muitos medicamentos para espondilite são contraindicados na gravidez
- A dor lombar pode ser agravada pelo peso da gestação
- Fadiga da espondilite + fadiga da gestação = cansaço significativo
- Exercício é importante mas pode ser limitado pela dor

### Como a IA deve considerar
- Quando a usuária reportar dor lombar, considerar que pode ser da espondilite E/OU da gestação
- Ao sugerir atividades, considerar limitações de mobilidade
- Reconhecer que ela pode ter dias de mais cansaço/dor
- Não sugerir medicamentos — isso é com o reumatologista
- Ser empática com a carga dupla (gestação + doença crônica)

## Ganho de peso na gestação (referência)

| IMC pré-gestação | Ganho total recomendado |
|------------------|------------------------|
| < 18.5 (abaixo) | 12.5 - 18 kg |
| 18.5 - 24.9 (normal) | 11.5 - 16 kg |
| 25 - 29.9 (sobrepeso) | 7 - 11.5 kg |
| ≥ 30 (obesidade) | 5 - 9 kg |

**No app:** Não sabemos o IMC pré-gestação. A IA pode comentar sobre variação de peso
semana a semana, mas não deve fazer julgamentos sobre peso total.

## Semana gestacional — marcos relevantes

- Semanas 24-28: Teste oral de tolerância à glicose (TOTG) — diagnóstico
- Semanas 28-36: Período mais crítico de controle
- Semana 37+: Proximidade do parto, monitoramento mais intenso
- O controle glicêmico pode se tornar mais difícil no terceiro trimestre

## Alimentos e glicemia (referência para IA)

### Tendem a elevar mais a glicemia:
- Arroz branco, pão branco, massas refinadas
- Frutas muito doces (manga, uva, banana madura)
- Sucos de fruta (mesmo naturais)
- Doces e açúcar refinado
- Tubérculos em grande quantidade

### Tendem a ajudar no controle:
- Proteínas em todas as refeições
- Fibras (verduras, legumes, cereais integrais)
- Gorduras boas (azeite, abacate, castanhas)
- Fracionar refeições (comer menor quantidade mais vezes)
- Combinar carboidrato com proteína/fibra

**IMPORTANTE:** A IA deve usar essas informações como contexto educacional,
não como prescrição dietética individualizada.
