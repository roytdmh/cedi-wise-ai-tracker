-- Create newsletter_signups table
CREATE TABLE public.newsletter_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter signups
CREATE POLICY "Anyone can create newsletter signup" 
ON public.newsletter_signups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all newsletter signups" 
ON public.newsletter_signups 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE auth_user_id = auth.uid() 
  AND role = 'admin'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_newsletter_signups_updated_at
BEFORE UPDATE ON public.newsletter_signups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();