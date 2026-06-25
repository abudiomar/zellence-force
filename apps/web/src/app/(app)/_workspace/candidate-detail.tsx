"use client";

import React from "react";
import type { ApplicantReviewQueueItem } from "@zellforce/contracts";
import { useTranslations } from "next-intl";
import { ExternalLink, FileText, ImageOff } from "lucide-react";
import { StatusBadge } from "@zellforce/ui/components/badge";
import { DialogContent, DialogRoot, DialogTitle } from "@zellforce/ui/components/dialog";
import { contractTone, interviewTone, screeningTone } from "./helpers";
import { resolveMedia, type MediaKind } from "./drive-media";
import { useStatusLabels } from "./status-labels";

// Inline previewer for a single uploaded asset (photo or CV). Tries to render
// the file in-app (image or Drive/PDF iframe); if the source fails to load it
// degrades to an "open original" link rather than a broken frame.
function AssetPreview({ url, hint }: { url: string | null | undefined; hint: MediaKind }) {
  const t = useTranslations("app.detail");
  const [failed, setFailed] = React.useState(false);
  const media = resolveMedia(url, hint);

  if (!media) {
    return (
      <div className="asset-preview asset-preview--empty">
        {hint === "image" ? <ImageOff aria-hidden /> : <FileText aria-hidden />}
        <span>{hint === "image" ? t("noPhoto") : t("noCv")}</span>
      </div>
    );
  }

  const openLink = (
    <a className="asset-preview__open" href={media.href} target="_blank" rel="noreferrer">
      <ExternalLink size={14} aria-hidden />
      {t("openOriginal")}
    </a>
  );

  if (!failed && media.imageSrc) {
    return (
      <div className="asset-preview">
        <img src={media.imageSrc} alt={t("photoAlt")} onError={() => setFailed(true)} />
        {openLink}
      </div>
    );
  }

  if (!failed && media.embedSrc) {
    return (
      <div className="asset-preview asset-preview--doc">
        <iframe src={media.embedSrc} title={t("cvTitle")} loading="lazy" onError={() => setFailed(true)} />
        {openLink}
      </div>
    );
  }

  // Unknown type, or an embed that failed to load.
  return (
    <div className="asset-preview asset-preview--fallback">
      <FileText aria-hidden />
      <span>{t("cannotPreview")}</span>
      {openLink}
    </div>
  );
}

// First+last initials, used when there's no headshot to pin to the CV.
function initialsOf(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase() || "?";
}

// Candidate headshot pinned to the CV's top-left corner, styled as a small photo
// "print" affixed to the document (cream mat + gold ring + lifted shadow) so the
// face and the resume read as a single artifact. Falls back to initials when no
// photo is available; clicking opens the full-resolution original.
function CvPhoto({ url, name }: { url: string | null | undefined; name: string | null | undefined }) {
  const t = useTranslations("app.detail");
  const [failed, setFailed] = React.useState(false);
  const media = resolveMedia(url, "image");
  const src = media?.imageSrc ?? null;

  const inner = src && !failed ? (
    <img src={src} alt={t("photoAlt")} onError={() => setFailed(true)} />
  ) : (
    <span className="cv-photo__initials" aria-hidden>{initialsOf(name)}</span>
  );

  if (media?.href) {
    return (
      <a className="cv-photo" href={media.href} target="_blank" rel="noreferrer" title={t("openOriginal")}>
        {inner}
        <span className="cv-photo__hint" aria-hidden>
          <ExternalLink size={12} />
        </span>
      </a>
    );
  }

  return <div className="cv-photo">{inner}</div>;
}

// "languages you speak" arrives as a free-text list. Split on the common
// separators (comma, Arabic comma, slash, semicolon, "and"/"و") into chips.
function splitLanguages(value: string): string[] {
  return value
    .split(/[,،/;]|\s+(?:and|و)\s+/gi)
    .map((part) => part.trim())
    .filter(Boolean);
}

function DetailField({
  label,
  value,
  dir,
  wide
}: {
  label: string;
  value: React.ReactNode;
  dir?: "ltr" | "rtl";
  wide?: boolean;
}) {
  return (
    <div className={wide ? "detail-field detail-field--wide" : "detail-field"}>
      <span className="detail-field__label">{label}</span>
      <span className="detail-field__value" dir={dir}>{value || "—"}</span>
    </div>
  );
}

export function CandidateDetailDialog({
  applicant,
  open,
  onOpenChange,
  actions
}: {
  applicant: ApplicantReviewQueueItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions?: React.ReactNode;
}) {
  const t = useTranslations("app.detail");
  const tc = useTranslations("app");
  const labels = useStatusLabels();

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      {applicant ? (
        <DialogContent className="candidate-detail-dialog">
          <DialogTitle className="candidate-detail-dialog__title">
            {applicant.fullName ?? t("unnamed")}
          </DialogTitle>

          <div className="candidate-detail-dialog__body">
            {/* The CV is the centerpiece: a tall, readable document with the
                candidate's headshot pinned to its top-left corner. */}
            <div className="candidate-detail-dialog__stage">
              <div className="cv-stage">
                <AssetPreview url={applicant.cvUrl} hint="document" />
                <CvPhoto url={applicant.photoUrl} name={applicant.fullName} />
              </div>
            </div>

            {/* Everything a staffing manager needs to make the call: status,
                the application facts as compact rows, then the decision panel. */}
            <aside className="candidate-detail-dialog__panel">
              <div className="candidate-detail-dialog__badges">
                <StatusBadge tone={screeningTone(applicant.screeningStatus)} label={labels.screening(applicant.screeningStatus)} />
                <StatusBadge tone={interviewTone(applicant.interviewStatus)} label={labels.interview(applicant.interviewStatus)} />
                <StatusBadge tone={contractTone(applicant.contractStatus)} label={labels.contract(applicant.contractStatus)} />
              </div>

              <section className="detail-fields">
                <h4>{t("formData")}</h4>
                <div className="detail-fields__grid">
                  <DetailField label={t("phone")} value={applicant.phone} dir="ltr" />
                  <DetailField label={t("age")} value={applicant.age ? String(applicant.age) : ""} />
                  <DetailField label={t("email")} value={applicant.email} dir="ltr" wide />
                  <DetailField label={t("city")} value={applicant.city} />
                  <DetailField label={t("nationality")} value={applicant.nationality} />
                  <DetailField label={t("gender")} value={applicant.gender} />
                  <DetailField label={t("englishLevel")} value={applicant.englishLevel} />
                  <DetailField
                    label={t("canTravel")}
                    value={applicant.canTravel === true ? tc("yes") : applicant.canTravel === false ? tc("no") : ""}
                  />
                  <DetailField label={t("submittedAt")} value={applicant.submittedAt} dir="ltr" />
                </div>
                {applicant.languages ? (
                  <div className="detail-languages">
                    <span className="detail-field__label">{t("languages")}</span>
                    <div className="detail-languages__chips">
                      {splitLanguages(applicant.languages).map((language) => (
                        <span key={language} className="detail-chip">{language}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {applicant.experience ? (
                  <div className="detail-fields__experience">
                    <span className="detail-field__label">{t("experience")}</span>
                    <p>{applicant.experience}</p>
                  </div>
                ) : null}
              </section>

              {actions ? <div className="candidate-detail-dialog__actions">{actions}</div> : null}
            </aside>
          </div>
        </DialogContent>
      ) : null}
    </DialogRoot>
  );
}
