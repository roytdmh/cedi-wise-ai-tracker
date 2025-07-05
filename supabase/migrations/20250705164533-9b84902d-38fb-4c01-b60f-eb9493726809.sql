-- Create tables for historical data and live feeds
CREATE TABLE public.exchange_rate_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  base_currency TEXT NOT NULL,
  target_currency TEXT NOT NULL,
  rate NUMERIC NOT NULL,
  change_percent NUMERIC DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  country TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  price_type TEXT NOT NULL DEFAULT 'retail', -- 'retail' or 'wholesale'
  unit TEXT NOT NULL,
  change_percent NUMERIC DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.financial_health_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  budget_id UUID REFERENCES public.budgets(id),
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  score_factors JSONB NOT NULL DEFAULT '{}',
  recommendations TEXT[],
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  budget_id UUID REFERENCES public.budgets(id),
  messages JSONB NOT NULL DEFAULT '[]',
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exchange_rate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to market data
CREATE POLICY "Public can view exchange rates" ON public.exchange_rate_history FOR SELECT USING (true);
CREATE POLICY "Public can view price history" ON public.price_history FOR SELECT USING (true);

-- Create policies for user-specific data
CREATE POLICY "Users can view their health scores" ON public.financial_health_scores FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can create health scores" ON public.financial_health_scores FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can view their chat sessions" ON public.chat_sessions FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can create chat sessions" ON public.chat_sessions FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can update their chat sessions" ON public.chat_sessions FOR UPDATE USING (user_id IS NULL OR auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_exchange_rate_history_timestamp ON public.exchange_rate_history(timestamp DESC);
CREATE INDEX idx_exchange_rate_history_currencies ON public.exchange_rate_history(base_currency, target_currency);
CREATE INDEX idx_price_history_timestamp ON public.price_history(timestamp DESC);
CREATE INDEX idx_price_history_country_category ON public.price_history(country, category);
CREATE INDEX idx_financial_health_scores_budget ON public.financial_health_scores(budget_id);
CREATE INDEX idx_chat_sessions_updated ON public.chat_sessions(updated_at DESC);

-- Create triggers for updating timestamps
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();