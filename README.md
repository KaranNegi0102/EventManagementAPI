# 📅 Event Management REST API

A robust RESTful API built using **Node.js**, **Express**, and **PostgreSQL** to manage events and user registrations with custom business logic, validations, and constraints.

---

## 🚀 Features

* Create and manage events
* Register and unregister users for events
* Prevent duplicate registrations
* Enforce capacity limits
* Disallow registration for past events
* Custom sorting for upcoming events
* View event statistics (total registrations, remaining slots, capacity %)

---

## 🧱 Tech Stack

* **Backend**: Node.js, Express
* **Database**: PostgreSQL
* **Environment Management**: dotenv

---

## 🏗️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/KaranNegi0102/EventManagementAPI.git
cd event-management-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/yourdbname
```

### 4. Set Up Database

Run the following SQL:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  datetime TIMESTAMP NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INTEGER CHECK (capacity > 0 AND capacity <= 1000) NOT NULL
);

CREATE TABLE registrations (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, event_id)
);
```

### 5. Run the Server

```bash
npm start
```

---

## 🧪 API Endpoints

### 🔹 Create Event

`POST /events`

```json
{
  "title": "Tech Conference 2025",
  "datetime": "2025-08-01T10:00:00Z",
  "location": "Delhi",
  "capacity": 300
}
```

**Response:**

```json
{ "eventId": 1 }
```

### 🔹 Get Event Details

`GET /events/:id`
**Response:**

```json
{
  "id": 1,
  "title": "Tech Conference 2025",
  "location": "Delhi",
  "datetime": "2025-08-01T10:00:00Z",
  "capacity": 300,
  "registeredUsers": [
    { "id": 1, "name": "Karan", "email": "karan@example.com" }
  ]
}
```

### 🔹 Register for Event

`POST /events/:id/register`

```json
{
  "userId": 1
}
```

### 🔹 Cancel Registration

`DELETE /events/:id/register/:userId`
**Response:**

```json
{ "message": "Registration cancelled" }
```

### 🔹 List Upcoming Events

`GET /events/upcoming`
**Query:** Sorted by date ASC, then location alphabetically.
**Response:**

```json
[
  {
    "id": 2,
    "title": "Hackathon",
    "datetime": "2025-08-05T09:00:00Z",
    "location": "Bangalore"
  },
  ...
]
```

### 🔹 Event Stats

`GET /events/:id/stats`
**Response:**

```json
{
  "totalRegistrations": 150,
  "remainingCapacity": 150,
  "capacityUsedPercent": 50
}
```

---

## 🛡️ Error Handling

Standard JSON error responses:

```json
{
  "error": "Event is already full"
}
```

```json
{
  "error": "User already registered"
}
```

---

## 📋 License

MIT

---

## 👨‍💻 Author

**Karan Negi**
GitHub: [@karannegi](https://github.com/yourusername)
