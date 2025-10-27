# 🧠 Project Pulse API Documentation

## 📍 Base URL
```
http://localhost:5000/api
```

---

## 🔑 Authentication

All protected endpoints require a **JWT token** in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 🌐 Multi-Tenant Headers

For endpoints requiring community context, include:

```
x-community-subdomain: <community_subdomain>
```

---

## 🚀 API Endpoints

### 🔐 **Authentication**

#### 1. Register User
**POST** `/auth/register`

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "super_admin|community_admin|resident",
  "communitySubdomain": "string", 
  "apartmentNumber": "string"
}
```

---

#### 2. Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

---

#### 3. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

---

#### 4. Update Profile
**PUT** `/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** Partial user data object

---

#### 5. Change Password
**PUT** `/auth/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

---

### 🏢 **Communities**

#### 1. Create Community *(Super Admin only)*
**POST** `/communities`

**Headers:**
```
Authorization: Bearer <super_admin_token>
```

**Body:**
```json
{
  "name": "string",
  "subdomain": "string",
  "contactEmail": "string",
  "description": "string",
  "settings": {
    "primaryColor": "string",
    "categories": ["string"],
    "aiFeatures": "boolean"
  }
}
```

---

#### 2. Get All Communities *(Super Admin only)*
**GET** `/communities?page=1&limit=10&search=query`

---

#### 3. Get Current Community
**GET** `/communities/current`

**Headers:**
```
Authorization: Bearer <token>
x-community-subdomain: <subdomain>
```

---

#### 4. Update Community Settings
**PUT** `/communities/settings`

**Headers:**
```
Authorization: Bearer <admin_token>
x-community-subdomain: <subdomain>
```

**Body:** Settings object

---

#### 5. Get Community Members
**GET** `/communities/members?role=resident&page=1&limit=20`

---

#### 6. Update Member Role
**PUT** `/communities/members/:userId/role`

**Body:**
```json
{
  "role": "resident|community_admin"
}
```

---

### 📋 **Issues**

#### 1. Get All Issues
**GET** `/issues?status=open&category=Plumbing&urgency=high&sortBy=createdAt&sortOrder=desc&page=1&limit=20&search=query`

**Headers:**
```
Authorization: Bearer <token>
x-community-subdomain: <subdomain>
```

---

#### 2. Get Single Issue
**GET** `/issues/:id`

---

#### 3. Create Issue
**POST** `/issues`

**Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "urgency": "low|medium|high|critical",
  "location": "string",
  "images": ["string"],
  "tags": ["string"]
}
```

---

#### 4. Update Issue Status *(Admin only)*
**PUT** `/issues/:id/status`

**Body:**
```json
{
  "status": "open|acknowledged|in_progress|resolved",
  "assignedTo": "user_id",
  "adminNote": "string"
}
```

---

#### 5. Upvote Issue
**POST** `/issues/:id/upvote`

---

#### 6. Add Comment
**POST** `/issues/:id/comments`

**Body:**
```json
{
  "content": "string",
  "isInternal": "boolean"
}
```

---

#### 7. Get Comments
**GET** `/issues/:id/comments?page=1&limit=50`

---

#### 8. Get Issue Statistics
**GET** `/issues/stats/overview`

---

### ⚙️ **Response Formats**

#### ✅ Success
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

#### ❌ Error
```json
{
  "success": false,
  "error": "Error message"
}
```

---

### 🔄 **Real-Time Events (WebSocket)**

| Event Name | Description |
|-------------|--------------|
| `join-community` | Join community room |
| `join-issue` | Join issue room |
| `new-issue` | Triggered when a new issue is created |
| `issue-updated` | Triggered when issue details are updated |

---

## 🧩 Step 5: Deploy Backend to Railway

### ⚙️ Railway Configuration

**File:** `backend/railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

### 🚀 Deployment Steps
1. Login to [Railway](https://railway.app/).
2. Create a new project and connect your GitHub repository.
3. Add your environment variables from `.env`.
4. Deploy automatically via GitHub or manually using:
   ```bash
   railway up
   ```
5. Verify logs and ensure the backend is running successfully.

---

📘 **Author:** *Project Pulse Team*  
📅 **Last Updated:** October 2025
