-- Add Tri-Metric columns to posture_assessments
ALTER TABLE public.posture_assessments 
ADD COLUMN IF NOT EXISTS cva_angle DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS shoulder_alignment DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS symmetry_score DECIMAL(5,2);

-- Also add these to profiles to keep track of latest metrics
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS latest_cva_angle DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS latest_shoulder_alignment DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS latest_symmetry_score DECIMAL(5,2);
