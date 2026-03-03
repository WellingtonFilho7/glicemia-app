-- =============================================================================
-- Glicemia App — Schema inicial
-- Baseado em docs/architecture/DATA-MODEL.md
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. ENUM TYPES
-- ---------------------------------------------------------------------------

CREATE TYPE glucose_meal_type AS ENUM (
  'fasting',
  'post_breakfast',
  'post_lunch',
  'post_dinner'
);

CREATE TYPE meal_period AS ENUM (
  'breakfast',
  'lunch',
  'dinner',
  'snack'
);

-- ---------------------------------------------------------------------------
-- 2. PROFILES
-- Referencia auth.users. Um perfil por usuario.
-- ---------------------------------------------------------------------------

CREATE TABLE profiles (
  id                       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                     TEXT NOT NULL,
  -- Semana gestacional: semana_atual = gestational_week_number + floor(days_since(gestational_week_start) / 7)
  gestational_week_start   DATE,
  gestational_week_number  INTEGER,
  has_spondylitis          BOOLEAN DEFAULT true,
  glucose_limit_fasting    INTEGER DEFAULT 95,
  glucose_limit_postprandial INTEGER DEFAULT 140,
  medications              TEXT,
  created_at               TIMESTAMPTZ DEFAULT now(),
  updated_at               TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 3. SAVED FOODS (antes das meals, pois meal_items referencia esta tabela)
-- Alimentos frequentes com dados do rotulo — ela come os mesmos alimentos
-- repetidamente (pao de inhame, queijo, leite vegetal).
-- ---------------------------------------------------------------------------

CREATE TABLE saved_foods (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  calories_per_100g     INTEGER,
  carbs_per_100g        DECIMAL(5,1),
  protein_per_100g      DECIMAL(5,1),
  fat_per_100g          DECIMAL(5,1),
  default_portion_grams INTEGER,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 4. GLUCOSE ENTRIES
-- 4 medicoes por dia. O campo minutes_after_meal registra o tempo exato
-- (ela mede em tempos variaveis: 1h, 1h15, 1h20). NULL para jejum.
-- is_above_limit e calculado automaticamente pelo banco.
-- ---------------------------------------------------------------------------

CREATE TABLE glucose_entries (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value              INTEGER NOT NULL,
  meal_type          glucose_meal_type NOT NULL,
  minutes_after_meal INTEGER,
  measured_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes              TEXT,
  is_above_limit     BOOLEAN GENERATED ALWAYS AS (
    CASE
      WHEN meal_type = 'fasting' THEN value >= 95
      ELSE value >= 140
    END
  ) STORED,
  created_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_glucose_user_date ON glucose_entries(user_id, measured_at DESC);

-- ---------------------------------------------------------------------------
-- 5. MEALS
-- ---------------------------------------------------------------------------

CREATE TABLE meals (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period               meal_period NOT NULL,
  description          TEXT NOT NULL,
  total_calories       INTEGER,
  total_carbs_grams    INTEGER,
  total_protein_grams  INTEGER,
  total_fat_grams      INTEGER,
  eaten_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_meals_user_date ON meals(user_id, eaten_at DESC);

-- ---------------------------------------------------------------------------
-- 6. MEAL ITEMS
-- Itens individuais de cada refeicao com referencia opcional a alimentos salvos.
-- ---------------------------------------------------------------------------

CREATE TABLE meal_items (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id              UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  saved_food_id        UUID REFERENCES saved_foods(id),
  name                 TEXT NOT NULL,
  quantity_grams       INTEGER,
  quantity_description TEXT,
  calories             INTEGER,
  carbs_grams          DECIMAL(5,1),
  protein_grams        DECIMAL(5,1),
  fat_grams            DECIMAL(5,1),
  created_at           TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 7. WEIGHT ENTRIES
-- ---------------------------------------------------------------------------

CREATE TABLE weight_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value_kg    DECIMAL(5,2) NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_weight_user_date ON weight_entries(user_id, measured_at DESC);

-- ---------------------------------------------------------------------------
-- 8. DAILY CHECKINS
-- Substitui a antiga tabela symptoms. Check-in matinal estruturado.
-- Um registro por dia. Baseado no ritual natural da usuaria (funcao #3 critica):
-- glicemia jejum + rigidez 1-10 + dor 1-10 + energia 1-10 + observacao livre.
-- ---------------------------------------------------------------------------

CREATE TABLE daily_checkins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  stiffness_score INTEGER CHECK (stiffness_score BETWEEN 0 AND 10),
  pain_score      INTEGER CHECK (pain_score BETWEEN 0 AND 10),
  energy_score    INTEGER CHECK (energy_score BETWEEN 0 AND 10),
  nausea          BOOLEAN DEFAULT false,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_checkins_user_date ON daily_checkins(user_id, date DESC);

-- ---------------------------------------------------------------------------
-- 9. AI CONVERSATIONS
-- Cada mensagem e um registro separado para facilitar historico e analise.
-- data_context_summary: resumo dos dados enviados para a IA naquele momento.
-- ---------------------------------------------------------------------------

CREATE TABLE ai_conversations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_message         TEXT NOT NULL,
  ai_response          TEXT NOT NULL,
  data_context_summary TEXT,
  tokens_used          INTEGER,
  created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_conv_user_date ON ai_conversations(user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 10. TRIGGER — auto-criar perfil ao cadastro
-- Critico: sem isso, o usuario ficaria sem perfil e todas as FK quebrariam.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'Usuária'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS)
-- Padrao: 4 policies por tabela (SELECT, INSERT, UPDATE, DELETE).
-- meal_items e especial: usa JOIN com meals (nao tem user_id direto).
-- ---------------------------------------------------------------------------

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (auth.uid() = id);

-- saved_foods
ALTER TABLE saved_foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_foods_select" ON saved_foods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_foods_insert" ON saved_foods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_foods_update" ON saved_foods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "saved_foods_delete" ON saved_foods FOR DELETE USING (auth.uid() = user_id);

-- glucose_entries
ALTER TABLE glucose_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "glucose_select" ON glucose_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "glucose_insert" ON glucose_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "glucose_update" ON glucose_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "glucose_delete" ON glucose_entries FOR DELETE USING (auth.uid() = user_id);

-- meals
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meals_select" ON meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "meals_insert" ON meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meals_update" ON meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "meals_delete" ON meals FOR DELETE USING (auth.uid() = user_id);

-- meal_items (sem user_id direto — usa JOIN com meals)
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_items_all" ON meal_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_items.meal_id
        AND meals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_items.meal_id
        AND meals.user_id = auth.uid()
    )
  );

-- weight_entries
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weight_select" ON weight_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "weight_insert" ON weight_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "weight_update" ON weight_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "weight_delete" ON weight_entries FOR DELETE USING (auth.uid() = user_id);

-- daily_checkins
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checkins_select" ON daily_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "checkins_insert" ON daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "checkins_update" ON daily_checkins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "checkins_delete" ON daily_checkins FOR DELETE USING (auth.uid() = user_id);

-- ai_conversations
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_conv_select" ON ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_conv_insert" ON ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_conv_update" ON ai_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ai_conv_delete" ON ai_conversations FOR DELETE USING (auth.uid() = user_id);
