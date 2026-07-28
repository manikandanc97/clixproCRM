# Calendar (Meetings) Module: Comprehensive Analysis

This document contains the complete analysis of the CLIXPRO CRM Calendar module, divided into 7 distinct sections as requested. No code implementations are included.

---

## 1. Implementation Document

### Overview
The Calendar module is currently an **unimplemented placeholder**. While there is an API route set up to fetch "meetings", the frontend routing simply renders a `RoleModulePlaceholder` component. The backend fakes meeting data by querying standard `Task` records.

### Architecture
- **Frontend Container**: `app/(dashboard)/calendar/page.tsx` (Renders only a placeholder).
- **Backend API**: `app/api/crm/meetings/route.ts` (GET only).
- **Backend Service**: `CrmService.getMeetings` queries the `Task` table for tasks with a `dueDate` and maps them into mocked "Meeting" objects.

### 🛑 Identified Missing Features
- **Zero Frontend Implementation**: There is no actual calendar UI (e.g., month/week/day views).
- **No Native Meeting Entity**: The system lacks a dedicated database table for Meetings or Events. It merely repurposes Tasks.
- **Hardcoded Data**: The backend hardcodes `time: "TBD"`, `location: "Virtual"`, and empty `attendees` arrays for all pseudo-meetings.
- **No External Integrations**: A CRM calendar is severely handicapped without two-way sync to Google Calendar, Microsoft Outlook, or CalDAV.

---

## 2. Database Design

### Current State
There is no `Meeting` or `Event` model in Prisma.

### Production-Ready DB Recommendations
To build a functional Calendar module, the following schema additions are required:
1. **Create `Meeting` Model**:
   - `id` (UUID), `tenantId` (FK)
   - `organizerId` (FK to User)
   - `title` (VARCHAR)
   - `description` (TEXT)
   - `startTime` (DateTime), `endTime` (DateTime)
   - `location` (VARCHAR - physical address or Zoom link)
   - `status` (SCHEDULED, CANCELED, COMPLETED)
2. **Create `MeetingAttendee` Pivot Table**:
   - Links a `Meeting` to either a `User` (internal staff), `Lead`, or `Customer` (external participants).
   - Tracks RSVP status (ACCEPTED, DECLINED, PENDING).
3. **Indexes**:
   - `INDEX idx_meeting_tenant_time ON "Meeting" (tenantId, startTime, endTime)` for fast rendering of monthly calendar grids.

---

## 3. API Design

### Current Endpoints
- `GET /api/crm/meetings` (Returns an array of mocked meetings).

### Production-Ready REST API Enhancements
To support a full calendar interface (like FullCalendar.io):
- **Range Queries**: `GET /api/crm/meetings?start=2026-07-01&end=2026-07-31` (Crucial for loading only the visible month).
- **CRUD Operations**:
  - `POST /api/crm/meetings` (Create event and dispatch email invites).
  - `PATCH /api/crm/meetings/:id` (Update event, support drag-and-drop time shifting).
  - `DELETE /api/crm/meetings/:id` (Cancel event).
- **Availability Endpoint**: `GET /api/crm/meetings/availability?userId=X&date=Y` (To prevent double-booking).

---

## 4. UX Design

### Layout & Interactions (Proposed)
Since the module is a placeholder, the UX must be built from scratch:
- **Primary View**: A large, interactive Calendar grid (Month, Week, Day views).
- **Drag & Drop**: Users should be able to drag an event from Tuesday to Thursday to instantly reschedule it.
- **Creation Overlay**: Clicking an empty slot on the calendar should trigger a popover to quickly create a meeting, select attendees, and attach it to a specific Lead/Deal.
- **Mini-Calendar Sidebar**: A small month navigator on the left sidebar to quickly jump between months, alongside toggles to show/hide colleagues' calendars.

---

## 5. Security Audit

### 5.1 Lack of Attendee Privacy / Multi-Tenant Leakage Risk
- **Vulnerability**: Currently, `getMeetings` fetches Tasks globally for the Tenant. If a real `Meeting` model is implemented without strict ownership/invite checks, any employee could read the details (and meeting links) of confidential executive meetings.
- **Remediation**: Implement a `visibility` flag (PUBLIC, PRIVATE). If PRIVATE, the meeting details should only be returned by the API if the authenticated `userId` is in the `MeetingAttendee` list.

---

## 6. Development Checklist (Atomic Tasks)

### Database & Backend
- [ ] Create `Meeting` and `MeetingAttendee` Prisma models.
- [ ] Run Prisma migrations.
- [ ] Refactor `CrmService.getMeetings` to query the new `Meeting` model instead of `Task`.
- [ ] Implement date-range filtering (`start` and `end` query params) in the GET endpoint.
- [ ] Create POST, PATCH, and DELETE REST endpoints for meetings.

### Frontend
- [ ] Remove the `RoleModulePlaceholder` from `app/(dashboard)/calendar/page.tsx`.
- [ ] Install a robust calendar library (e.g., `react-big-calendar` or `@fullcalendar/react`).
- [ ] Build the main `CalendarView` component with Month/Week toggles.
- [ ] Build the `MeetingModal` form for creating and editing events.
- [ ] Wire up Drag-and-Drop functionality to the `PATCH` endpoint.

---

## 7. QA Test Cases

### Functional Cases (Post-Implementation)
- **TC-CAL-01**: Click on an empty time slot on the weekly calendar view. Verify the Meeting creation modal opens with the start and end times pre-filled based on the clicked slot.
- **TC-CAL-02**: Drag an existing 1-hour meeting to a new day. Verify the API successfully updates the database and the UI reflects the change without page reload.
- **TC-CAL-03**: Switch between Month, Week, and Day views. Verify the events map accurately to the visual grid layout.

### Security Cases
- **TC-CAL-SEC-01**: Create a meeting marked as 'Private' without inviting User B. Log in as User B. Verify the meeting shows as "Busy" on the calendar but hides the title, description, and location.

### Edge & Regression Cases
- **TC-CAL-EDGE-01**: Schedule a meeting that spans across midnight (e.g., 11 PM to 1 AM). Verify the calendar library renders the event bar accurately across both days.
- **TC-CAL-REG-01**: Attempt to create a meeting without a title. Verify frontend validation blocks submission and highlights the missing field.
