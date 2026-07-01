# User Flow Mapping & Technical Reference

This document maps out the specific features, UI components, source files, and functions responsible for each user role's workflow (Employee, Manager, and Admin/HR).

---

## 1. Employee Workflow

Employees can browse room availability, view booked timelines, request bookings from their reporting manager, manage their requested list, and view or export final bookings.

### Flow A: Room Exploration & Booking Requests
1. **Browse Room Cards**
   * **Location:** Rooms Page (`/rooms`)
   * **Visual UI:** List of room cards containing name, location badge, seating capacity, list of amenities, and the `RoomTimeline` canvas representation.
   * **Responsible Frontend File:** [Rooms.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/pages/Rooms.jsx)
   * **Responsible Logic/Service Function:**
     * `roomService.getRooms(user.location)` in [roomService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/roomService.js) (automatically locks Employees to their primary profile location).
2. **View Timeline Grid**
   * **Location:** Nested inside each Room Card
   * **Visual UI:** A 24-hour horizontal timeline bar displaying booked blocks as color-coded spans representing occupied times.
   * **Responsible Frontend File:** [RoomTimeline.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/components/RoomTimeline.jsx)
   * **Responsible Logic/Service Function:**
     * `bookingService.getBookedRanges(roomId, date)` in [bookingService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/bookingService.js)
3. **Submit a Request**
   * **Location:** Request Modal (triggered by clicking "Request Booking" on a room card)
   * **Visual UI:** Date picker, start/end time drop-downs, dynamic duration badge, error messages for timing conflicts, meeting title input, optional note text area, and a reporting manager selector dropdown.
   * **Responsible Frontend File:** [RequestModal.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/components/RequestModal.jsx)
   * **Responsible Logic/Service Function:**
     * `authService.getManagers()` in [authService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/authService.js) (populates manager options).
     * `bookingService.getBookedRanges(room.id, date)` in [bookingService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/bookingService.js) (live validation of overlapping conflicts).
     * `requestService.createRequest({ requestedBy, managerId, roomId, date, startTime, endTime, title, note })` in [requestService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/requestService.js) (submits request to database memory).

### Flow B: Request List Management
1. **View Status of Requests**
   * **Location:** My Requests Page (`/my-requests`)
   * **Visual UI:** A table of submitted requests displaying Date, Time Slot, Room Name, Target Approver/Manager, Note, Status Badge (`pending` in orange, `approved` in green, `rejected` in red).
   * **Responsible Frontend File:** [MyRequests.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/pages/MyRequests.jsx)
   * **Responsible Logic/Service Function:**
     * `requestService.getMyRequests(user.id)` in [requestService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/requestService.js)
2. **Cancel Pending Request**
   * **Location:** Actions column on My Requests Page
   * **Visual UI:** Red "Cancel" button (only visible for requests still in `pending` status).
   * **Responsible Frontend File:** [MyRequests.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/pages/MyRequests.jsx)
   * **Responsible Logic/Service Function:**
     * `requestService.getMyRequests` array removal / mutation inside [requestService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/requestService.js).

---

## 2. Manager Workflow

Managers can directly book rooms without approval, review pending requests from reporting employees to approve/reject them, and run reports.

### Flow A: Direct Room Booking
1. **Direct Booking Creation**
   * **Location:** Rooms Page (`/rooms`) -> Booking Modal (triggered by clicking "Book Room")
   * **Visual UI:** Input form for Date, Start/End times, Meeting Title, and comma-separated attendee emails.
   * **Responsible Frontend File:** [BookingModal.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/components/BookingModal.jsx)
   * **Responsible Logic/Service Function:**
     * `bookingService.createBooking({ roomId, bookedBy, date, startTime, endTime, title, attendees })` in [bookingService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/bookingService.js) (writes booking straight to approved schedule).

### Flow B: Request Review Management
1. **View Incoming Employee Requests**
   * **Location:** Manage Requests Page (`/manage-requests`)
   * **Visual UI:** Pending requests split from decided history. Includes requester details, desired times, and action buttons.
   * **Responsible Frontend File:** [ManageRequests.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/pages/ManageRequests.jsx)
   * **Responsible Logic/Service Function:**
     * `requestService.getPendingRequests(user.id)` in [requestService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/requestService.js)
     * `requestService.getAllRequests(user.id)` in [requestService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/requestService.js)
2. **Deciding Requests (Approve / Reject)**
   * **Location:** Action panel cards on Manage Requests Page
   * **Visual UI:** Green "Approve" button and Red "Reject" button.
   * **Responsible Frontend File:** [ManageRequests.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/pages/ManageRequests.jsx)
   * **Responsible Logic/Service Function:**
     * `requestService.approveRequest(requestId, user.id)` in [requestService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/requestService.js) (checks for active booking room overlaps, sets status to `approved`, and appends booking to database schedule).
     * `requestService.rejectRequest(requestId, user.id)` in [requestService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/requestService.js) (updates status to `rejected`).

