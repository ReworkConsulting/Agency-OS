-- Migration 008: Workflow versioning
-- Records which workflow file and exact file hash was used for each run.
-- Enables reproducibility auditing: if a run produces unexpected output,
-- you can compare against the workflow file version that was active at run time.

alter table workflow_runs
  add column if not exists workflow_file      text,
  add column if not exists workflow_file_hash text;

comment on column workflow_runs.workflow_file      is 'Relative path of the workflow markdown file used, e.g. workflows/build_icp.md';
comment on column workflow_runs.workflow_file_hash is 'SHA-256 hex digest of the workflow file contents at time of run';
