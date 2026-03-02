# Modelo de Dados

> ATUALIZADO com base em docs/GPT-CHAT-INSIGHTS.md
> Mudancas: daily_checkins substitui symptoms, minutes_after_meal em glucose,
> nova tabela saved_foods e meal_items, campo medications em profiles.

## Diagrama de entidades

```
profiles (1) --> (N) glucose_entries
profiles (1) --> (N) meals --> (N) meal_items
profiles (1) --> (N) saved_foods
profiles (1) --> (N) weight_entries
profiles (1) --> (N) daily_checkins
profiles (1) --> (N) ai_conversations
```

## Tabelas

### profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gestational_week_start DATE,
  gestational_week_number INTEGER,
  has_spondylitis BOOLEAN DEFAULT true,
  glucose_limit_fasting INTEGER DEFAULT 95,
  glucose_limit_postprandial INTEGER DEFAULT 140,
  medications TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

Calculo da semana gestacional:
semana_atual = gestational_week_number + floor((dias desde gestational_week_start) / 7)

### glucose_entries
4 medicoes por dia. O tempo pos-refeicao varia (1h, 1h15, 1h20).
Campo minutes_after_meal registra o tempo exato. NULL para jejum.

```sql
CREATE TYPE glucose_meal_type AS ENUM (
  'fasting', 'post_breakfast', 'post_lunch', 'post_dinner'
);

CREATE TABLE glucose_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value INTEGER NOT NULL,
  meal_type glucose_meal_type NOT NULL,
  minutes_after_meal INTEGER,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  is_above_limit BOOLEAN GENERATED ALWAYS AS (
    CASE
      WHEN meal_type = 'fasting' THEN value >= 95
      ELSE value >= 140
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_glucose_user_date ON glucose_entries(user_id, measured_at DESC);
```

### meals

```sql
CREATE TYPE meal_period AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period meal_period NOT NULL,
  description TEXT NOT NULL,
  total_calories INTEGER,
  total_carbs_grams INTEGER,
  total_protein_grams INTEGER,
  total_fat_grams INTEGER,
  eaten_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_meals_user_date ON meals(user_id, eaten_at DESC);
```

### meal_items
Itens individuais de cada refeicao com referencia opcional a alimentos salvos.

```sql
CREATE TABLE meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  saved_food_id UUID REFERENCES saved_foods(id),
  name TEXT NOT NULL,
  quantity_grams INTEGER,
  quantity_description TEXT,
  calories INTEGER,
  carbs_grams DECIMAL(5,1),
  protein_grams DECIMAL(5,1),
  fat_grams DECIMAL(5,1),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### saved_foods
Alimentos frequentes com dados do rotulo. Ela come os mesmos alimentos
repetidamente (pao de inhame, queijo, leite vegetal).

```sql
CREATE TABLE saved_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calories_per_100g INTEGER,
  carbs_per_100g DECIMAL(5,1),
  protein_per_100g DECIMAL(5,1),
  fat_per_100g DECIMAL(5,1),
  default_portion_grams INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### weight_entries

```sql
CREATE TABLE weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value_kg DECIMAL(5,2) NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_weight_user_date ON weight_entries(user_id, measured_at DESC);
```

### daily_checkins
SUBSTITUI a antiga tabela symptoms. Check-in matinal estruturado.
Um registro por dia. Baseado no ritual natural da usuaria.

```sql
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  stiffness_score INTEGER CHECK (stiffness_score BETWEEN 0 AND 10),
  pain_score INTEGER CHECK (pain_score BETWEEN 0 AND 10),
  energy_score INTEGER CHECK (energy_score BETWEEN 0 AND 10),
  nausea BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_checkins_user_date ON daily_checkins(user_id, date DESC);
```

### ai_conversations

```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  data_context_summary TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_conv_user_date ON ai_conversations(user_id, created_at DESC);
```

## Row Level Security (RLS)

```sql
-- Padrao para tabelas com user_id direto:
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON [table_name]
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON [table_name]
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON [table_name]
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON [table_name]
  FOR DELETE USING (auth.uid() = user_id);

-- meal_items (sem user_id direto, usa JOIN):
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own meal items" ON meal_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_items.meal_id AND meals.user_id = auth.uid())
  );
```

## TypeScript Types

```typescript
export type GlucoseMealType = 'fasting' | 'post_breakfast' | 'post_lunch' | 'post_dinner';
export type MealPeriod = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface GlucoseEntry {
  id: string;
  user_id: string;
  value: number;
  meal_type: GlucoseMealType;
  minutes_after_meal?: number;
  measured_at: string;
  notes?: string;
  is_above_limit: boolean;
}

export interface Meal {
  id: string;
  user_id: string;
  period: MealPeriod;
  description: string;
  total_calories?: number;
  total_carbs_grams?: number;
  total_protein_grams?: number;
  total_fat_grams?: number;
  eaten_at: string;
  notes?: string;
  items?: MealItem[];
}

export interface MealItem {
  id: string;
  meal_id: string;
  saved_food_id?: string;
  name: string;
  quantity_grams?: number;
  quantity_description?: string;
  calories?: number;
  carbs_grams?: number;
  protein_grams?: number;
  fat_grams?: number;
}

export interface SavedFood {
  id: string;
  user_id: string;
  name: string;
  calories_per_100g?: number;
  carbs_per_100g?: number;
  protein_per_100g?: number;
  fat_per_100g?: number;
  default_portion_grams?: number;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  value_kg: number;
  measured_at: string;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  date: string;
  stiffness_score?: number;
  pain_score?: number;
  energy_score?: number;
  nausea?: boolean;
  notes?: string;
}
```