### Flow C: View Utilization Reports
1. **Analyze Occupancy Charts**
   * **Location:** Reports Page (`/reports`)
   * **Visual UI:** Summary stat cards (total hours booked, active rooms, total bookings) and pure-CSS bar charts mapping occupancy percentages and peak booking hours.
   * **Responsible Frontend File:** [Reports.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/pages/Reports.jsx)
   * **Responsible Logic/Service Function:**
     * `bookingService.getBookings()` in [bookingService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/bookingService.js) (supplies raw dataset for frontend calculations).

---

## 3. Admin / HR (HR Role) Workflow

Users with the `'hr'` role act as the system administrators. They have location-unlocked browsing and complete management over rooms.

### Flow A: Global Location Browsing
1. **Switch Office Locations**
   * **Location:** Rooms Page (`/rooms`)
   * **Visual UI:** Interactive dropdown picker showing "Noida", "Hyderabad", and "Kolkata" (instead of the static location badge shown to regular employees/managers).
   * **Responsible Frontend File:** [Rooms.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/pages/Rooms.jsx)
   * **Responsible Logic/Service Function:**
     * `roomService.getRooms(selectedLocation)` in [roomService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/roomService.js)

### Flow B: Managing Meeting Rooms (CRUD)
1. **View All System Rooms**
   * **Location:** Manage Rooms Page (`/manage-rooms`)
   * **Visual UI:** Master inventory grid showing ID, Room Name, Location, Seating Capacity, Amenities Tags, and Status/Action options.
   * **Responsible Frontend File:** [ManageRooms.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/pages/ManageRooms.jsx)
   * **Responsible Logic/Service Function:**
     * `roomService.getAllRooms()` in [roomService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/roomService.js)
2. **Add a New Room**
   * **Location:** Header action on Manage Rooms Page
   * **Visual UI:** Add room input drawer form (Name, Location select, Capacity number, and checkboxes for amenities).
   * **Responsible Frontend File:** [ManageRooms.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/pages/ManageRooms.jsx)
   * **Responsible Logic/Service Function:**
     * `roomService.createRoom({ name, location, capacity, amenities })` in [roomService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/roomService.js)
3. **Toggle Active Status (Activate / Deactivate)**
   * **Location:** Action cells in Manage Rooms Page
   * **Visual UI:** Toggle toggle-links ("Deactivate" or "Activate").
   * **Responsible Frontend File:** [ManageRooms.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/pages/ManageRooms.jsx)
   * **Responsible Logic/Service Function:**
     * `roomService.deactivateRoom(roomId)` in [roomService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/roomService.js)
     * `roomService.activateRoom(roomId)` in [roomService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/roomService.js)
4. **Edit Room Details**
   * **Location:** "Edit" button cell on Manage Rooms Page
   * **Visual UI:** Modal populating capacity, name, location, and checkboxes.
   * **Responsible Frontend File:** [ManageRooms.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/pages/ManageRooms.jsx)
   * **Responsible Logic/Service Function:**
     * `roomService.updateRoom(roomId, updates)` in [roomService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/roomService.js)

---

## 4. Shared Booking Actions (Available to Organizers)

Regardless of role, if a user is the owner (`bookedBy === user.id`) of a meeting in the **All Bookings** page (`Booking.jsx`), they can manage that specific meeting.

1. **Calendar File Export (.ics)**
   * **Action:** Click "Calendar" button
   * **Frontend Trigger:** `handleAddToCalendar(booking)` inside [Booking.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/pages/Booking.jsx)
   * **Service Logic:** `bookingService.downloadICS(booking, room)` in [bookingService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/bookingService.js)
2. **Reschedule & Edit Booking**
   * **Action:** Click "Edit" button to open `EditBookingModal`
   * **Frontend Trigger:** [EditBookingModal.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/components/EditBookingModal.jsx)
   * **Service Logic:**
     * `bookingService.getRoomsStatus(location, date, startTime, endTime, excludeBookingId)` in [bookingService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/bookingService.js) (retrieves real-time room availability for rescheduling).
     * `bookingService.updateBooking(bookingId, updates)` in [bookingService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/bookingService.js) (validates and updates time, room, title, and merges new attendee invites).
3. **Cancel a Booking**
   * **Action:** Click red "Cancel" button
   * **Frontend Trigger:** `handleCancel(bookingId)` inside [Booking.jsx](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/pages/Booking.jsx)
   * **Service Logic:** `bookingService.cancelBooking(bookingId)` in [bookingService.js](file:///home/vinay-dhiman/Documents/react_project/internship_project/frontend/src/services/bookingService.js)
