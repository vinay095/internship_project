# System Architecture & Diagrams (Detailed Reference)

This document contains detailed visual diagrams mapping out the data schema, programmatic execution flows, and user interaction pathways of the Meeting Room Booking System.

---

## 1. Detailed Entity-Relationship (ER) Diagram
This diagram shows the complete representation of the database tables (simulated in `mockData.js`), including secondary columns, data types, and primary/foreign key mappings.

```mermaid
erDiagram
    USER {
        string id PK "Unique identifier (e.g. usr_1)"
        string name "User's full display name"
        string email "Unique organization login email"
        string password "Clear-text fallback password"
        string role "employee | manager | hr"
        string location "Noida | Hyderabad | Kolkata"
        string reportingManagerId FK "Self-referencing manager ID"
    }
    ROOM {
        string id PK "Unique identifier (e.g. rm_1)"
        string name "Physical meeting room name"
        string location "Noida | Hyderabad | Kolkata"
        int capacity "Seat count limit"
        array amenities "List: TV, Whiteboard, Video Conference, etc."
        boolean isActive "False hides room from searches"
    }
    BOOKING {
        string id PK "Unique identifier (e.g. bkg_1)"
        string roomId FK "Reference to physical ROOM"
        string bookedBy FK "Reference to creator USER"
        string bookedByName "Cached display name of owner"
        string bookedByRole "Cached role of owner"
        string date "YYYY-MM-DD format key"
        string startTime "HH:MM (24h clock, e.g. 14:15)"
        string endTime "HH:MM (24h clock, e.g. 15:00)"
        string title "Meeting title/subject"
        array attendees "List of invitee email strings"
        string sourceRequestId FK "Optional request source identifier"
    }
    REQUEST {
        string id PK "Unique identifier (e.g. req_1)"
        string roomId FK "Reference to requested ROOM"
        string userId FK "Reference to requester USER"
        string requesterName "Cached requester display name"
        string managerId FK "Reference to supervisor USER"
        string date "YYYY-MM-DD format key"
        string startTime "HH:MM (24h clock)"
        string endTime "HH:MM (24h clock)"
        string title "Requested meeting subject"
        string note "Optional text explanation for manager"
        string status "pending | approved | rejected"
        string rejectionReason "Optional feedback text if rejected"
    }

    USER ||--o{ BOOKING : "owns / cancels"
    ROOM ||--o{ BOOKING : "hosts"
    USER ||--o{ REQUEST : "submits"
    USER ||--o{ REQUEST : "reviews / decides"
    ROOM ||--o{ REQUEST : "holds-resource"
    USER ||--o{ USER : "reports-to"
```

---

## 2. Low-Level Sequence Diagrams

### A. Employee Booking Request & Manager Approval Flow
This diagram details the step-by-step logic, function calls, and state transitions that occur when an Employee requests a room and a Manager approves it.

```mermaid
sequenceDiagram
    autonumber
    actor Employee as Employee Page
    actor Manager as Manager Page
    participant Auth as AuthContext.jsx
    participant ReqSrv as requestService.js
    participant BookSrv as bookingService.js
    participant DB as mockData.js (Local Memory)

    %% Section 1: Creating Request
    Employee->>Auth: Reads active user details (user.id, reportingManagerId)
    Employee->>Employee: Selects Date, Start Time, End Time, Title, and Note
    Employee->>ReqSrv: Calls createRequest({ roomId, userId, managerId, date, startTime, endTime, title, note })
    ReqSrv->>ReqSrv: Generates unique ID, sets status = "pending"
    ReqSrv->>DB: Appends request object to requests array
    ReqSrv-->>Employee: Returns created request object
    Note over Employee: Modal closes, page calls forceUpdate() to refresh lists

    %% Section 2: Manager Approval
    Note over Manager: Manager logs in, navigates to "/manage-requests"
    Manager->>ReqSrv: Calls getPendingRequests(managerId)
    ReqSrv->>DB: Filters requests where managerId === activeUser.id & status === "pending"
    ReqSrv-->>Manager: Returns list of pending requests
    Manager->>ReqSrv: Clicks "Approve" -> Calls approveRequest(requestId, managerId)
    
    %% Overlap check inside approval
    ReqSrv->>BookSrv: Calls timesOverlap() check on room, date, and requested slots
    BookSrv->>DB: Filters bookings by roomId & date
    alt Time Slot is Overlapped/Taken
        BookSrv-->>ReqSrv: Overlap collision detected
        ReqSrv-->>Manager: Throws "Room already booked for this slot" error
    else Time Slot is Free
        BookSrv-->>ReqSrv: Slot is clear
        ReqSrv->>BookSrv: Calls createBooking() using request properties
        BookSrv->>DB: Appends booking object to bookings array
        BookSrv-->>ReqSrv: Returns created booking
        ReqSrv->>DB: Updates request status = "approved"
        ReqSrv-->>Manager: Returns updated request & booking objects
    end
    Note over Manager: Force re-render updates request list & logs booking
```
---
### B. Calendar Export (.ics) Sequence
This diagram details how the application generates and initiates a local calendar file download completely inside the browser client without server dependencies.

