# SkillSwap API Documentation

## Overview
SkillSwap is a skill-sharing platform where users can offer their skills and request to learn skills from others. The API is built with ASP.NET Core and provides comprehensive functionality for user management, skill matching, session booking, messaging, reviews, and notifications.

## Base URLs
- **Development**: `https://localhost:51422` (HTTPS) or `http://localhost:51423` (HTTP)
- **Production**: Replace with your production domain

## Authentication
The API uses JWT (JSON Web Token) authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Data Models

### Enums
```typescript
enum SessionStatus {
  Pending = 1,
  Confirmed = 2,
  InProgress = 3,
  Completed = 4,
  Cancelled = 5,
  Disputed = 6
}

enum SkillType {
  Offered = 1,
  Requested = 2
}

enum SkillLevel {
  Beginner = 1,
  Intermediate = 2,
  Expert = 3
}

enum MessageType {
  Text = 1,
  Image = 2,
  File = 3,
  System = 4
}

enum NotificationType {
  SessionRequest = 1,
  SessionConfirmed = 2,
  SessionReminder = 3,
  SessionCompleted = 4,
  NewMessage = 5,
  NewReview = 6,
  CreditEarned = 7,
  CreditSpent = 8,
  System = 9,
  MatchFound = 10,
  GroupEvent = 11
}
```

### Core Data Types
```typescript
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string; // ISO date
  isEmailVerified: boolean;
  isIdVerified: boolean;
  createdAt: string; // ISO date
  lastActiveAt?: string; // ISO date
  profileImageUrl?: string;
  timeZone?: string;
  preferredLanguage?: string;
  creditBalance: number;
  averageRating: number;
  totalReviews: number;
}

interface Skill {
  id: number;
  name: string;
  description?: string;
  category: string;
  subCategory?: string;
  isActive: boolean;
  createdAt: string; // ISO date
}

interface UserSkill {
  id: number;
  userId: string;
  skillId: number;
  type: SkillType;
  level: SkillLevel;
  description?: string;
  requirements?: string;
  creditsPerHour: number;
  isAvailable: boolean;
  createdAt: string; // ISO date
  updatedAt?: string; // ISO date
  skill: Skill;
  user: User;
}

interface Session {
  id: number;
  teacherId: string;
  studentId: string;
  userSkillId: number;
  scheduledStart: string; // ISO date
  scheduledEnd: string; // ISO date
  actualStart?: string; // ISO date
  actualEnd?: string; // ISO date
  creditsCost: number;
  status: SessionStatus;
  notes?: string;
  meetingLink?: string;
  isOnline: boolean;
  location?: string;
  createdAt: string; // ISO date
  updatedAt?: string; // ISO date
  cancelledAt?: string; // ISO date
  cancellationReason?: string;
  teacherConfirmed: boolean;
  studentConfirmed: boolean;
  confirmedAt?: string; // ISO date
  teacher: User;
  student: User;
  userSkill: UserSkill;
}

interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string; // ISO date
  readAt?: string; // ISO date
  isRead: boolean;
  sessionId?: number;
  type: MessageType;
  attachmentUrl?: string;
  sender: User;
  receiver: User;
  session?: Session;
}

interface Review {
  id: number;
  reviewerId: string;
  revieweeId: string;
  sessionId: number;
  rating: number; // 1-5
  comment?: string;
  createdAt: string; // ISO date
  updatedAt?: string; // ISO date
  isVisible: boolean;
  reviewer: User;
  reviewee: User;
  session: Session;
}

interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string; // ISO date
  readAt?: string; // ISO date
  relatedEntityId?: number;
  relatedEntityType?: string;
  actionUrl?: string;
  user: User;
}
```

---

## API Endpoints

### 1. Authentication (`/api/auth`)

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string; // ISO date
  timeZone?: string;
  preferredLanguage?: string;
}
```

**Response:**
```typescript
{
  token: string;
  refreshToken: string;
  expiresAt: string; // ISO date
  user: User;
}
```

#### POST `/api/auth/login`
Login user with email and password.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  token: string;
  refreshToken: string;
  expiresAt: string; // ISO date
  user: User;
}
```

