# UnityServe – Backend REST API Server

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel_Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)

**High-Performance Backend REST API for UnityServe.**  
Handles verified event lifecycles, real-time date filtering, RSVP transactions, user profile management, and JWT authorization.

[🖥️ **Live API Base**](https://unity-serve-server-amber.vercel.app) • [🌐 **Live Client Site**](https://unity-serve-client.vercel.app) • [📂 **Client Repository**](https://github.com/devabunayem/unity-serve-client)

</div>

---

## 🛠️ Tech Stack & Dependencies

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (v5)
- **Database:** MongoDB Atlas (Native MongoDB Node Driver)
- **Security & Authorization:** JSON Web Token (JWT), Cookie-Parser, CORS
- **Environment Management:** Dotenv (Robust multi-path resolution)
- **Serverless Engine:** `@vercel/node`

---

## 📋 API Endpoints Reference

### 🔐 Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/jwt` | Issues signed JWT token & HTTP-only cookie on login | Public |
| `POST` | `/api/auth/logout` | Clears authentication cookie | Public |
| `GET` | `/api/auth/me` | Retrieves verified user profile from token | Private (JWT) |
| `PUT` | `/api/auth/profile` | Updates user display name and profile avatar | Private (JWT) |

### 📅 Events Routes (`/api/events`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events/upcoming` | All future events (`eventDate >= today`), supports `?limit=6`, `?search=...`, `?eventType=...` | Public |
| `GET` | `/api/events/:id` | Single event details with real-time attendee count | Public |
| `POST` | `/api/events` | Create new social event with strict future date validation | Private (JWT) |
| `GET` | `/api/events/user/my-events` | Events created by logged-in user | Private (JWT) |
| `PUT` | `/api/events/:id` | Update user's own event (Creator only) | Private (JWT) |
| `DELETE` | `/api/events/:id` | Delete user's own event & associated RSVPs | Private (JWT) |
| `POST` | `/api/events/:id/join` | Join an upcoming event (duplicate join prevention) | Private (JWT) |
| `GET` | `/api/events/user/my-joined` | All events joined by user (sorted by date) | Private (JWT) |
| `GET` | `/api/events/:id/is-joined` | Check if current user is registered for event | Private (JWT) |

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/devabunayem/unity-serve-server.git
cd unity-serve-server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Database (Optional)
Populate realistic community service drives with verified dates:
```bash
npm run seed
```

### 4. Run the Server
```bash
npm run dev
```
Server runs at [http://localhost:5000](http://localhost:5000).
