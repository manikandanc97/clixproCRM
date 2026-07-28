# Tasks Module: Comprehensive Analysis

This document contains the complete analysis of the CLIXPRO CRM Tasks module, divided into 7 distinct sections as requested. No code implementations are included.

---

## 1. Implementation Document

### Overview
The Tasks module is a productivity suite that allows users to manage their daily workflows. It is highly visual, offering List, Kanban, Calendar, and Timeline views to accommodate different project management styles.

### Architecture
- **Frontend Container**: `app/(dashboard)/tasks/page.tsx`
- **Data Fetching**: Custom hook `useTasks()` (React Query) hydrates the Zustand store `useCRMStore`.
- **UI Components**: 
  - Dynamic views: `TasksTable`, `KanbanView`, `CalendarView`, `TimelineView`.
  - Interaction overlays: `TaskForm` (Modal) for creation, `TaskDetailsDrawer` (Slide-out) for detailed inspection.
- **Backend Service**: `CrmService.getTasks` handles data retrieval and computes metadata (like `isOverdue` status).

### 🛑 Identified Missing Features
- **Unlinked Entities (Orphan Tasks)**: In a CRM context, tasks are usually tied to an entity (e.g., "Call Lead X" or "Email Customer Y"). The current Task model operates in a silo; it cannot be linked to a Lead, Customer, or Deal.
- **Lack of Assignment**: Tasks are globally scoped to the Tenant. There is no `assignedToId`, making it impossible to delegate tasks to specific team members.
- **Client-Side Filtering Flaw**: Similar to Leads and Customers, the Search and Status filters are applied to paginated client-state (`safeTasks.filter`), which means users only search the tasks currently visible on the page, not the entire database.
- **Mocked Actions**: The "Export" button triggers a toast but does not generate a CSV/PDF.

---

## 2. Database Design

### Current State (Prisma Schema)
The `Task` model contains `id`, `tenantId`, `title`, `description`, `dueDate`, `priority` (HIGH, MEDIUM, LOW), and `status` (PENDING, IN_PROGRESS, COMPLETED).

### Production-Ready DB Recommendations
1. **Extend `Task` Model**:
   - `assignedToId` (FK to User) for delegation.
   - **Polymorphic Relations**: Add `relatedEntityType` (Enum: LEAD, CUSTOMER, DEAL) and `relatedEntityId` (UUID) so tasks can be contextually attached to CRM records.
2. **Create `Subtask` Model** (Optional but recommended for Enterprise):
   - To allow breaking complex deliverables down (Checklist items).
3. **Indexes**:
   - Add `INDEX idx_task_tenant_assignee_due ON "Task" (tenantId, assignedToId, dueDate)` to quickly fetch a user's upcoming daily tasks.

---

## 3. API Design

### Current Endpoints
- `GET /api/crm/tasks?page=1&limit=10`
- `POST /api/crm/tasks`
- `PATCH /api/crm/tasks/:id`
- `DELETE /api/crm/tasks/:id`

### Production-Ready REST API Enhancements
- **Server-Side Filtering**: Refactor `GET` to accept `?search=X&status=PENDING&assigneeId=Y`.
- **Entity Context Fetching**: `GET /api/crm/tasks?entityType=LEAD&entityId=123` (to display a task list directly inside a Lead's profile).
- **Calendar Range Fetching**: `GET /api/crm/tasks/calendar?start=2026-07-01&end=2026-07-31` (optimized query to support the `CalendarView` without fetching massive unpaginated datasets).

---

## 4. UX Design

### Layout & Interactions
- **Multi-View System**: The toolbar allows seamless switching between `list`, `kanban`, `calendar`, and `timeline`. `AnimatePresence` is used to fade views in and out smoothly.
- **KPI Metrics**: Dynamic cards calculate Total Tasks, Completed, In Progress, and Overdue tasks. Overdue tasks visually trigger a red/pink alert color.
- **Slide-out Drawer**: Instead of navigating away or opening a heavy modal, clicking a task in the list opens the `TaskDetailsDrawer`, providing a sleek, contextual reading experience.

### States
- **Loading**: Utilizes `PageLoadingState` ("Loading tasks...").
- **Empty**: A beautifully crafted empty state with a `SearchX` icon prompts users to clear filters if nothing is found.
- **Error**: `PageErrorState` handles API failures gracefully.

---

## 5. Security Audit

### 5.1 Broken Access Control (Cross-User Editing)
- **Vulnerability**: Because tasks lack an `assignedToId`, any user with a `SALES` role can edit, mark as complete, or delete *any* task created by any other user within the company. This could lead to accidental or malicious deletion of crucial reminders.
- **Remediation**: Implement `assignedToId`. Restrict task modification to the creator, the assignee, or users with `MANAGER/ADMIN` roles.

### 5.2 Missing Pagination Limits
- **Vulnerability**: The `GET /api/crm/tasks` endpoint accepts a `limit` parameter. If a malicious user passes `?limit=1000000`, it could cause a Denial of Service by exhausting database memory or Node.js heap space.
- **Remediation**: Clamp the `limit` parameter on the backend (e.g., `Math.min(limit, 100)`).

---

## 6. Development Checklist (Atomic Tasks)

### Database & Backend
- [ ] Add `assignedToId`, `relatedEntityType`, and `relatedEntityId` to the Prisma schema.
- [ ] Run Prisma migrations.
- [ ] Implement query bounds clamping (max limit 100) in the `GET` endpoint.
- [ ] Refactor `GET /api/crm/tasks` to perform search and status filtering via database `WHERE` clauses instead of client-side arrays.
- [ ] Implement authorization checks on `PATCH`/`DELETE` based on task ownership.

### Frontend
- [ ] Remove `useMemo` client-side filtering; map UI toolbar state to URL Search Params.
- [ ] Update `TaskForm` to include a User assignment dropdown and a "Related To" entity search dropdown.
- [ ] Modify `TasksTable` and `KanbanView` to display the Assignee's Avatar on the task cards.
- [ ] Connect the "Export" button to a backend CSV generator.

---

## 7. QA Test Cases

### Functional Cases
- **TC-TK-01**: Switch between List, Kanban, Calendar, and Timeline views. Verify that the layout renders correctly and the data remains consistent across views.
- **TC-TK-02**: Select a task from the List view. Verify the `TaskDetailsDrawer` slides in from the side and displays accurate information.
- **TC-TK-03**: Enter a task with a `dueDate` in the past. Verify the "Overdue" KPI card increments and the task is visually flagged in the UI.

### Security Cases
- **TC-TK-SEC-01**: Execute `GET /api/crm/tasks?limit=50000`. Verify the API returns a maximum of 100 rows or throws a `400 Bad Request` validation error.
- **TC-TK-SEC-02**: As a `SALES` agent, attempt to `DELETE` a task explicitly assigned to the `MANAGER` (Post-implementation of assignment feature). Verify `403 Forbidden`.

### Edge & Regression Cases
- **TC-TK-EDGE-01**: In the Calendar view, navigate to a month spanning two different years (e.g., Dec 2026 to Jan 2027). Verify the dates and tasks render in the correct boxes.
- **TC-TK-REG-01**: Open the `TaskForm` modal, fill in half the fields, and close it via the 'Esc' key. Reopen the modal and verify the fields are cleared and reset to default.
