
-- Drop the existing policy that allows anonymous access
DROP POLICY IF EXISTS "Users can manage their own workout logs" ON public.workout_logs;

-- Recreate with explicit authenticated role restriction
CREATE POLICY "Users can manage their own workout logs"
ON public.workout_logs
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
