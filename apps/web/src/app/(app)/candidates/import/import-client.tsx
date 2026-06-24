"use client";

import React from "react";
import type { GoogleSheetMapping, SheetTab } from "@zellforce/contracts";
import { Clipboard, FileText, Filter, RefreshCw, Search, Sheet } from "lucide-react";
import { AlertBanner } from "@zellforce/ui/components/alert";
import { Button } from "@zellforce/ui/components/button";
import { TextInput } from "@zellforce/ui/components/input";
import { Field } from "@zellforce/ui/components/label";
import { Select } from "@zellforce/ui/components/select";
import { listApplicantSheetTabs, previewApplicantSheetHeaders, runApplicantImport } from "../../_workspace/api";
import { EmptyLine, PanelHeader, WorkspaceFeedback, WorkspaceHeader } from "../../_workspace/components";
import {
  applicantMappingFields,
  autoMapGoogleSheetColumns,
  buildGoogleSheetRange,
  chooseDefaultSheetTab,
  chooseInitialSheetTab,
  getImportReadiness,
  parseGoogleSheetGid,
  parseGoogleSheetReference
} from "../../_workspace/import-setup";
import { useWorkspaceData } from "../../_workspace/use-workspace-data";

const serviceAccountEmail = "sheet-editor-bot@zellence.iam.gserviceaccount.com";
const emptyMapping: GoogleSheetMapping = { fullName: "", phone: "" };

