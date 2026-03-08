
-- Fix RLS policies: add explicit TO authenticated on all tables

-- profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- meal_logs
DROP POLICY IF EXISTS "Users can manage their own meal logs" ON public.meal_logs;
CREATE POLICY "Users can manage their own meal logs"
  ON public.meal_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- posture_assessments
DROP POLICY IF EXISTS "Users can manage their own posture assessments" ON public.posture_assessments;
CREATE POLICY "Users can manage their own posture assessments"
  ON public.posture_assessments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- daily_tasks
DROP POLICY IF EXISTS "Users can manage their own daily tasks" ON public.daily_tasks;
CREATE POLICY "Users can manage their own daily tasks"
  ON public.daily_tasks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- weight_logs
DROP POLICY IF EXISTS "Users can manage their own weight logs" ON public.weight_logs;
CREATE POLICY "Users can manage their own weight logs"
  ON public.weight_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
