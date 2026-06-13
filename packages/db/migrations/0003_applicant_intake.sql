create unique index if not exists idx_applicant_rows_tenant_run_source_row
  on applicant_import_rows (tenant_id, import_run_id, source_row_id);
