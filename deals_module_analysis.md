# Deals (Pipeline) Module: Comprehensive Analysis

This document contains the complete analysis of the CLIXPRO CRM Deals (Pipeline) module, divided into 7 distinct sections as requested. No code implementations are included.

---

## 1. Implementation Document

### Overview
The Deals module (referred to internally as the Pipeline) visualizes sales opportunities in a Kanban-style board. It calculates expected values, probabilities, and highlights "stuck" deals to forecast revenue.

### Architecture
- **Frontend Container**: `app/(dashboard)/pipeline/page.tsx`
- **Data Fetching**: Custom hook `usePipeline()` fetches pipeline data and stores it in the Zustand `useCRMStore`.
- **UI Components**: 
  - `PipelineBoard` (Kanban drag-and-drop interface).
  - `LeadForm` (Used identically for both Leads and Deals).
- **Backend Service**: `CrmService.getPipeline` maps raw database `Lead` rows into enriched `PipelineItem` objects (calculating probability, temperature, and AI summaries on the fly).

### 🛑 Identified Missing Features
- **Lack of Separation (Lead vs. Deal)**: In standard CRM architecture, a Lead is an entity (Person), while a Deal/Opportunity is a transaction. Currently, ClixPro CRM treats them as the same database object. This prevents a single Customer from having multiple active Deals simultaneously.
- **Hardcoded Attributes**: `expectedCloseDate` is hardcoded in the backend as `createdAt + 30 days`. `probability` is hardcoded based on the current stage rather than being editable by the sales rep.
- **Static Pipeline Stages**: Pipeline columns map exactly to the Prisma `LeadStatus` Enum (`NEW`, `CONTACTED`, `PROPOSAL_SENT`). Users cannot customize sales stages.
- **Mocked Actions**: The "Export Pipeline Manifest" button triggers a toast notification but generates no actual report.
- **Deal Ownership**: Similar to Leads, Deals lack an `assignedToUserId`, preventing individual pipeline accountability.

---

## 2. Database Design

### Current State (Prisma Schema)
There is **no distinct Deal model**. The module queries the `Lead` model and categorizes rows by `LeadStatus`.

### Production-Ready DB Recommendations
To decouple Leads from Deals and support complex enterprise sales cycles:
1. **Create `Deal` Model**:
   - `id` (UUID), `tenantId` (FK)
   - `customerId` or `leadId` (FK)
   - `assignedToId` (FK to User)
   - `title` (e.g., "Acme Corp Q3 Renewal")
   - `amount` (Decimal)
   - `stageId` (FK to a new `PipelineStage` table to allow custom columns)
   - `probability` (Integer 0-100)
   - `expectedCloseDate` (DateTime)
   - `status` (OPEN, WON, LOST)
2. **Create `PipelineStage` Model**:
   - Allows users to configure their own Kanban columns (`name`, `order`, `defaultProbability`).

---

## 3. API Design

### Current Endpoints Used
- `GET /api/crm/pipeline` (Fetches the aggregated pipeline view).
- Mutations rely on `PATCH /api/crm/leads/:id` to move a deal across the Kanban board.

### Production-Ready REST API Enhancements
- **Separate Endpoints**:
  - `GET /api/crm/deals`
  - `POST /api/crm/deals` (Creates a deal distinctly from a lead).
  - `PATCH /api/crm/deals/:id/stage` (Optimized specifically for Drag-and-Drop column transitions).
- **Custom Stages Endpoint**:
  - `GET /api/crm/pipeline/stages` (Allows the frontend to render dynamic columns).

---

## 4. UX Design

### Layout & Interactions
- **Kanban Board**: The primary interface is a horizontal scrolling Kanban board (`PipelineBoard`). Dragging a card between columns triggers an optimistic UI update and a backend PATCH request.
- **Enriched Cards**: Pipeline cards are highly visual, showing Temperature (Warm, Hot, Cold), Priority tags, Deal Value, and an AI-generated Summary tooltip.
- **Metrics Grid**: Top-level cards summarize Pipeline Value, Average Probability, and the count of Stuck Deals.

### States
- **Loading**: `PageLoadingState` renders while calculating "live pipeline stages and deal totals".
- **Empty**: If the pipeline is empty, a standard empty state prompts the user to "Add Deal".
- **Error**: `PageErrorState` allows users to refetch if the pipeline aggregation fails.

---

## 5. Security Audit

### 5.1 IDOR on Kanban Drag & Drop
- **Vulnerability**: Moving a deal uses the underlying Lead PATCH route. Since there is no assignment validation, any user with `SALES` access can drag (and thus modify) any deal in the entire tenant's pipeline, potentially sabotaging another agent's deals.
- **Remediation**: Implement ownership validation on the `PATCH` route, rejecting state changes if the authenticated user does not own the deal (unless they are a Manager/Admin).

### 5.2 Financial Data Manipulation
- **Vulnerability**: Deal values are passed directly to the DB. A malicious user could edit a deal's payload to have a negative value or an overflow value (`999,999,999,999`), which would corrupt the global Dashboard Revenue aggregations.
- **Remediation**: Apply strict bounds checking using Zod on the backend (`z.number().min(0).max(1000000000)`).

---

## 6. Development Checklist (Atomic Tasks)

### Database & Backend
- [ ] Create standalone `Deal` and `PipelineStage` Prisma models.
- [ ] Write migration to migrate existing Leads currently in the "pipeline" over to the new `Deal` table.
- [ ] Create `GET /api/crm/deals` to replace the current `getPipeline` mock service.
- [ ] Create `PATCH /api/crm/deals/:id/stage` for drag-and-drop actions.
- [ ] Add bounds validation for `amount` and `probability` fields.

### Frontend
- [ ] Refactor `PipelineBoard` to map over dynamic `PipelineStage` columns instead of hardcoded Enums.
- [ ] Create a dedicated `DealForm` component (stop reusing `LeadForm`), including custom `probability` and `expectedCloseDate` inputs.
- [ ] Implement robust Drag-and-Drop error handling (reverting the card's position if the backend `PATCH` fails).
- [ ] Wire the "Export Pipeline Manifest" button to a backend CSV generator.

---

## 7. QA Test Cases

### Functional Cases
- **TC-DL-01**: Drag a Deal from "Contacted" to "Won". Verify the Deal probability automatically updates to 100% and the Pipeline Value metric instantly recalculates.
- **TC-DL-02**: Click "Add Deal" and submit the form. Verify the new card appears in the first column of the Kanban board without a hard refresh.
- **TC-DL-03**: Verify that Deals with `updatedAt` > 10 days correctly display the red "Stuck Deal" indicator.

### Security Cases
- **TC-DL-SEC-01**: Intercept a Drag-and-Drop request. Modify the payload to attempt moving a Deal that belongs to a different Tenant. Verify a `404` or `403` rejection.
- **TC-DL-SEC-02**: Attempt to submit a Deal with a negative monetary amount. Verify the API rejects it with a `400 Bad Request`.

### Edge & Regression Cases
- **TC-DL-EDGE-01**: Add 500 deals to a single Kanban column. Verify the frontend virtualizes the list or handles scrolling without severe frame drops.
- **TC-DL-REG-01**: Move a Deal to "Lost". Verify the Deal disappears from active forecasting but remains queryable in the backend for reports.
