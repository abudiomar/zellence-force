# Phase 7A: UI/UX Foundations Research

**Project:** Zell-force  
**Client / Business Owner:** MAG Events  
**Document status:** Research package for approval  
**Date:** 2026-06-10  
**Important:** This is not the final wireframe specification. Do not create `docs/07_UI_UX_Wireframe_Specification.md` until these foundations are approved.

---

## A. Executive Recommendation

Zell-force should feel like a **calm Arabic-first operations console**: serious, fast, dense, trustworthy, and built for repeated daily work. It should avoid public-event glamour, generic AI SaaS styling, decorative dashboards, and card-heavy layouts.

Recommended direction:

> **Calm Operations Console**, with optional compact density for expert users and a separate mobile-first Supervisor pattern.

Product personality:

- quiet enterprise confidence;
- high information density without visual noise;
- Arabic-first RTL, not mirrored LTR as an afterthought;
- tables and structured lists for operational data;
- spreadsheet-like controlled grids for budget/payment work;
- visible approval, locked, error, and review states;
- mobile attendance optimized for field pressure, not compressed desktop.

---

## B. Research Summary

### Key Findings

| Finding | Source | Zell-force implication |
|---|---|---|
| Cards are best used as short, linked snapshots of one conceptual unit, not as a default container for every page section. | [NN/g Cards](https://www.nngroup.com/articles/cards-component/), [Material Cards](https://m3.material.io/components/cards/guidelines) | Use cards for compact dashboard summaries, empty states, and worker token pages; avoid card grids for core operational records. |
| Overused cards can make content harder to understand; structured content should be tested before adding card treatment. | [DfE Card Guidance](https://design.education.gov.uk/design-system/components/card), [NHS Card Guidance](https://service-manual.nhs.uk/design-system/components/card) | Prefer headings, panels, tables, summary lists, and dividers before adding raised/outlined cards. |
| Data tables support finding, comparing, row editing, and record actions better than cards for multivariate workplace data. | [NN/g Data Tables](https://www.nngroup.com/articles/data-tables/) | Staff, applicants, payments, contracts, users, and reports should be table-first. |
| Large data tables need frozen headers/columns, active filter indicators, column control, sorting, and visible batch actions. | [NN/g Data Tables](https://www.nngroup.com/articles/data-tables/), [Carbon Data Table](https://carbondesignsystem.com/components/data-table/usage/) | Staff DB and payment review need saved views, sticky headers, column visibility, and bulk actions. |
| Index-table patterns support search, filters, sorting, pagination, saved views, row navigation, and bulk actions for long object lists. | [Shopify Polaris Index Table](https://polaris-react.shopify.com/components/tables/index-table), [Shopify Polaris Index Filters](https://polaris-react.shopify.com/components/selection-and-input/index-filters) | Staff, events, payments, contracts, users, applicants, and message logs should use index-table/list-report patterns. |
| Operational dashboards should help users act quickly; charts should support concrete decisions. | [NN/g Dashboards](https://www.nngroup.com/articles/dashboards-preattentive/) | Dashboards should show staffing risk, contract gaps, payment approvals, not decorative charts. |
| Enterprise object pages group one business object into categorized sections with tab/anchor access. | [SAP Fiori Object Page](https://www.sap.com/design-system/fiori-design-web/v1-145/page-types/floorplans/object-page/usage) | Event Detail should be central workspace with tabs. |
| Spacing systems use tokens to control density and consistency; 4/8 systems support both micro and layout spacing. | [Carbon Spacing](https://carbondesignsystem.com/elements/spacing/overview/), [Atlassian Spacing](https://atlassian.design/foundations/spacing), [Material Spacing](https://m3.material.io/foundations/layout/grids-spacing/spacing) | Use 4px micro grid + 8px layout rhythm. |
| Product typography can use productive/dense and expressive/larger sets. | [Carbon Typography](https://carbondesignsystem.com/elements/typography/type-sets/), [Fluent Typography](https://fluent2.microsoft.design/typography) | Use compact productive type for data screens; reserve large type for dashboards only. |
| RTL requires structural direction attributes, mirrored navigation/flow icons, and careful mixed-content handling. | [Material RTL](https://m3.material.io/foundations/layout/bidirectionality-rtl), [W3C HTML dir](https://www.w3.org/International/questions/qa-html-dir.en.html) | Use `dir="rtl"` app shell, `dir="ltr"`/`bdi` for phone, email, file names, numbers. |
| WCAG 2.2 covers keyboard, contrast, focus, target size, labels, errors, and status messages as testable requirements. | [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) | Accessibility must be in wireframes, not QA-only. |
| Touch targets should be large enough for mobile use; Material recommends 48 x 48dp for touch. | [Material Touch Targets](https://m3.material.io/foundations/designing/structure), [Android Accessibility](https://support.google.com/accessibility/android/answer/7101858) | Supervisor attendance controls need 48px target minimum. |
| Validation errors should appear near fields and in a summary for complex forms. | [GOV.UK Validation](https://design-system.service.gov.uk/patterns/validation/) | Long event/budget/staff forms need inline errors + summary. |
| Lists support continuous vertical indexes where users need to find an item and act on it. | [Material Lists](https://m3.material.io/components/lists/guidelines) | Supervisor mobile attendance and roster flows should use structured lists, not desktop cards. |
| Workforce tools emphasize scheduling, attendance, payroll, communication, and mobile work. | [Liveforce](https://liveforce.co/staff-scheduling-features/), [Nowsta](https://www.nowsta.com/), [Deputy](https://www.deputy.com/) | Zell-force should prioritize operational speed, communication status, and event-day mobile actions. |

---

## C. Existing Phase 7 Recommendations Evaluation

| # | Recommendation | Decision | Reason |
|---:|---|---|---|
| 1 | Arabic-first RTL default | Confirm | Core market and product differentiator. |
| 2 | Role-specific dashboards | Confirm | Each role has different first question and action. |
| 3 | Event Detail tabs | Confirm with refinement | Use Object Page pattern; tabs can be hidden/disabled by permission. |
| 4 | Supervisor mobile-first | Confirm | Event-day use is field/mobile pressure. |
| 5 | Large roster rows + fast controls | Confirm | Touch safety and speed. |
| 6 | Staff DB table-first | Confirm | NN/g table research supports multivariate comparison. |
| 7 | Applicant Import separate | Confirm | Prevents dirty imported data polluting staff DB. |
| 8 | Budget spreadsheet-like controlled grid | Confirm | Finance/budget work needs grid affordance but validation/locks. |
| 9 | Billable/cost visually distinct | Confirm | Financial accuracy; not color-only. |
| 10 | Payment Review separate from Attendance | Confirm | Payment approval has different role, lock, and audit logic. |
| 11 | Approval/lock states always visible | Confirm | Prevents accidental edits and payout mistakes. |
| 12 | Public customer pages outside MVP | Confirm | Avoid scope creep. |
| 13 | Worker token pages limited | Confirm | Assignment, confirm/decline, contract view/upload only. |
| 14 | Dense pages use typography/spacing/dividers, not cards everywhere | Confirm | Internal ops UI should be table/panel-first. |

---

## D. Design-Variable Matrix

| Variable | User need | Design implication | Recommended rule | Evidence |
|---|---|---|---|---|
| Trust | Owners/finance need confidence in money/status | Calm visuals, audit states, restrained color | No playful gradients; show source/status/lock | WCAG, SAP Fiori, enterprise WFM patterns |
| Speed | Coordinators need quick staffing | Dense filters, saved views, bulk actions | Table-first with sticky headers and row actions | NN/g tables, Polaris filters |
| Operational clarity | Staff need current event state | One status language across modules | Badges use label + icon + color | WCAG color-not-only |
| Density | Hundreds/thousands of staff | Compact tables with optional comfortable mode | Table row 36/44 desktop, 56 mobile list | Carbon productive type, Material data table density |
| Learnability | Non-technical ops users | Predictable nav, standard forms/tables | Use consistent side nav + event tabs | SAP object page, Fluent consistency |
| Error prevention | Attendance/payment mistakes costly | Locks, confirmations, inline validation | No destructive/financial action without visible state | GOV.UK validation, WCAG error prevention |
| Mobile speed | Supervisor works live event | One-tap controls, large targets | 48px touch targets; no hidden swipe-only actions | Material touch targets |
| Arabic readability | Arabic-first long sessions | Strong Arabic UI font, generous line height | Arabic body line-height 1.55-1.65 | Material Arabic type, typography skill |
| Financial accuracy | Finance compares amounts | Tabular numbers, decimal alignment, labels | `font-variant-numeric: tabular-nums` | Typography skill, enterprise tables |
| Accessibility | Broad staff ability/device quality | Keyboard, focus, contrast, labels | WCAG 2.2 AA baseline | W3C WCAG 2.2 |
| Scalability | Future SaaS | Tokenized design system | No raw hex/spacing in screens | Design-system skill, Atlassian tokens |
| Developer maintainability | AI/dev teams need consistency | Tokens + documented patterns | Components mapped to use-cases/states | Design-system skill |

---

## E. Design Direction Comparison

Score: 10 = strongest fit for Zell-force MVP.

| Direction | Design thesis | Strengths | Risks | Best-fit areas | Score |
|---|---|---|---|---|---:|
| A. Calm Operations Console | Neutral surfaces, restrained teal/blue, table-first, high clarity | Best balance of trust, speed, density | May feel conservative if under-polished | Whole MVP | 9.2 |
| B. Gulf Enterprise Control Centre | Deep green/navy, formal, regionally grounded | Strong Saudi/Gulf authority | Can become too governmental/heavy | Owner/Admin dashboards | 8.1 |
| C. High-Density Workforce Workspace | Compact data grid, minimal chrome, expert power UI | Fast for daily experts | Harder for new users; accessibility risk if too tight | Staff DB, payments | 8.0 |
| D. Field Ops Mobile Command | Large touch rows, status-first mobile, high contrast | Excellent supervisor usability | Not suitable for desktop admin density | Supervisor/worker token pages | 8.4 |
| E. Finance Ledger Console | Ledger-like alignment, numeric rigor, restrained statuses | Great for payments/budget | Too dry for HR/coordinator workflows | Budget, payments, exports | 7.7 |
| F. Recruitment Pipeline Studio | Kanban/list hybrid for screening/interviews/contracts | Strong HR clarity | Could fragment event-centric workflow | HR dashboard, import queue | 7.4 |
| G. SAP/Fiori Object Workspace | List report + object page enterprise pattern | Proven for complex business objects | Can feel generic enterprise if copied too closely | Event Detail workspace | 8.3 |
| H. WhatsApp-Native Ops Console | Messaging timeline and worker response status central | Highlights product differentiator | Messaging can overpower core operations | Messages/contracts/invitations | 7.6 |

**Recommendation:** adopt **A. Calm Operations Console** as master direction, borrow **D** for Supervisor/token flows, **E** for payment/budget tables, and **G** for Event Detail object workspace.

---

## F. Typography Research and Recommendation

### Font Pairing Options

| Option | Arabic readability | English readability | Authority | Warmth | Density/table fit | Licensing/load | Suitability |
|---|---|---|---|---|---|---|---|
| IBM Plex Sans Arabic + IBM Plex Sans | High | High | High | Medium | High | Open source; load 4 weights | Best enterprise fit |
| Readex Pro single family | Very high for Arabic/Latin | High | Medium | High | Medium | Open source; variable/static | Best approachable/mobile fit |
| Noto Sans Arabic + Inter | High coverage | Very high | Medium | Low-medium | High | Open source; common | Strong fallback, generic |
| Tajawal/Cairo + Inter | Familiar Arabic web feel | High | Medium-low | High | Medium-low | Open source | More marketing/consumer feel |

**Primary recommendation:** `IBM Plex Sans Arabic` for Arabic UI + `IBM Plex Sans` for Latin UI.  
Reason: enterprise tone, consistent family, good table density, multiple weights, open licensing.

**Fallback recommendation:** `Noto Sans Arabic` + system UI / `Inter`.  
Reason: broad script coverage and safer fallback if Plex Arabic rendering is weaker on a target device.

**Optional mobile/token variant:** test `Readex Pro` for token pages only if Plex feels too formal for worker-facing mobile pages. Keep same tokens.

### Typography Tokens

Desktop productive scale:

| Token | Size / line | Weight | Use |
|---|---|---:|---|
| `text-page-title` | 24 / 32 | 600 | Page titles |
| `text-section-title` | 18 / 28 | 600 | Major sections/panel titles |
| `text-subsection` | 16 / 24 | 600 | Subsections |
| `text-body` | 14 / 22 Arabic, 14 / 20 English | 400 | Main UI text |
| `text-secondary` | 13 / 20 | 400 | Secondary metadata |
| `text-label` | 13 / 18 | 500 | Form labels |
| `text-input` | 14 / 22 Arabic, 14 / 20 English | 400 | Inputs |
| `text-table-header` | 12 / 16 | 600 | Table headers |
| `text-table-cell` | 13 / 20 | 400 | Dense cells |
| `text-badge` | 12 / 16 | 500 | Status badges |
| `text-button` | 14 / 20 | 600 | Buttons |
| `text-metric` | 28 / 36 | 600 | Dashboard metric |
| `text-money` | 13 / 20 | 500 | Numeric money cells |
| `text-helper` | 12 / 18 | 400 | Helper/errors |

Mobile/supervisor:

| Token | Size / line | Weight | Use |
|---|---|---:|---|
| `mobile-title` | 20 / 28 | 600 | Event title |
| `mobile-row-primary` | 16 / 26 Arabic, 16 / 24 English | 500 | Worker name |
| `mobile-row-secondary` | 13 / 20 | 400 | Role/status |
| `mobile-button` | 16 / 24 | 600 | Attendance actions |

Typography behavior:

- minimum body text: 14px desktop data UI, 16px mobile/token pages;
- no viewport-width type scaling; use fixed token steps by breakpoint;
- Arabic line-height +2px to +4px over English equivalent;
- labels use sentence case in English; natural Arabic labels, not all-caps;
- numbers and money use tabular lining numerals;
- SAR format: `SAR 1,250.00` in English, `1,250.00 ر.س` in Arabic if client prefers Arabic currency display;
- phone, email, file names, IDs use LTR isolation;
- long Arabic names wrap in detail views but truncate with tooltip/expand in dense tables;
- no decorative fonts.

---

## G. Spacing and Layout System

Use combined **4/8 system**:

| Token | px | Use |
|---|---:|---|
| `space-0.5` | 2 | hairline offsets, icon optical alignment only |
| `space-1` | 4 | tight icon/text gaps, table micro gaps |
| `space-2` | 8 | compact row internals, badge padding |
| `space-3` | 12 | table cell horizontal padding, form label gaps |
| `space-4` | 16 | mobile screen padding, panel padding compact |
| `space-5` | 20 | form field vertical rhythm |
| `space-6` | 24 | page section spacing, dashboard grid gap |
| `space-8` | 32 | major sections, desktop page gutters |
| `space-10` | 40 | dashboard band separation |
| `space-12` | 48 | large page blocks |
| `space-16` | 64 | rare page-level separation |

Layout rules:

| Area | Rule |
|---|---|
| Desktop page margin | 24-32px; dense pages 24px |
| Mobile page padding | 16px; token pages 20px max |
| Sidebar | 264px expanded, 72px collapsed; right side in RTL |
| Top bar | 56px desktop, 52px mobile |
| Dashboard grid | 12-column desktop, 6 tablet, 1 mobile |
| Table row height | compact 36px, comfortable 44px, touch/list 56px+ |
| Table cell padding | compact 8px vertical / 10-12px horizontal |
| Form label-input gap | 6-8px |
| Field group gap | 16-20px |
| Section gap | 24-32px |
| Drawer width | 420px small, 520px standard, 640px complex |
| Modal width | 480px confirm, 640px form, 720px max |
| Sticky action bar | 56-64px height, safe-area aware |
| Touch target | 44px minimum web; 48px target for mobile critical actions |

Density strategy:

- support **comfortable** and **compact** table density;
- default comfortable for first-time/pilot users;
- compact saved per user later;
- never shrink mobile touch targets below 48px;
- avoid oversized dashboard widgets and giant page titles.

---

## H. Provisional Color System

### Palette Direction Options

| Palette | Thesis | Strength | Risk | Score |
|---|---|---|---:|
| Calm operations blue-teal | Professional neutral with teal primary and blue info | Best balance | Must avoid generic SaaS blue | 9.0 |
| Deep green Gulf enterprise | Strong regional business feel | Local authority | Can feel governmental/heavy | 8.0 |
| Neutral charcoal + controlled teal | Serious data workspace | Modern, restrained | Needs warmth in Arabic UI | 8.5 |

**Recommended palette:** Calm operations blue-teal, with neutral charcoal foundation.

### Provisional Tokens

| Role | Hex |
|---|---|
| Primary | `#0F766E` |
| Primary hover | `#115E59` |
| Primary pressed | `#134E4A` |
| Primary subtle | `#ECFDF5` |
| Secondary/info accent | `#2563EB` |
| Page background | `#F7F8FA` |
| Raised surface | `#FFFFFF` |
| Secondary surface | `#F1F5F9` |
| Border | `#D8DEE8` |
| Divider | `#E7EBF0` |
| Primary text | `#111827` |
| Secondary text | `#4B5563` |
| Muted text | `#6B7280` |
| Disabled text | `#9CA3AF` |
| Focus ring | `#2563EB` |

### Semantic System

Use few reusable semantic families:

| Meaning | Color | Use |
|---|---|---|
| Success/approved/present | `#15803D` | confirmed success |
| Warning/review/late/pending action | `#B45309` | needs attention |
| Error/declined/absent/negative | `#B91C1C` | failure/critical |
| Info/active/excused | `#2563EB` | neutral information |
| Neutral/draft/inactive/locked | `#64748B` | non-critical state |
| Special backup/takeover | `#7C3AED` | backup takeover/manual adjustment |

Status mapping:

| Status family | Rule |
|---|---|
| Draft/pending | neutral/amber badge + label |
| Confirmed/approved/present | green badge + check icon |
| Declined/absent/error | red badge + clear label |
| Active/excused/info | blue badge |
| Locked | slate badge + lock icon |
| Review required | amber badge + warning icon |
| Backup standby | cyan/blue outline badge |
| Backup takeover | purple badge + replacement label |

Financial color rules:

- billable revenue: blue label/bar;
- internal cost: amber/orange label/bar;
- projected margin: neutral/teal;
- actual positive margin: green + plus label;
- actual negative margin: red + minus label;
- deductions: red text with minus and reason;
- manual adjustment: purple/indigo with required reason;
- unapproved amount: amber outline/status;
- approved amount: green check/status.

Accessibility:

- color never alone; combine label, icon, text, or pattern;
- normal text contrast target: 4.5:1 minimum;
- focus ring should be visible at 2px minimum;
- badges need readable text and not rely on pastel-only contrast;
- low-quality monitors: avoid ultra-light gray text below `#6B7280`.

---

## I. Card Overuse Research and Container Decision Rules

### Why AI-Generated App Designs Overuse Cards

**Research finding:** cards are a legitimate UI pattern, but their intended scope is narrow. NN/g describes cards as short representations of a conceptual unit that group related information and lead to details. Material frames cards around content/actions for a single subject. Carbon treats cards as complex composed patterns rather than default low-level containers, with simpler tiles used only for specific grouping and selection cases. DfE warns that cards can make content harder if overused or misused, and recommends testing plain structured content first.

**Interpretation for AI-generated web apps:** AI tools often overuse cards because cards solve the visual problem faster than they solve the product problem:

- cards hide weak information architecture by wrapping unrelated content in bordered boxes;
- card grids are common in public examples, SaaS templates, and dashboard screenshots, so generated UI imitates them;
- cards make early mockups look "finished" through borders, radius, shadows, and spacing;
- cards are responsive by default because they stack on mobile;
- cards avoid harder decisions about table columns, object hierarchy, filters, bulk actions, and workflow state;
- cards work well in static screenshots but often fail under real operational data volume;
- cards turn every page into many isolated islands, which weakens scanning and comparison.

For Zell-force, this is high risk. The app is not a marketing page. Most users compare records, review exceptions, approve money, track staffing gaps, and operate under time pressure. Card-heavy layouts would slow those tasks.

### What Breaks When Cards Are Overused

| Failure mode | Why it happens | Zell-force impact |
|---|---|---|
| Poor comparison | Each card repeats labels and forces eye movement across blocks | Hard to compare wages, attendance, ratings, payment status, or staff availability |
| Weak bulk action support | Cards do not naturally support column headers, selection, or batch bars | Slower invite, approve, export, lock, resend, assign workflows |
| Excessive scrolling | Cards use more vertical space than rows | Staff DB, applicant queue, contracts, payments become slow |
| Fragmented hierarchy | Every card competes as separate surface | Users miss true priority: understaffed roles, failed messages, locked payments |
| Hidden relationships | Related fields sit in separate blocks | Budget, cost, billable revenue, margin become harder to reconcile |
| Repeated chrome | Each card repeats padding, borders, headings, actions | Dense pages feel busy without showing more useful data |
| Accessibility risk | Fully clickable cards, nested links, and unclear focus regions can confuse keyboard/screen-reader users | Worker/admin pages need explicit links, buttons, focus order |
| False polish | UI looks clean before real data stress | Early approval may hide later operational failure |

### Card Eligibility Test

Use a card only when **all** are true:

1. It represents one independent object, choice, metric, or short summary.
2. User does not need column-level comparison across many similar records.
3. User does not need bulk selection, bulk editing, export, or batch approval.
4. It contains no more than 5-6 key data points.
5. It has one primary click/action and at most one secondary action.
6. Variable height/content improves comprehension instead of hurting scan speed.
7. The number of cards is small, curated, or dashboard-level, not an unbounded result set.
8. It is not the main surface for payment approval, attendance reconciliation, staffing comparison, or budget editing.

If any answer fails, use another pattern.

### Better Alternatives to Cards

| Need | Better pattern | Why better | Zell-force examples |
|---|---|---|---|
| Compare many records | Table / index table | Columns, sort, filter, scan, batch actions | Staff DB, applicants, events, contracts, payments, users |
| Review long object list | List report | Search/filter/saved views + row navigation | Events, reports, message logs |
| Edit numeric operational data | Spreadsheet-like grid | Alignment, validation, formulas, locks | Event budget, wage rules, payment calculations |
| Act quickly on mobile rows | Structured list / roster list | Large touch rows, grouped status, fast actions | Supervisor attendance, backup workers |
| Show one object's full workspace | Object page with tabs/sections | Keeps one business object coherent | Event Detail |
| Inspect/edit one row without losing list context | Side drawer / split pane | Maintains search/filter/table state | Applicant review, staff quick view, contract detail |
| Confirm high-risk action | Dialog | Focuses one decision and explains consequence | Approve payment, lock attendance, delete user |
| Show critical exception | Inline alert / notification banner | More visible than another card; can attach to source | Missing wage rule, failed WhatsApp send |
| Show read-only metadata | Summary list / key-value table | Compact and accessible | Staff profile facts, event overview facts |
| Reveal optional detail | Details/accordion | Keeps dense page calm | Advanced filters, audit history, import diagnostics |
| Show workflow progress | Task list / stepper | Makes state and completion visible | Event setup, contract collection |
| Group related form fields | Fieldset/section panel | Semantic grouping without fake surface depth | Client create, event setup, user create |

### Zell-force Screen-Level Container Rules

| Area | Default container | Card use allowed? | Rule |
|---|---|---:|---|
| Owner/Admin dashboard | Metric strip + prioritized lists/tables | Yes, limited | Max 4-6 KPI cards; exceptions use lists/tables |
| HR dashboard | Queue lists + compact metrics | Limited | New imports may use small metric cards; review queue stays table/list |
| Staff Database | Index table + drawer | No | No staff card grid on desktop |
| Applicant Import Review | Queue table/list + drawer | No | Imported records need compare/filter/approve/reject |
| Events list | Index table/list report | No | Use status columns, staffing progress, date, client, risk |
| Event Detail | Object page tabs + panels | Rare | Use panels/sections; no card soup inside tabs |
| Event Roles | Table or grouped role list | No | Headcount comparison needs rows/columns |
| Budget/Master Sheet | Spreadsheet-like grid | No | Financial alignment beats visual blocks |
| Staffing | Table desktop, roster list mobile | No | Assignment and backup coverage need scan speed |
| Attendance | Roster list mobile, table desktop | No | Use large rows/status controls, not separate worker cards |
| Contracts | Table + drawer/detail page | No | Bulk send/check/download needs table |
| Payments | Finance table/grid | No | Approval, deductions, margin, exports need alignment |
| Reports | Report table/list + export controls | No | Cards hide filters and export readiness |
| Messages | Log table or timeline | No for logs | Timeline for event message sequence; table for audit/export |
| User management | Table + drawer | No | Roles/permissions need comparison and audit |
| Worker token pages | Simple panels/cards | Yes | Small, focused, mobile, one assignment at a time |
| Empty states | Panel/card | Yes | Useful if short and action-oriented |

### Hard Rules for Zell-force

- Cards are **exception**, not default layout primitive.
- Do not put cards inside cards.
- Do not wrap entire dense app pages in one giant card.
- Do not use card grids for Staff, Applicants, Events, Contracts, Payments, Reports, Messages, or Users.
- Do not use cards where user needs sort, filter, saved views, column visibility, bulk actions, pagination, or export.
- Do not use cards for budget, wage, margin, or payment calculation surfaces.
- Do not use cards to make routine content look important; use heading hierarchy, grouping, dividers, and spacing first.
- Do not use shadows for normal grouping; reserve elevation for drawers, dropdowns, popovers, dialogs.
- Card count per dashboard row should stay under 6 on desktop and stack to 1-2 per row on tablet/mobile.
- A card must have one clear purpose, one primary action, readable heading, explicit focus behavior, and short content.
- Critical states must not be hidden inside cards; show them in table status columns, inline alerts, sticky bars, or workspace headers.

### AI Prompt Guardrail for Future Design/Build Work

When asking AI coding/design agents to create Zell-force screens, include this instruction:

> Do not default to card grids. Choose the container from the user task: table for comparison and bulk work, structured list for mobile roster work, spreadsheet grid for numeric finance work, object page/tabs for event workspace, drawer for row detail, dialog only for focused confirmation. Use cards only after passing the Zell-force Card Eligibility Test.

This guardrail directly supports the approved methodology: design-system consistency, code-structure clarity, DRY reusable patterns, and TDD-friendly component behavior.

## J. Layout and Component Rules

| Pattern | Use When | Zell-force screens |
|---|---|---|
| Tables | multi-record compare/filter/action | Staff, applicants, events, contracts, payments, reports, users, messages |
| Structured lists | mobile or roster-oriented records | Supervisor roster, staffing roster, worker token details |
| Spreadsheet-like grid | numeric rate/quantity/financial editing | Event budget, wage rules, payment review |
| Panels | grouped information inside workspace | Event overview, dashboard alert areas |
| Cards | small summaries only | dashboard metrics, empty states, worker token page sections |
| Tabs | one business object with sections | Event Detail workspace |
| Drawers | inspect/edit one row while keeping table visible | staff profile quick view, applicant review, contract detail |
| Modals | confirmation, destructive, small focused task | delete, approve, reject, lock/reopen |
| Full pages | complex creation/editing | event setup, staff profile full edit, budget setup |
| Inline edit | low-risk narrow edits | table notes/status where audit not critical |

Table anatomy:

- title + result count;
- saved views;
- search;
- primary filters + more filters;
- active filter chips;
- column visibility;
- sort indicators;
- row selection;
- bulk action bar that does not hide column context;
- sticky header;
- sticky first column for wide tables;
- row hover/focus;
- side drawer for detail/edit;
- empty/no-results/error/loading states.

Forms:

- visible labels, never placeholder-only;
- field groups with headings;
- progressive disclosure for advanced rules;
- inline validation after blur/submit;
- error summary for long forms;
- save draft for event/budget forms;
- unsaved-change warning;
- read-only and locked states distinct from disabled.

---

## K. RTL and Bilingual Rules

Arabic-first:

- default app shell `dir="rtl"` and `lang="ar"`;
- English mode switches shell to `dir="ltr"` and `lang="en"`;
- do not maintain two separate layouts; use logical CSS (`margin-inline`, `padding-inline`, `inset-inline`).

Mirror in RTL:

- sidebars and navigation order;
- breadcrumbs and chevrons;
- back/next arrows;
- drawers: default open from logical end/right in Arabic;
- progress/process steps;
- table row action alignment.

Do not mirror unnecessarily:

- numbers;
- decimals;
- phone numbers;
- email addresses;
- URLs;
- file names;
- code/IDs;
- media controls;
- charts where mirroring changes data interpretation;
- currency symbols unless locale formatting requires it.

Mixed content:

- use `<bdi>` for names/client/file values of unknown direction;
- use `dir="ltr"` for phone, email, URLs, IDs;
- align text columns to start; numeric columns by decimal/end with LTR isolation;
- Arabic labels with English client names must not reorder punctuation;
- date format must be locale-aware; Hijri display optional beside Gregorian.

Charts/timelines:

- process flows mirror right-to-left in Arabic;
- chronological data charts keep time meaning stable and label clearly;
- vertical timelines preferred where mirroring is ambiguous.

---

## L. Responsive Strategy

Breakpoints:

| Name | Width | Behavior |
|---|---:|---|
| Mobile | 360-767 | stacked layout, no desktop tables except horizontal overflow for rare finance screens |
| Tablet | 768-1023 | collapsed sidebar, two-column forms where safe |
| Desktop | 1024-1439 | full sidebar, table-first |
| Wide | 1440+ | max content width or more table columns; avoid stretched text |

Desktop admin:

- persistent sidebar;
- top bar with search/user/context;
- event workspace tabs;
- dense tables with saved views.

Tablet:

- collapsible sidebar;
- tables keep priority columns + horizontal scroll where necessary;
- drawers can become full-height overlays.

Supervisor mobile:

- no dense tables;
- today's event first;
- roster grouped by role/status;
- one-tap segmented status controls;
- confirmation for high-risk changes after Finance lock or absence/no-show;
- sticky bottom action/status summary;
- offline/poor-network banner and retry queue if supported.

Worker token pages:

- single-purpose pages;
- large actions;
- minimal text;
- expired/already-completed states;
- no admin navigation;
- file upload optimized for mobile.

Attendance control recommendation:

- use **one-tap status buttons/segmented control** with visible current state;
- avoid swipe-only actions;
- use confirmation only for destructive/high-impact states such as absent/no-show, override, or locked edit.

---

## M. Role-Specific Dashboard Blocks

| Role | Block | User question | Action | Component |
|---|---|---|---|---|
| Owner | Active event risk | Which events need attention? | Open event | prioritized list |
| Owner | Margin/payment approvals | What money needs approval? | Review payments/budget | summary + table |
| Admin | Operational alerts | What is broken today? | Fix contracts/import/messages | alert list |
| HR | Import queue | Who needs review? | Review applicant | table/list |
| HR | Interviews | What is scheduled/missed? | Schedule/score | calendar/list |
| Coordinator | Staffing progress | Which roles are underfilled? | Add staff/invite | role progress list |
| Coordinator | Declines/failures | Who declined or message failed? | Replace/resend | exception table |
| Supervisor | Today's events | Where do I work now? | Open roster | mobile list |
| Supervisor | Attendance progress | Who is unmarked/late/absent? | Mark attendance | roster controls |
| Finance | Payment review | Which events await review? | Open batch | payment table |
| Finance | Exceptions | What blocks approval? | Resolve issue | exception list |

No decorative charts unless they answer a decision-making question.

---

## N. Accessibility Foundations

Wireframes must include:

- WCAG 2.2 AA baseline;
- keyboard operation for tables, tabs, drawers, dialogs, filters;
- visible focus states;
- no keyboard traps;
- labels and helper text for all fields;
- error summary + inline error;
- screen-reader labels for icon buttons;
- status text beyond color;
- semantic tables with headers;
- dialog focus trapping;
- touch target 44px minimum, 48px for mobile critical actions;
- reduced motion support;
- 200% zoom without content loss;
- Arabic screen-reader order matching visual/logical flow;
- RTL/LTR language attributes per page/section;
- no hover-only critical actions.

---

## O. Provisional Design Tokens

| Category | Tokens |
|---|---|
| Radius | `2`, `4`, `6`, `8`; default panel/table radius `6`, max card radius `8` |
| Border | `1px solid border`; no heavy box shadows for normal panels |
| Elevation | only overlays/dropdowns/drawers get shadow |
| Icon sizes | 16 table, 20 buttons, 24 mobile primary actions |
| Motion | 120ms hover, 180ms state, 240ms drawer/dialog; reduced-motion support |
| Density | `comfortable`, `compact`, `touch` |
| Z-index | base, sticky, dropdown, drawer, modal, toast |

---

## P. Approval Checklist

Approve or edit these before final wireframe spec:

1. Primary design direction: **Calm Operations Console**.
2. Borrowed sub-directions: Field Ops Mobile, Finance Ledger, Fiori Object Workspace.
3. Primary font pair: **IBM Plex Sans Arabic + IBM Plex Sans**.
4. Fallback font pair: **Noto Sans Arabic + system UI / Inter**.
5. 4/8 spacing system.
6. Comfortable + compact table density modes.
7. Primary palette: blue-teal with charcoal neutral foundation.
8. Arabic-first RTL default.
9. Role-specific dashboards.
10. Event Detail object workspace tabs.
11. Staff Database table-first.
12. Applicant Review Queue separate from Staff Database.
13. Budget/Master Sheet spreadsheet-like controlled grid.
14. Payment Review separate from Attendance.
15. Supervisor mobile-first roster with one-tap segmented status controls.
16. Worker token pages limited to assignment details, confirm/decline, contract view/upload.
17. Cards limited to summaries/empty states/token pages, not main data surfaces.
18. Zell-force Card Eligibility Test.
19. No card grids for Staff, Applicants, Events, Contracts, Payments, Reports, Messages, or Users.
20. Tables, structured lists, spreadsheet grids, panels, object pages, drawers, and dialogs are the primary alternatives to cards.
21. WCAG 2.2 AA wireframe-level requirement.
22. Approval/lock/error states always visible.
23. Do not use color as only status indicator.

---

## Q. Sources

- Nielsen Norman Group: [Data Tables: Four Major User Tasks](https://www.nngroup.com/articles/data-tables/)
- Nielsen Norman Group: [Cards: UI-Component Definition](https://www.nngroup.com/articles/cards-component/)
- Nielsen Norman Group: [Dashboards: Making Charts and Graphs Easier to Understand](https://www.nngroup.com/articles/dashboards-preattentive/)
- Nielsen Norman Group: [Mobile Tables](https://www.nngroup.com/articles/mobile-tables/)
- IBM Carbon: [Data Table](https://carbondesignsystem.com/components/data-table/usage/)
- IBM Carbon: [Tile Usage](https://carbondesignsystem.com/components/tile/usage/)
- IBM Carbon: [Spacing](https://carbondesignsystem.com/elements/spacing/overview/)
- IBM Carbon: [Typography Type Sets](https://carbondesignsystem.com/elements/typography/type-sets/)
- Atlassian Design System: [Spacing](https://atlassian.design/foundations/spacing)
- Atlassian Design System: [Typography](https://atlassian.design/foundations/typography-beta)
- Material Design 3: [Cards](https://m3.material.io/components/cards/guidelines)
- Material Design 3: [Lists](https://m3.material.io/components/lists/guidelines)
- Material Design 3: [Color Roles](https://m3.material.io/styles/color/roles)
- Material Design 3: [RTL / Bidirectionality](https://m3.material.io/foundations/layout/bidirectionality-rtl)
- Material Design 3: [Touch Targets](https://m3.material.io/foundations/designing/structure)
- Material Design 3: [Readex Pro Arabic Type Design](https://m3.material.io/blog/readex-pro-legibility-arabic-type-design)
- W3C: [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- W3C: [Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- W3C Internationalization: [Structural markup and right-to-left text in HTML](https://www.w3.org/International/questions/qa-html-dir.en.html)
- GOV.UK Design System: [Recover from validation errors](https://design-system.service.gov.uk/patterns/validation/)
- GOV.UK Design System: [Summary List](https://design-system.service.gov.uk/components/summary-list/)
- Department for Education Design System: [Card](https://design.education.gov.uk/design-system/components/card)
- NHS Digital Service Manual: [Card](https://service-manual.nhs.uk/design-system/components/card)
- MOJ Design System: [Interruption Card](https://design-patterns.service.justice.gov.uk/components/interruption-card/)
- Nielsen Norman Group: [Confirmation Dialogs Can Prevent User Errors](https://www.nngroup.com/articles/confirmation-dialog/)
- Material Design 3: [Dialogs](https://m3.material.io/components/dialogs)
- Shopify Polaris: [Index Table](https://polaris-react.shopify.com/components/tables/index-table)
- Shopify Polaris: [Index Filters](https://polaris-react.shopify.com/components/selection-and-input/index-filters)
- SAP Fiori: [Object Page Floorplan](https://www.sap.com/design-system/fiori-design-web/v1-145/page-types/floorplans/object-page/usage)
- Google Fonts: [IBM Plex Sans Arabic](https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic)
- Google Fonts: [Readex Pro](https://fonts.google.com/specimen/Readex+Pro)
- Google Fonts: [Noto Sans Arabic](https://fonts.google.com/noto/specimen/Noto+Sans+Arabic)
- Workforce references: [Liveforce](https://liveforce.co/staff-scheduling-features/), [Nowsta](https://www.nowsta.com/), [Deputy](https://www.deputy.com/)
