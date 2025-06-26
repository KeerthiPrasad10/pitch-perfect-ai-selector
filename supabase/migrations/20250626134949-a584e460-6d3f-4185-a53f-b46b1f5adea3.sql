
-- Create a table to store IFS module mapping data directly from Excel
CREATE TABLE public.ifs_module_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_code TEXT NOT NULL,
  module_name TEXT NOT NULL,
  description TEXT,
  min_version TEXT,
  ml_capabilities TEXT[], -- Array of ML capabilities
  primary_industry TEXT,
  release_version TEXT,
  base_ifs_version TEXT, -- Cloud or Remote
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_ifs_module_mappings_industry ON public.ifs_module_mappings(primary_industry);
CREATE INDEX idx_ifs_module_mappings_version ON public.ifs_module_mappings(release_version);
CREATE INDEX idx_ifs_module_mappings_base_version ON public.ifs_module_mappings(base_ifs_version);
CREATE INDEX idx_ifs_module_mappings_capabilities ON public.ifs_module_mappings USING GIN(ml_capabilities);

-- Enable RLS (though this data might be public)
ALTER TABLE public.ifs_module_mappings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading for all authenticated users
CREATE POLICY "Allow read access to IFS module mappings" 
  ON public.ifs_module_mappings 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy to allow insert/update for service role (for data loading)
CREATE POLICY "Allow service role to manage IFS module mappings" 
  ON public.ifs_module_mappings 
  FOR ALL 
  TO service_role
  USING (true);
