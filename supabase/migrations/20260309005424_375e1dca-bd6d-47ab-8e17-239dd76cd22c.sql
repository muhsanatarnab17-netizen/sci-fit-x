-- ==========================================
-- PRIORITY 1: SECURITY - Restrict ALL RLS policies to authenticated role ONLY
-- ==========================================
-- This migration removes 'anon' access from all tables to prevent unauthorized data access

-- 1. POSTURE ASSESSMENTS - Restrict to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can manage their own posture assessments" ON public.posture_assessments;

CREATE POLICY "Authenticated users can manage their own posture assessments"
ON public.posture_assessments
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. WORKOUT LOGS - Restrict to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can manage their own workout logs" ON public.workout_logs;

CREATE POLICY "Authenticated users can manage their own workout logs"
ON public.workout_logs
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. MEAL LOGS - Restrict to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can manage their own meal logs" ON public.meal_logs;

CREATE POLICY "Authenticated users can manage their own meal logs"
ON public.meal_logs
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. WEIGHT LOGS - Restrict to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can manage their own weight logs" ON public.weight_logs;

CREATE POLICY "Authenticated users can manage their own weight logs"
ON public.weight_logs
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. DAILY TASKS - Restrict to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can manage their own daily tasks" ON public.daily_tasks;

CREATE POLICY "Authenticated users can manage their own daily tasks"
ON public.daily_tasks
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. PROFILES - Restrict to authenticated users only (split policies by action)
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);