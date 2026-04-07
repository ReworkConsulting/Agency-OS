-- ============================================================
-- 007_mission_control.sql
-- Agency OS — Mission Control tables
-- tasks, task_activities, kpi_snapshots, alerts, notifications
-- ============================================================

-- ── Tasks ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text NOT NULL,
  description text,
  status      text DEFAULT 'inbox'  CHECK (status  IN ('inbox','assigned','in_progress','review','done')),
  priority    text DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  client_id   uuid REFERENCES clients(id)    ON DELETE SET NULL,
  due_date    date,
  tags        text[],
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tasks_status_idx     ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_assigned_idx   ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS tasks_client_idx     ON tasks(client_id);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx   ON tasks(due_date);

-- ── Task Activities ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_activities (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id       uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  actor_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type text NOT NULL,  -- 'created' | 'status_changed' | 'assigned' | 'comment' | 'flagged'
  message       text,
  metadata      jsonb,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS task_activities_task_idx ON task_activities(task_id);

-- ── KPI Snapshots ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id   uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  period      date NOT NULL,   -- always store as first-of-month: 2026-03-01
  metric_name text NOT NULL,   -- 'ad_spend' | 'leads' | 'cpl' | 'appointments' | 'show_rate' | 'revenue_generated'
  value       numeric NOT NULL,
  notes       text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (client_id, period, metric_name)
);

CREATE INDEX IF NOT EXISTS kpi_client_period_idx ON kpi_snapshots(client_id, period);

-- ── Alerts ───────────────────────────────────────────────────
-- First-class, user-manageable objects.
-- Can be created manually, from a task/client, or auto-detected.
CREATE TABLE IF NOT EXISTS alerts (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text NOT NULL,
  description  text,
  severity     text DEFAULT 'info' CHECK (severity IN ('info','warning','urgent','critical')),
  status       text DEFAULT 'open' CHECK (status   IN ('open','acknowledged','resolved')),
  source_type  text,   -- 'manual' | 'task' | 'client' | 'system'
  source_id    text,   -- uuid of the related entity (as text to be flexible)
  client_id    uuid REFERENCES clients(id)    ON DELETE SET NULL,
  assigned_to  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at  timestamptz,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS alerts_status_idx   ON alerts(status);
CREATE INDEX IF NOT EXISTS alerts_severity_idx ON alerts(severity);
CREATE INDEX IF NOT EXISTS alerts_client_idx   ON alerts(client_id);

-- ── Notifications ────────────────────────────────────────────
-- Per-user inbox items. Created by server actions.
CREATE TABLE IF NOT EXISTS notifications (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         text NOT NULL,   -- 'task_assigned' | 'alert_created' | 'alert_updated' | 'workflow_complete'
  title        text NOT NULL,
  message      text,
  source_type  text,
  source_id    text,
  read_at      timestamptz,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_recipient_idx ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS notifications_unread_idx    ON notifications(recipient_id, read_at) WHERE read_at IS NULL;

-- ── updated_at triggers ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER kpi_snapshots_updated_at
  BEFORE UPDATE ON kpi_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS Policies ─────────────────────────────────────────────
-- All authenticated users can read/write tasks, alerts, kpis, notifications
ALTER TABLE tasks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_snapshots    ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;

-- Tasks: all authenticated users can manage tasks
CREATE POLICY "authenticated users manage tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated users manage task_activities"
  ON task_activities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- KPIs: all authenticated users can manage KPI data
CREATE POLICY "authenticated users manage kpi_snapshots"
  ON kpi_snapshots FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Alerts: all authenticated users can manage alerts
CREATE POLICY "authenticated users manage alerts"
  ON alerts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Notifications: users can only see/manage their own
CREATE POLICY "users manage own notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Service role bypass (for server-side operations)
CREATE POLICY "service role full access tasks"          ON tasks           FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service role full access task_activities" ON task_activities FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service role full access kpi_snapshots"  ON kpi_snapshots   FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service role full access alerts"         ON alerts          FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service role full access notifications"  ON notifications   FOR ALL TO service_role USING (true) WITH CHECK (true);
