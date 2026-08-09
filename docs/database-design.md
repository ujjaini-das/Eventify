## 1. user
Fields:
- _id
- name
- email
- password
- role
- profileImage
- createdAt
- updatedAt


## 2. Event
Fields
- _id
- title
- description 
- date
- time 
- venue
- category
- capacity
- banner
- organizer
- createdAt
- updatedAt


## 3. Registration
Fields:
- _id
- user
- event
- status
- registeredAt
- checkedIn
- createdAt
- updatedAt


## 4. Ticket
Fields:
- _id
- ticketCode
- registration
- qrCode
- status
- createdAt


User ------ creates ------> Event
 |                           |
 |                           |
 |                           |
 --- register ---> Registration ----- creates -----> Ticket