```mermaid
sequenceDiagram
    autonumber
    actor User as Bookings.jsx
    participant BookSrv as bookingService.js
    participant Web as Browser Native APIs

    User->>BookSrv: Clicks "Add to Calendar" -> Calls downloadICS(booking)
    Note over BookSrv: Generates raw text payload conforming to RFC 5545 specifications
    BookSrv->>BookSrv: Assembles VCALENDAR tags, VEVENT, DTSTART, DTEND, SUMMARY, DESCRIPTION
    BookSrv->>Web: Instantiates Blob: new Blob(icsContent)
    Web-->>BookSrv: Returns Blob instance
    BookSrv->>Web: Creates object URL: URL.createObjectURL(blob)
    Web-->>BookSrv: Returns URL string (e.g. blob:http://localhost:5173/...)
    BookSrv->>Web: Programmatically creates dummy anchor: document.createElement("a")
    BookSrv->>Web: Sets link.href = objectUrl & link.download = "meeting-invite.ics"
    BookSrv->>Web: Inserts anchor and triggers link.click()
    Web-->>User: File Explorer download popup appears saving the .ics file
    BookSrv->>Web: Cleans up memory: URL.revokeObjectURL(objectUrl)
```

---

## 3. High-Level User Flow Diagram
The flowchart below maps out the application pathways, including the role gates and dynamic locations lockouts.

```mermaid
graph TD
    Start([User launches App]) --> LoginCheck{Is user logged in?}
    
    %% Login / Registration Pathways
    LoginCheck -- No --> AuthPages[Auth Page: /login or /signup]
    AuthPages --> InputAuth[Input credentials OR SSO login]
    InputAuth --> CheckAuth{Credentials valid?}
    CheckAuth -- No --> AuthPages
    CheckAuth -- Yes --> SetupSession[Initialize AuthContext: write user details & token to localStorage]
    SetupSession --> DashPage
    
    %% Dashboard Router
    LoginCheck -- Yes --> DashPage[Dashboard Page: /dashboard]
    
    DashPage --> NavMenu{Navbar Navigation}
    
    %% Common Pages & Actions
    NavMenu --> |Rooms Tab| RoomsPage[Rooms Page: /rooms]
    NavMenu --> |Bookings Tab| BookingsPage[Bookings Table: /bookings]
    
    %% Role Gated Navigation
    NavMenu --> |Role Gate check| RoleGate{User Role?}
    
    RoleGate --> |Employee| EmpRequest[My Requests Page: /my-requests]
    RoleGate --> |Manager or HR| MgrRequests[Manage Requests Page: /manage-requests]
    RoleGate --> |HR Only| ManageRooms[Manage Rooms Page: /manage-rooms]
    RoleGate --> |Manager or HR| ReportsPage[Reports Page: /reports]
    
    %% Rooms Action Branching (Location restrictions)
    RoomsPage --> LocGate{User Role?}
    
    LocGate --> |Employee or Manager| LockedLoc[Location select disabled: badge displays user.location]
    LocGate --> |HR Only| FreeLoc[Location dropdown active: switch Noida / Hyderabad / Kolkata]
    
    LockedLoc --> RenderCards[Render RoomCard list based on active location]
    FreeLoc --> RenderCards
    
    RenderCards --> RoomTimeline[Render RoomTimeline: compute 24h width % per booking]
    
    RoomTimeline --> ActionsGate{User Role?}
    ActionsGate --> |Employee| OpenRequestModal[Open RequestModal: selects manager, Date, Start/End 15m intervals]
    OpenRequestModal --> SubmitReq[Submit pending request to manager] --> EmpRequest
    
    ActionsGate --> |Manager or HR| OpenBookingModal[Open BookingModal: selects Date, Start/End 15m intervals]
    OpenBookingModal --> SubmitBook[Directly book room] --> BookingsPage
    
    %% Bookings Actions
    BookingsPage --> BookActions{Is current user the booking owner?}
    BookActions -- Yes --> OwnerActions[Display 'Cancel' & 'Invite' options]
    OwnerActions --> CancelClick[Cancel: Confirm popup --> bookingService.cancelBooking]
    OwnerActions --> InviteClick[Invite: Open InviteModal -> validate & send email invites]
    BookActions -- No --> ViewOnly[Hide Actions column controls]
    
    BookingsPage --> AllUsers[Display 'Add to Calendar' button for all users]
    AllUsers --> DownloadICSClick[Triggers .ics download]
    
    %% Reports Page
    ReportsPage --> ViewStats[Calculate average occupancy & peak times via bookingService]
    ViewStats --> RenderCharts[Render Pure-CSS Bar Charts & Peak Hour Histograms]
    
    %% Out of bounds
    NavMenu --> |Invalid Route| NotFound[404 Page: Trigger typewriter animation loop]
    NotFound --> Replay[Replay button: Reset variables to restart text animation]
    NotFound --> GoHome[Click back link -> Navigate to /dashboard]
```