#### POST `/api/auth/refresh-token`
Refresh JWT token using refresh token.

**Request Body:**
```typescript
{
  refreshToken: string;
}
```

**Response:**
```typescript
{
  token: string;
  refreshToken: string;
  expiresAt: string; // ISO date
  user: User;
}
```

#### POST `/api/auth/logout`
Logout user and invalidate refresh token.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  refreshToken: string;
}
```

**Response:**
```typescript
{
  message: string;
}
```

#### POST `/api/auth/verify-email`
Verify user email address.

**Request Body:**
```typescript
{
  userId: string;
  token: string;
}
```

**Response:**
```typescript
{
  message: string;
}
```

#### POST `/api/auth/forgot-password`
Request password reset email.

**Request Body:**
```typescript
{
  email: string;
}
```

**Response:**
```typescript
{
  message: string;
}
```

#### POST `/api/auth/reset-password`
Reset password with token.

**Request Body:**
```typescript
{
  userId: string;
  token: string;
  newPassword: string;
}
```

**Response:**
```typescript
{
  message: string;
}
```

---

### 2. Users (`/api/users`)

#### GET `/api/users/me`
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `User`

#### GET `/api/users/{id}`
Get user by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** `User`

#### GET `/api/users`
Get all users with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 20)

**Response:**
```typescript
{
  data: User[];
  page: number;
  pageSize: number;
  totalCount: number;
}
```

#### PUT `/api/users/me`
Update current user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string; // ISO date
  profileImageUrl?: string;
  timeZone?: string;
  preferredLanguage?: string;
}
```

**Response:** `User`

#### PUT `/api/users/{id}`
Update user by ID (Admin only).

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Request Body:** Same as above

**Response:** `User`

#### DELETE `/api/users/{id}`
Delete user (Admin only).

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Response:**
```typescript
{
  message: string;
}
```

#### GET `/api/users/search`
Search users by name or location.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `searchTerm` (string, required)
- `location` (string, optional)

**Response:** `User[]`

#### GET `/api/users/{id}/credits`
Get user credit balance.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  balance: number;
}
```

#### POST `/api/users/change-password`
Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  currentPassword: string;
  newPassword: string;
}
```

**Response:**
```typescript
{
  message: string;
}
```

---

### 3. Skills (`/api/skills`)

#### GET `/api/skills`
Get all available skills.

**Response:** `Skill[]`

#### GET `/api/skills/{id}`
Get skill by ID.

**Response:** `Skill`

#### GET `/api/skills/category/{category}`
Get skills by category.

**Response:** `Skill[]`

#### POST `/api/skills`
Create a new skill (Admin only).

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Request Body:**
```typescript
{
  name: string;
  description?: string;
  category: string;
  subCategory?: string;
}
```

**Response:** `Skill`

#### PUT `/api/skills/{id}`
Update skill (Admin only).

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Request Body:**
```typescript
{
  name?: string;
  description?: string;
  category?: string;
  subCategory?: string;
  isActive?: boolean;
}
```

**Response:** `Skill`

#### DELETE `/api/skills/{id}`
Delete skill (Admin only).

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Response:**
```typescript
{
  message: string;
}
```

#### GET `/api/skills/user/{userId}`
Get user's skills.

**Headers:** `Authorization: Bearer <token>`

**Response:** `UserSkill[]`

#### GET `/api/skills/user/{userId}/offered`
Get user's offered skills.

**Response:** `UserSkill[]`

#### GET `/api/skills/user/{userId}/requested`
Get user's requested skills.

**Response:** `UserSkill[]`

