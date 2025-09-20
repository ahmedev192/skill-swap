# Session Access Control Implementation

## Overview
Implemented proper session access control and workflow management to ensure only authorized users can perform specific actions on sessions.

## Requirements Implemented

### ✅ 1. Session Visibility
**Requirement**: Sessions appear only for the student and instructor
**Implementation**: 
- Existing access control in `SessionsController.GetSession()` already restricts access to session participants and admins
- All session endpoints (`my-sessions`, `teaching`, `learning`, `upcoming`) filter by user ID
- No changes needed - already properly implemented

### ✅ 2. Instructor Accept/Reject Control
**Requirement**: Only instructor can accept or reject session requests
**Implementation**:
- Updated `SessionService.ConfirmSessionAsync()` to restrict access to instructors only
- If instructor rejects, session is automatically cancelled and credits are refunded
- If instructor accepts, session status changes to `Confirmed`
- Updated controller documentation to reflect "Accept or reject session (Instructor only)"

### ✅ 3. Instructor Session Completion Control
**Requirement**: Only instructor can confirm that the session is ended
**Implementation**:
- Updated `SessionService.CompleteSessionAsync()` to restrict access to instructors only
- Students can no longer complete sessions
- Updated controller documentation to reflect "Complete session (Instructor only)"

### ✅ 4. Student Feedback System
**Requirement**: Student can give feedback after session completion
**Implementation**:
- Existing `ReviewService` already supports this functionality
- Students can create reviews for completed sessions
- Only session participants can review
- Only one review per session per user
- Automatically determines who is being reviewed (student reviews instructor)

### ✅ 5. Student Reschedule Control
**Requirement**: Student can only reschedule before session is confirmed
**Implementation**:
- Updated `SessionService.RescheduleSessionAsync()` to:
  - Restrict access to students only
  - Only allow rescheduling of `Pending` sessions (before confirmation)
  - Validate new session times
  - Handle credit adjustments for time changes
- Updated method signature to include `userId` parameter
- Updated controller documentation to reflect "Reschedule session (Student only, before confirmation)"

## Technical Changes Made

### 1. **SessionService.cs**
- **ConfirmSessionAsync()**: Added instructor-only access control and automatic rejection handling
- **CompleteSessionAsync()**: Added instructor-only access control
- **RescheduleSessionAsync()**: Added student-only access control and pre-confirmation restriction

### 2. **ISessionService.cs**
- Updated `RescheduleSessionAsync()` method signature to include `userId` parameter

### 3. **SessionsController.cs**
- Updated method calls to match new service signatures
- Updated documentation comments to reflect access restrictions
- Removed redundant access checks (now handled in service layer)

## Session Workflow

### 1. **Session Creation**
- Student creates session request
- Credits are held in escrow
- Session status: `Pending`

### 2. **Instructor Response**
- **Accept**: Session status → `Confirmed`
- **Reject**: Session status → `Cancelled`, credits refunded

### 3. **Before Confirmation (Pending Status)**
- ✅ Student can reschedule
- ❌ Instructor cannot reschedule
- ❌ Session cannot be completed

### 4. **After Confirmation (Confirmed Status)**
- ❌ No rescheduling allowed
- ✅ Instructor can complete session
- ❌ Student cannot complete session

### 5. **After Completion (Completed Status)**
- ✅ Student can give feedback/review
- ✅ Instructor can give feedback/review
- ✅ Credits transferred to instructor

## Access Control Matrix

| Action | Student | Instructor | Admin |
|--------|---------|------------|-------|
| View Sessions | ✅ Own sessions only | ✅ Own sessions only | ✅ All sessions |
| Create Session | ✅ | ❌ | ❌ |
| Accept/Reject Session | ❌ | ✅ | ❌ |
| Reschedule Session | ✅ (Pending only) | ❌ | ❌ |
| Complete Session | ❌ | ✅ | ❌ |
| Cancel Session | ✅ | ✅ | ✅ |
| Give Review | ✅ (After completion) | ✅ (After completion) | ❌ |

## Security Benefits
- ✅ Prevents unauthorized session manipulation
- ✅ Ensures proper workflow progression
- ✅ Protects against credit system abuse
- ✅ Maintains data integrity
- ✅ Clear separation of responsibilities

## Files Modified
- `src/SkillSwap.Infrastructure/Services/SessionService.cs`
- `src/SkillSwap.Core/Interfaces/IServices/ISessionService.cs`
- `src/SkillSwap.API/Controllers/SessionsController.cs`

## Testing Recommendations
1. Test instructor accept/reject functionality
2. Test instructor-only session completion
3. Test student reschedule restrictions (before/after confirmation)
4. Test student feedback after completion
5. Test access control for unauthorized users
6. Verify credit handling in all scenarios
