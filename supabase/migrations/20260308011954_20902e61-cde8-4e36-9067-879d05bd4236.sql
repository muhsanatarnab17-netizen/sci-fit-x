
-- Fix workout_logs: drop and recreate with TO authenticated
DROP POLICY IF EXISTS "Users can manage their own workout logs" ON public.workout_logs;
CREATE POLICY "Users can manage their own workout logs"
  ON public.workout_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix meal_logs
DROP POLICY IF EXISTS "Users can manage their own meal logs" ON public.meal_logs;
CREATE POLICY "Users can manage their own meal logs"
  ON public.meal_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix posture_assessments
DROP POLICY IF EXISTS "Users can manage their own posture assessments" ON public.posture_assessments;
CREATE POLICY "Users can manage their own posture assessments"
  ON public.posture_assessments FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix daily_tasks
DROP POLICY IF EXISTS "Users can manage their own daily tasks" ON public.daily_tasks;
CREATE POLICY "Users can manage their own daily tasks"
  ON public.daily_tasks FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix weight_logs
DROP POLICY IF EXISTS "Users can manage their own weight logs" ON public.weight_logs;
CREATE POLICY "Users can manage their own weight logs"
  ON public.weight_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