#### POST `/api/skills/user`
Create a new user skill.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  skillId: number;
  type: SkillType;
  level: SkillLevel;
  description?: string;
  requirements?: string;
  creditsPerHour: number; // default: 1.0
}
```

**Response:** `UserSkill`

#### PUT `/api/skills/user/{userSkillId}`
Update user skill.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  level?: SkillLevel;
  description?: string;
  requirements?: string;
  creditsPerHour?: number;
  isAvailable?: boolean;
}
```

**Response:** `UserSkill`

#### DELETE `/api/skills/user/{userSkillId}`
Delete user skill.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  message: string;
}
```

#### GET `/api/skills/search`
Search skills.

**Query Parameters:**
- `searchTerm` (string, required)
- `category` (string, optional)
- `location` (string, optional)

**Response:** `UserSkill[]`

---

### 4. Matching (`/api/matching`)

#### GET `/api/matching/my-matches`
Find matches for current user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `UserSkill[]`

#### GET `/api/matching/offered-for-request/{requestedSkillId}`
Find offered skills for a requested skill.

**Headers:** `Authorization: Bearer <token>`

**Response:** `UserSkill[]`

#### GET `/api/matching/requested-for-offer/{offeredSkillId}`
Find requested skills for an offered skill.

**Headers:** `Authorization: Bearer <token>`

**Response:** `UserSkill[]`

#### GET `/api/matching/recommended-skills`
Get recommended skills for current user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `UserSkill[]`

#### GET `/api/matching/recommended-users`
Get recommended users for current user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `User[]`

---

### 5. Sessions (`/api/sessions`)

#### GET `/api/sessions/my-sessions`
Get current user's sessions.

**Headers:** `Authorization: Bearer <token>`

**Response:** `Session[]`

#### GET `/api/sessions/teaching`
Get current user's teaching sessions.

**Headers:** `Authorization: Bearer <token>`

**Response:** `Session[]`

#### GET `/api/sessions/learning`
Get current user's learning sessions.

**Headers:** `Authorization: Bearer <token>`

**Response:** `Session[]`

#### GET `/api/sessions/{id}`
Get session by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** `Session`

#### POST `/api/sessions`
Create a new session booking.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  teacherId: string;
  userSkillId: number;
  scheduledStart: string; // ISO date
  scheduledEnd: string; // ISO date
  notes?: string;
  isOnline: boolean; // default: true
  location?: string;
}
```

**Response:** `Session`

#### PUT `/api/sessions/{id}`
Update session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  scheduledStart?: string; // ISO date
  scheduledEnd?: string; // ISO date
  notes?: string;
  meetingLink?: string;
  isOnline?: boolean;
  location?: string;
}
```

**Response:** `Session`

#### POST `/api/sessions/{id}/cancel`
Cancel session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  reason: string;
}
```

**Response:**
```typescript
{
  message: string;
}
```

#### POST `/api/sessions/{id}/confirm`
Confirm session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  confirmed: boolean;
  notes?: string;
}
```

**Response:**
```typescript
{
  message: string;
}
```

#### POST `/api/sessions/{id}/complete`
Complete session.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  message: string;
}
```

#### GET `/api/sessions/status/{status}`
Get sessions by status (Admin only).

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Response:** `Session[]`

#### GET `/api/sessions/upcoming`
Get upcoming sessions.

**Headers:** `Authorization: Bearer <token>`

**Response:** `Session[]`

#### POST `/api/sessions/{id}/reschedule`
Reschedule session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  newStart: string; // ISO date
  newEnd: string; // ISO date
}
```

**Response:**
```typescript
{
  message: string;
}
```

---

### 6. Messages (`/api/messages`)

#### GET `/api/messages/conversations`
Get conversations for current user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  otherUserId: string;
  otherUserName: string;
  otherUserProfileImage?: string;
  lastMessage: string;
  lastMessageTime: string; // ISO date
  unreadCount: number;
}[]
```

#### GET `/api/messages/conversation/{otherUserId}`
Get messages between current user and another user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 50)

**Response:** `Message[]`

