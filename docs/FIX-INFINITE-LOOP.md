# 🔧 Fix: Infinite Loop on Wrong OTP Entry

## Problem
When entering a wrong OTP, the application got stuck in an infinite loop trying to refresh tokens.

## Root Cause
The axios response interceptor was attempting to refresh tokens on **ALL** 401 errors, including:
- Invalid OTP errors (401 Unauthorized)
- The refresh endpoint itself returning 401 (when user isn't logged in)

This created an infinite loop:
1. User enters wrong OTP → 401 error
2. Interceptor tries to refresh token → calls `/auth/refresh`
3. Refresh fails (user not logged in) → 401 error
4. Interceptor tries to refresh again → infinite loop! 🔄

## Solution
Updated `frontend/src/lib/api/axios.ts` to exclude public authentication endpoints from automatic token refresh logic.

### Changes Made

```typescript
// Added list of public endpoints
const PUBLIC_ENDPOINTS = [
    '/auth/login',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/refresh',
];

// Updated interceptor to check if endpoint is public
const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
    originalRequest.url?.includes(endpoint)
);

// Only refresh if NOT a public endpoint
if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
    // ... refresh logic
}
```

## Result
✅ Invalid OTP errors now properly display without triggering refresh loop  
✅ Other 401 errors still trigger token refresh as expected  
✅ Public auth endpoints (login, forgot-password, reset-password) bypass refresh logic  
✅ Clean error handling with proper user feedback  

## Testing
1. Enter wrong OTP → See "Invalid OTP" error (no loop)
2. Try multiple wrong OTPs → See attempts counter decrement
3. Fail 5 times → Account locks properly
4. All without infinite refresh loops! 🎉
