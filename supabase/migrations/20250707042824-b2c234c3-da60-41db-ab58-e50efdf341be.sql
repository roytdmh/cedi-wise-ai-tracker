-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_created_at ON public.budgets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Add missing RLS policies for better security (drop if exists first)
DROP POLICY IF EXISTS "Service role can insert exchange rates" ON public.exchange_rate_history;
CREATE POLICY "Service role can insert exchange rates" 
ON public.exchange_rate_history 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert price history" ON public.price_history;
CREATE POLICY "Service role can insert price history" 
ON public.price_history 
FOR INSERT 
WITH CHECK (true);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false) 
ON CONFLICT (id) DO NOTHING;