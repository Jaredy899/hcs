# Password Reset Functionality

This document explains how to use the password reset feature in your HCS Case Management System.

## How It Works

The password reset system provides a secure way for users to reset their passwords when they forget them **while preserving all their data including clients, notes, and todos**. Here's the flow:

1. **User requests password reset**: On the sign-in page, click "Forgot your password?"
2. **Enter email**: User enters their email address
3. **Token generation**: System generates a secure, time-limited reset token
4. **Reset link**: A reset link is generated (currently logged to console for development)
5. **Password reset**: User clicks the link and enters a new password
6. **Credential update**: New password credentials are created while preserving all user data
7. **Automatic sign-in**: User is immediately signed in with their new password

## Security Features

- **Token expiration**: Reset tokens expire after 24 hours
- **One-time use**: Tokens become invalid after being used
- **Secure hashing**: Passwords are hashed using Convex Auth's built-in Password provider
- **Token invalidation**: Old tokens are invalidated when requesting a new reset
- **Rate limiting**: Built-in protection against abuse
- **Automatic cleanup**: Expired tokens are automatically removed daily
- **Data preservation**: All user data (clients, notes, todos) is preserved during password reset
- **Credential isolation**: Only password credentials are updated, user account remains intact

## For Development

### Testing the Reset Flow

1. Start your development server: `npm run dev`
2. Navigate to the sign-in page
3. Create an account with email/password if you haven't already
4. Add some clients to your account
5. Click "Forgot your password?"
6. Enter the email address you used to create the account
7. Check your Convex dashboard logs for the reset token and link
8. Copy the link and open it in your browser
9. Enter a new password (minimum 8 characters)
10. Confirm the password and submit
11. You'll be automatically signed in with your new password
12. **Verify that all your clients are still there!**

### Console Output

During development, you'll see output like this in your Convex dashboard logs:

```
Password reset token for user@example.com: 550e8400-e29b-41d4-a716-446655440000
Reset link: http://localhost:5173/?token=550e8400-e29b-41d4-a716-446655440000
```

## Implementation Details

### Database Schema

The password reset functionality adds a new table:

```typescript
passwordResetTokens: defineTable({
  email: v.string(),
  token: v.string(),
  expiresAt: v.number(),
  used: v.boolean(),
})
  .index("by_email", ["email"])
  .index("by_token", ["token"])
  .index("by_expiration", ["expiresAt"])
```

### API Functions

#### Mutations

- **`requestPasswordReset`**: Generates reset token and logs reset link
- **`resetPassword`**: Validates token and prepares for credential update
- **`completePasswordReset`**: Finalizes the password reset and cleans up old credentials

#### Queries

- **`verifyResetToken`**: Checks if a reset token is valid and returns associated email

### Reset Process

1. **Token Generation**: Uses `crypto.randomUUID()` for secure token generation
2. **Credential Update**: Creates new password credentials while preserving user account
3. **Data Preservation**: All client relationships, notes, todos remain intact
4. **Cleanup**: Old password credentials are removed after successful reset
5. **Automatic Sign-in**: User is immediately signed in after successful reset

## Data Preservation Guarantee

**Your data is safe!** The password reset process:

- ✅ **Preserves your user account** - Your user ID remains the same
- ✅ **Preserves all clients** - All client assignments remain intact
- ✅ **Preserves all notes** - All client notes are maintained
- ✅ **Preserves all todos** - All tasks and due dates are kept
- ✅ **Preserves all relationships** - Case manager-client relationships are maintained
- ✅ **Only updates password** - Only your login credentials are changed

## For Production

### Email Integration

In a production environment, replace the console logging with actual email sending:

#### Resend Integration
```bash
npm install resend
```

Add to your `.env.local`:
```
RESEND_API_KEY=your_api_key_here
```

Update the `requestPasswordReset` function in `convex/auth.ts`:
```typescript
// Replace the console.log lines with:
const { Resend } = await import('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: args.email,
  subject: 'Reset Your HCS Password',
  html: `
    <h2>Reset Your Password</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${process.env.CONVEX_SITE_URL}/?token=${token}">Reset Password</a>
    <p>This link will expire in 24 hours.</p>
    <p><strong>Don't worry:</strong> Your clients and case data will be preserved.</p>
    <p>If you didn't request this reset, please ignore this email.</p>
  `
});
```

### Environment Variables

Set these in production:
- `CONVEX_SITE_URL`: Your app's URL (e.g., https://yourdomain.com)
- Email service API keys

## Security Considerations

1. **Data Integrity**: User data and relationships are preserved throughout the reset process
2. **HTTPS Required**: Always use HTTPS in production
3. **Rate Limiting**: Consider implementing additional rate limiting for reset requests
4. **Audit Logging**: Consider logging password reset attempts
5. **Password Policy**: Enforce strong password requirements (currently 8+ characters)
6. **Token Security**: Tokens are cryptographically secure UUIDs
7. **Credential Isolation**: Only password credentials are affected, never user data

## Troubleshooting

### Common Issues

1. **Token not found**: Token may have expired or been used
2. **Invalid email**: Email address doesn't exist in the system
3. **Password requirements**: Ensure password meets minimum requirements
4. **Console not showing token**: Check Convex dashboard logs instead
5. **Data missing after reset**: This should no longer happen with the new implementation!

### Error Messages

- "Invalid or expired reset token": Token is no longer valid
- "Account not found": Email doesn't exist in the system
- "Passwords do not match": Password confirmation doesn't match
- "Password must be at least 8 characters long": Password too short

### If You Lost Data

If you performed a password reset before this fix and lost your clients:

1. The clients are still in the database but not associated with your new user account
2. Contact your system administrator - they can potentially restore the client associations
3. The fix prevents this issue going forward

## Cleanup

The system automatically cleans up expired tokens daily via a cron job:

```typescript
// Clean up expired tokens daily
crons.interval("cleanup expired password reset tokens", { hours: 24 }, internal.crons.cleanupExpiredTokens, {});
```

## Next Steps

Consider implementing these additional features:

1. **Email templates**: Professional-looking email designs
2. **Multi-factor authentication**: Additional security layer
3. **Password history**: Prevent reusing recent passwords
4. **Account recovery questions**: Alternative recovery method
5. **Admin password reset**: Allow admins to reset user passwords
6. **Password strength meter**: Real-time password strength feedback
7. **Rate limiting**: Implement rate limiting on reset requests
8. **Audit logs**: Track password reset activities 