#### POST `/api/messages`
Send a message.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  receiverId: string;
  content: string;
  sessionId?: number;
  type: MessageType; // default: Text
  attachmentUrl?: string;
}
```

**Response:** `Message`

#### POST `/api/messages/mark-read`
Mark messages as read.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  senderId: string;
}
```

**Response:**
```typescript
{
  message: string;
}
```

#### GET `/api/messages/unread-count`
Get unread message count.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  unreadCount: number;
}
```

---

### 7. Reviews (`/api/reviews`)

#### GET `/api/reviews/my-reviews`
Get reviews given by current user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `Review[]`

#### GET `/api/reviews/user/{userId}`
Get reviews for a specific user.

**Response:** `Review[]`

#### GET `/api/reviews/{id}`
Get review by ID.

**Response:** `Review`

#### POST `/api/reviews`
Create a new review.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  revieweeId: string;
  sessionId: number;
  rating: number; // 1-5
  comment?: string;
}
```

**Response:** `Review`

#### PUT `/api/reviews/{id}`
Update review.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  rating?: number; // 1-5
  comment?: string;
}
```

**Response:** `Review`

#### DELETE `/api/reviews/{id}`
Delete review.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  message: string;
}
```

#### GET `/api/reviews/user/{userId}/rating`
Get user's average rating.

**Response:**
```typescript
{
  averageRating: number;
  reviewCount: number;
}
```

#### GET `/api/reviews/session/{sessionId}`
Get reviews for a session.

**Response:** `Review[]`

---

### 8. Notifications (`/api/notifications`)

#### GET `/api/notifications`
Get current user's notifications.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `unreadOnly` (boolean, default: false)

**Response:** `Notification[]`

#### GET `/api/notifications/unread-count`
Get unread notification count.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  unreadCount: number;
}
```

#### POST `/api/notifications/{id}/mark-read`
Mark notification as read.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  message: string;
}
```