export function ImportClient() {
  // Import does not list any of the workspace resources; it only needs the
  // busy/status/error machinery, so it opts into no resources.
  const { busy, status, error, runBusy } = useWorkspaceData({});
  const [sheetReference, setSheetReference] = React.useState("local-demo");
  const [tabs, setTabs] = React.useState<SheetTab[]>([]);
  const [selectedTab, setSelectedTab] = React.useState("");
  const [mapping, setMapping] = React.useState<GoogleSheetMapping>(emptyMapping);
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [sampleRows, setSampleRows] = React.useState<Array<Record<string, unknown>>>([]);
  const [showMapping, setShowMapping] = React.useState(false);
  const sourceId = parseGoogleSheetReference(sheetReference);
  const sheetGid = parseGoogleSheetGid(sheetReference);
  const sourceRange = sourceId === "local-demo" ? "Form Responses 1!A:Z" : buildGoogleSheetRange(selectedTab);
  const readiness = getImportReadiness(mapping);
  const mappedSample = sampleRows[0] ? createMappedPreview(sampleRows[0], mapping) : null;

  async function loadTabs() {
    const result = await listApplicantSheetTabs({ sourceId });
    const sortedTabs = [...result.tabs].sort((left, right) => left.index - right.index);
    const nextSelectedTab = selectedTab || chooseInitialSheetTab(sortedTabs, sheetGid);
    setTabs(sortedTabs);
    setSelectedTab(nextSelectedTab);
    return { tabs: sortedTabs, selectedTab: nextSelectedTab };
  }

  async function previewColumnsForTab(tabName: string) {
    const preview = await previewApplicantSheetHeaders({
      sourceId,
      sourceRange: sourceId === "local-demo" ? "Form Responses 1!A:Z" : buildGoogleSheetRange(tabName)
    });
    const nextMapping = { ...mapping, ...autoMapGoogleSheetColumns(preview.headers) };
    setMapping(nextMapping);
    setHeaders(preview.headers);
    setSampleRows(preview.sampleRows);
    return `${preview.headers.length} columns detected`;
  }

  async function detectColumns() {
    const tabState = tabs.length === 0 ? await loadTabs() : { tabs, selectedTab };
    const tabForPreview = tabState.selectedTab || chooseDefaultSheetTab(tabState.tabs);
    return previewColumnsForTab(tabForPreview);
  }

  return (
    <div className="candidate-workspace">
      <WorkspaceHeader
        eyebrow="Import"
        title="Connect Google Form applicants"
        actions={
          <Button type="button" loading={busy} disabled={!readiness.ready || !sourceId} onClick={() => void runBusy(async () => {
            const result = await runApplicantImport({ sourceId, sourceRange, mapping });
            return `Import ${result.status}: ${result.rowsImported} imported, ${result.rowsFailed} failed`;
          })}>
            <RefreshCw aria-hidden />Import applicants
          </Button>
        }
      />

      <WorkspaceFeedback status={status} error={error} />

      <section className="candidate-grid">
        <div className="candidate-panel candidate-panel--wide">
          <PanelHeader icon={<Sheet />} title="Google Form response Sheet" />
          <div className="import-share-card">
            <div>
              <strong>Share the Sheet with Zell-force</strong>
              <p>{serviceAccountEmail}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void navigator.clipboard?.writeText(serviceAccountEmail)}
            >
              <Clipboard aria-hidden />Copy email
            </Button>
          </div>
          <div className="candidate-form-grid">
            <Field label="Google Sheet link">
              <TextInput
                value={sheetReference}
                onChange={(event) => {
                  setSheetReference(event.currentTarget.value);
                  setTabs([]);
                  setSelectedTab("");
                  setHeaders([]);
                  setSampleRows([]);
                }}
                placeholder="Paste the Sheet link"
              />
            </Field>
            <Field label="Applicant tab">
              <Select
                value={selectedTab}
                onChange={(event) => {
                  const nextTab = event.currentTarget.value;
                  setSelectedTab(nextTab);
                  void runBusy(() => previewColumnsForTab(nextTab));
                }}
                disabled={tabs.length === 0}
              >
                {tabs.length === 0 ? <option value="">Detected from the Sheet link</option> : null}
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.title}>{tab.title}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="candidate-actions">
            <Button type="button" variant="secondary" loading={busy} onClick={() => void runBusy(detectColumns)}>
              <Search aria-hidden />Detect columns
            </Button>
            <Button type="button" loading={busy} onClick={() => void runBusy(async () => {
              const result = await runApplicantImport({ sourceId, sourceRange, mapping });
              return `Import ${result.status}: ${result.rowsImported} imported, ${result.rowsFailed} failed`;
            })}>
              <RefreshCw aria-hidden />Sync Google Sheet
            </Button>
          </div>
          <div className="header-chip-list" aria-label="Detected columns">
            {headers.map((header) => <span key={header}>{header}</span>)}
            {headers.length === 0 ? <span>No columns detected yet</span> : null}
          </div>
        </div>

        <div className="candidate-panel">
          <PanelHeader
            icon={<Filter />}
            title="Match form questions"
            actionLabel={showMapping ? "Hide" : "Edit"}
            onAction={() => setShowMapping((value) => !value)}
          />
          {readiness.ready ? (
            <AlertBanner tone="success" title="Ready to import" />
          ) : (
            <AlertBanner tone="warning" title={`Missing: ${readiness.missing.join(", ")}`} />
          )}
          {showMapping ? (
            <div className="mapping-grid">
              {applicantMappingFields.map((field) => (
                <Field key={field.key} label={`${field.label}${field.required ? " *" : ""}`}>
                  <Select
                    value={mapping[field.key] ?? ""}
                    onChange={(event) => setMapping({ ...mapping, [field.key]: event.currentTarget.value })}
                  >
                    <option value="">Not collected</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </Select>
                </Field>
              ))}
            </div>
          ) : (
            <div className="mapping-summary">
              <p className="text-muted">Detected columns are matched automatically. Review them before import.</p>
              {applicantMappingFields.filter((field) => mapping[field.key]).map((field) => (
                <div key={field.key}>
                  <span>{field.label}</span>
                  <strong>{mapping[field.key]}</strong>
                </div>
              ))}
              {headers.length === 0 ? <EmptyLine label="Detect columns to match form questions" /> : null}
            </div>
          )}
        </div>

        <div className="candidate-panel candidate-panel--wide">
          <PanelHeader icon={<FileText />} title="Candidate preview" />
          <div className="import-preview-grid">
            {mappedSample ? (
              <div className="mapped-preview-card">
                <div><span>Name</span><strong>{mappedSample.fullName || "-"}</strong></div>
                <div><span>WhatsApp</span><strong>{mappedSample.phone || "-"}</strong></div>
                <div><span>City</span><strong>{mappedSample.city || "-"}</strong></div>
                <div><span>Photo</span><strong>{mappedSample.photoUrl ? "Available" : "-"}</strong></div>
              </div>
            ) : (
              <EmptyLine label="Detect columns to preview candidates" />
            )}
            <div className="raw-data-grid">
              {sampleRows.slice(0, 2).map((row, index) => (
                <pre key={index}>{JSON.stringify(row, null, 2)}</pre>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function createMappedPreview(row: Record<string, unknown>, mapping: GoogleSheetMapping) {
  return {
    fullName: readMappedValue(row, mapping.fullName),
    phone: readMappedValue(row, mapping.phone),
    city: readMappedValue(row, mapping.city),
    photoUrl: readMappedValue(row, mapping.photoUrl)
  };
}

function readMappedValue(row: Record<string, unknown>, column: string | undefined) {
  if (!column) return "";
  return String(row[column] ?? "");
}
