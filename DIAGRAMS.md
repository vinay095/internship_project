# System Architecture & Diagrams (Detailed Reference)

This document contains detailed visual diagrams mapping out the data schema, programmatic execution flows, and user interaction pathways of the Meeting Room Booking System.

---

## 1. High-Level User Flow Diagram
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