#### POST `/api/notifications/mark-all-read`
Mark all notifications as read.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  message: string;
}
```

---

### 9. Admin (`/api/admin`)

#### GET `/api/admin/stats`
Get system statistics.

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Response:**
```typescript
{
  totalUsers: number;
  totalSkills: number;
  completedSessions: number;
  activeUsers: number;
}
```

#### GET `/api/admin/users`
Get all users with pagination.

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 20)

**Response:**
```typescript
{
  data: User[];
  page: number;
  pageSize: number;
  totalCount: number;
}
```

#### GET `/api/admin/users/{userId}`
Get user details by ID.

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Response:** `User`

#### PUT `/api/admin/users/{userId}`
Update user (Admin only).

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Request Body:** Same as user update

**Response:** `User`

#### DELETE `/api/admin/users/{userId}`
Delete user (Admin only).

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Response:**
```typescript
{
  message: string;
}
```

#### POST `/api/admin/users/{userId}/credits/adjust`
Adjust user credits.

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Request Body:**
```typescript
{
  amount: number;
  description: string;
}
```

**Response:**
```typescript
{
  message: string;
}
```

#### GET `/api/admin/users/{userId}/transactions`
Get user transaction history.

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Response:** `CreditTransaction[]`

#### GET `/api/admin/skills`
Get all skills.

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Response:** `Skill[]`

#### POST `/api/admin/skills`
Create skill.

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Request Body:** Same as skill creation

**Response:** `Skill`

#### PUT `/api/admin/skills/{id}`
Update skill.

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Request Body:** Same as skill update

**Response:** `Skill`

#### DELETE `/api/admin/skills/{id}`
Delete skill.

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Response:**
```typescript
{
  message: string;
}
```

#### GET `/api/admin/sessions/status/{status}`
Get sessions by status.

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Response:** `Session[]`

---

### 10. Admin Audit (`/api/admin/audit`)

#### GET `/api/admin/audit/user/{userId}`
Get user audit logs.

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 50)

**Response:**
```typescript
{
  data: AuditLog[];
  page: number;
  pageSize: number;
}
```

#### GET `/api/admin/audit/system`
Get system audit logs.

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 50)

**Response:**
```typescript
{
  data: AuditLog[];
  page: number;
  pageSize: number;
}
```

#### GET `/api/admin/audit/security`
Get security audit logs.

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 50)

**Response:**
```typescript
{
  data: AuditLog[];
  page: number;
  pageSize: number;
}
```

---

### 11. Health (`/api/health`)

#### GET `/api/health`
Basic health check.

**Response:**
```typescript
{
  status: string;
  timestamp: string; // ISO date
  version: string;
  environment: string;
}
```

#### GET `/api/health/detailed`
Detailed health check with database connectivity.

**Response:**
```typescript
{
  status: string;
  timestamp: string; // ISO date
  version: string;
  environment: string;
  checks: {
    database: {
      status: string;
      message: string;
    };
    memory: {
      status: string;
      workingSet: number;
      privateMemory: number;
      virtualMemory: number;
    };
    disk: {
      status: string;
      totalSpace: number;
      freeSpace: number;
      usedSpace: number;
    };
  };
}
```

#### GET `/api/health/metrics`
System metrics (Admin only).

**Headers:** `Authorization: Bearer <token>`, `Role: Admin`

**Response:**
```typescript
{
  timestamp: string; // ISO date
  users: {
    total: number;
    active: number;
  };
  skills: {
    total: number;
    offered: number;
    requested: number;
  };
  sessions: {
    total: number;
    active: number;
    completed: number;
    pending: number;
  };
  system: {
    uptime: number; // seconds
    memoryUsage: number;
    cpuTime: number; // milliseconds
  };
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```typescript
{
  message: string;
}
```

### 401 Unauthorized
```typescript
{
  message: string;
}
```

### 403 Forbidden
```typescript
{
  message: string;
}
```

### 404 Not Found
```typescript
{
  message: string;
}
```

### 500 Internal Server Error
```typescript
{
  message: string;
}
```

---

## WebSocket Support

The API includes SignalR support for real-time notifications:

### Connection
Connect to: `{baseUrl}/notificationHub`

### Events
- `ReceiveNotification`: Receive new notifications
- `ReceiveMessage`: Receive new messages
- `SessionUpdate`: Receive session status updates

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- Authentication endpoints: 5 requests per minute
- General endpoints: 100 requests per minute
- Admin endpoints: 200 requests per minute

---

## Frontend Integration Guide

### 1. Authentication Flow
1. Register/Login to get JWT token
2. Store token in localStorage or secure storage
3. Include token in all authenticated requests
4. Handle token expiration and refresh

### 2. State Management
Recommended state structure:
```typescript
interface AppState {
  auth: {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
  };
  skills: {
    available: Skill[];
    userSkills: UserSkill[];
    matches: UserSkill[];
  };
  sessions: {
    mySessions: Session[];
    teaching: Session[];
    learning: Session[];
  };
  messages: {
    conversations: Conversation[];
    currentChat: Message[];
  };
  notifications: {
    list: Notification[];
    unreadCount: number;
  };
}
```

### 3. Key Features to Implement
1. **User Registration/Login** with email verification
2. **Skill Management** - Add/Edit/Delete offered and requested skills
3. **Matching System** - Find skill matches and recommendations
4. **Session Booking** - Create, confirm, and manage sessions
5. **Real-time Messaging** - Chat between users
6. **Review System** - Rate and review completed sessions
7. **Notification Center** - Real-time notifications
8. **Credit System** - Manage user credits and transactions
9. **Admin Dashboard** - System management (Admin users only)

### 4. UI Components Needed
- User authentication forms
- Skill selection and management
- Session calendar and booking
- Chat interface
- Review and rating system
- Notification center
- User profile management
- Admin dashboard

### 5. Real-time Features
- WebSocket connection for notifications
- Live chat updates
- Session status changes
- New match notifications

This comprehensive API documentation provides everything needed to build a full-featured React frontend for the SkillSwap platform.
