alter table applicant_import_rows
  add column if not exists source_id text,
  add column if not exists source_range text;

update applicant_import_rows rows
set source_id = runs.source_id,
    source_range = runs.source_range
from applicant_import_runs runs
where rows.import_run_id = runs.id
  and (rows.source_id is null or rows.source_range is null);

with ranked as (
  select id,
         row_number() over (
           partition by tenant_id, source_id, source_range, source_row_id
           order by updated_at desc, created_at desc, id desc
         ) as row_number
  from applicant_import_rows
  where source_id is not null
    and source_range is not null
)
delete from applicant_import_rows
where id in (
  select id from ranked where row_number > 1
);

alter table applicant_import_rows
  alter column source_id set not null,
  alter column source_range set not null;

create unique index if not exists idx_applicant_rows_tenant_source_row_identity
  on applicant_import_rows (tenant_id, source_id, source_range, source_row_id);
