# Authentication Troubleshooting Guide

## Issue: "Unauthorized - No token provided" on Android/Mobile

### Problem Description
New users experiencing "unauthorized user token not provided" error when creating account or logging in, especially on Android devices.

### Root Cause
The issue occurs because after successful signup/login, the frontend immediately tries to make authenticated requests (notifications, stories, socket) before the JWT cookie is properly set in mobile environments.

### Solutions Implemented

#### 1. **Improved Post-Authentication Flow**
- Added `initializePostAuthActions()` function with progressive retry logic
- Implements 3 retry attempts with increasing delays (1s, 2s, 3s)
- Gracefully handles authentication failures without breaking the user experience

#### 2. **Enhanced Error Handling**
- Auth middleware now provides clearer error messages with error codes
- Frontend distinguishes between critical and non-critical auth errors
- Notification fetch failures are logged as warnings, not errors

#### 3. **Better Cookie Configuration**
- Improved cookie settings for mobile compatibility
- Enhanced CORS configuration for mobile apps
- Added proper headers exposure for Set-Cookie

#### 4. **Debugging Support**
- Added comprehensive logging throughout the auth flow
- Debug endpoint available at `/api/auth/debug-cookies`
- Better error codes and suggestions in API responses

### Testing the Fix

1. **Check Server Logs**: Look for these log messages during signup/login:
   ```
   ✅ User saved to database: [userId]
   ✅ JWT token generated and cookie set for user: [userName]
   🔄 Initializing post-auth actions...
   ✅ Auth verified successfully: [userName]
   ```

2. **Debug Endpoint**: Test cookie setting by visiting:
   ```
   GET /api/auth/debug-cookies
   ```

3. **Mobile Testing**: Test on actual mobile devices or mobile browser modes

### Expected Behavior After Fix
- Users can successfully sign up/login
- If initial notification/story loading fails, it retries automatically
- No "unauthorized" pop-ups shown to users
- App remains functional even if some background requests fail initially

### Additional Troubleshooting

If issues persist, check:

1. **CORS Configuration**: Ensure mobile app origins are allowed
2. **Cookie Settings**: Verify sameSite and secure attributes for your environment
3. **Network Issues**: Check if requests are being blocked by network policies
4. **Browser/WebView**: Some mobile browsers have strict cookie policies

### Monitoring
Watch server logs for:
- `❌ No JWT token in cookies - this might be expected for new users`
- `🔄 Retrying auth actions in [time]ms...`
- `❌ Max auth attempts reached`

These indicate the retry mechanism is working as designed.