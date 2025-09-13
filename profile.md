# User Profile Management API

**Auth**: Bearer token required for all endpoints  
**Base URL**: `https://demoapi.whyxpose.com/api/v2`  
**Content-Type**: `application/json` (except file uploads)

## Overview

The User Profile Management API provides comprehensive functionality for users to manage their personal profiles, including profile information updates, password changes, and Two-Factor Authentication (2FA) setup and management.

## Profile Information

### Get Current User Profile
- **Endpoint**: `GET /api/v2/user/profile`
- **Description**: Retrieve the current user's profile information including permissions and company details
- **Response 200**:
  ```json
  {
    "success": true,
    "user": {
      "id": 49,
      "name": "John Smith",
      "email": "john.smith@company.com",
      "role": "admin",
      "company_id": 1,
      "company_name": "TechCorp Security",
      "avatar": null,
      "is_2fa_enabled": false,
      "is_email_verified": true,
      "permissions": [
        "bugs.view_all",
        "bugs.create",
        "bugs.edit",
        "bugs.delete",
        "team.invite",
        "team.edit_roles"
      ]
    }
  }
  ```

Example:
```bash
curl -X GET "https://demoapi.whyxpose.com/api/v2/user/profile" \
  -H "Authorization: Bearer <TOKEN>"
```

### Update User Profile
- **Endpoint**: `PUT /api/v2/user/profile`
- **Description**: Update user's name and email address
- **Body**:
  ```json
  {
    "name": "John Smith",
    "email": "john.smith@company.com"
  }
  ```
- **Validation Rules**:
  - `name`: Required, max 100 characters
  - `email`: Required, valid email format, must be unique
- **Response 200**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully"
  }
  ```
- **Response 400** (Validation Error):
  ```json
  {
    "error": "Validation failed",
    "details": {
      "email": "Email already taken"
    }
  }
  ```

Example:
```bash
curl -X PUT "https://demoapi.whyxpose.com/api/v2/user/profile" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john.smith@company.com"
  }'
```

## Password Management

### Change Password
- **Endpoint**: `POST /api/v2/user/change-password`
- **Description**: Change user's password with current password verification
- **Body**:
  ```json
  {
    "current_password": "oldPassword123!",
    "new_password": "newPassword456!",
    "confirm_password": "newPassword456!"
  }
  ```
- **Validation Rules**:
  - `current_password`: Required
  - `new_password`: Required, must contain:
    - At least 8 characters (max 25)
    - At least one digit
    - At least one lowercase letter
    - At least one uppercase letter
    - At least one special character
  - `confirm_password`: Required, must match new_password
- **Response 200**:
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```
- **Response 400** (Current Password Incorrect):
  ```json
  {
    "error": "Current password is incorrect"
  }
  ```
- **Response 400** (Validation Error):
  ```json
  {
    "error": "Validation failed",
    "details": {
      "new_password": "The New Password field must contain at least one digit, one lowercase letter, one uppercase letter, and one special character."
    }
  }
  ```

Example:
```bash
curl -X POST "https://demoapi.whyxpose.com/api/v2/user/change-password" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "oldPassword123!",
    "new_password": "newPassword456!",
    "confirm_password": "newPassword456!"
  }'
```

## Two-Factor Authentication (2FA)

### Setup 2FA
- **Endpoint**: `POST /api/v2/user/setup-2fa`
- **Description**: Generate secret key for 2FA setup (frontend generates QR code locally for security)
- **Response 200**:
  ```json
  {
    "success": true,
    "data": {
      "secret_key": "JBSWY3DPEHPK3PXP",
      "issuer": "WhyXpose",
      "account_name": "user@example.com",
      "message": "Use the secret key to generate QR code in your frontend, then verify with the verify-2fa-setup endpoint"
    }
  }
  ```

Example:
```bash
curl -X POST "https://demoapi.whyxpose.com/api/v2/user/setup-2fa" \
  -H "Authorization: Bearer <TOKEN>"
```

### Verify 2FA Setup
- **Endpoint**: `POST /api/v2/user/verify-2fa-setup`
- **Description**: Verify OTP code and enable 2FA
- **Body**:
  ```json
  {
    "otp": "123456"
  }
  ```
- **Validation Rules**:
  - `otp`: Required, exactly 6 digits
- **Response 200**:
  ```json
  {
    "success": true,
    "message": "2FA enabled successfully"
  }
  ```
- **Response 400** (Invalid OTP):
  ```json
  {
    "error": "Invalid OTP code"
  }
  ```

Example:
```bash
curl -X POST "https://demoapi.whyxpose.com/api/v2/user/verify-2fa-setup" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "123456"
  }'
```

### Disable 2FA
- **Endpoint**: `POST /api/v2/user/disable-2fa`
- **Description**: Disable 2FA with OTP verification
- **Body**:
  ```json
  {
    "otp": "123456"
  }
  ```
- **Validation Rules**:
  - `otp`: Required, exactly 6 digits
- **Response 200**:
  ```json
  {
    "success": true,
    "message": "2FA disabled successfully"
  }
  ```
- **Response 400** (Invalid OTP):
  ```json
  {
    "error": "Invalid OTP code"
  }
  ```

Example:
```bash
curl -X POST "https://demoapi.whyxpose.com/api/v2/user/disable-2fa" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "123456"
  }'
```

## 2FA Workflow

### Complete 2FA Setup Process

1. **Generate Secret Key**:
   ```bash
   curl -X POST "https://demoapi.whyxpose.com/api/v2/user/setup-2fa" \
     -H "Authorization: Bearer <TOKEN>"
   ```

2. **Generate QR Code in Frontend**: Use the secret key to generate QR code locally
   ```javascript
   // Example using qrcode library
   import QRCode from 'qrcode';
   
   const generateQRCode = async (secretKey, accountName, issuer) => {
     const otpAuthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secretKey}&issuer=${issuer}`;
     const qrCodeDataURL = await QRCode.toDataURL(otpAuthUrl);
     return qrCodeDataURL;
   };
   ```

3. **Scan QR Code**: Use Google Authenticator or similar app to scan the locally generated QR code

4. **Verify Setup**: Enter the 6-digit code from your authenticator app
   ```bash
   curl -X POST "https://demoapi.whyxpose.com/api/v2/user/verify-2fa-setup" \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"otp": "123456"}'
   ```

5. **Verify 2FA is Enabled**: Check profile to confirm 2FA status
   ```bash
   curl -X GET "https://demoapi.whyxpose.com/api/v2/user/profile" \
     -H "Authorization: Bearer <TOKEN>"
   ```

### Disable 2FA Process

1. **Disable with OTP**: Enter current OTP code to disable
   ```bash
   curl -X POST "https://demoapi.whyxpose.com/api/v2/user/disable-2fa" \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"otp": "123456"}'
   ```

## Error Responses

### Common Error Codes

- **401 Unauthorized**: Invalid or missing Bearer token
- **400 Bad Request**: Validation errors or invalid input
- **405 Method Not Allowed**: Wrong HTTP method used
- **500 Internal Server Error**: Server-side error

### Error Response Format
```json
{
  "error": "Error message",
  "details": {
    "field_name": "Specific field error message"
  }
}
```

## Security Notes

### Password Requirements
- Minimum 8 characters, maximum 25 characters
- Must contain at least one digit (0-9)
- Must contain at least one lowercase letter (a-z)
- Must contain at least one uppercase letter (A-Z)
- Must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

### 2FA Security
- Uses TOTP (Time-based One-Time Password) standard
- Compatible with Google Authenticator, Authy, and similar apps
- Secret keys are stored securely in the database
- OTP codes expire after 30 seconds
- Backup codes are not currently implemented

### Session Management
- JWT tokens are used for authentication
- Tokens should be stored securely on the client side
- Consider implementing token refresh for long-lived sessions

## Integration Examples

### Frontend Integration (JavaScript)

```javascript
// Get user profile
async function getUserProfile() {
  const response = await fetch('/api/v2/user/profile', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return await response.json();
}

// Update profile
async function updateProfile(name, email) {
  const response = await fetch('/api/v2/user/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email })
  });
  return await response.json();
}

// Change password
async function changePassword(currentPassword, newPassword, confirmPassword) {
  const response = await fetch('/api/v2/user/change-password', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    })
  });
  return await response.json();
}

// Setup 2FA
async function setup2FA() {
  const response = await fetch('/api/v2/user/setup-2fa', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return await response.json();
}

// Generate QR Code locally (secure)
import QRCode from 'qrcode';

async function generateQRCode(secretKey, accountName, issuer) {
  const otpAuthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secretKey}&issuer=${issuer}`;
  const qrCodeDataURL = await QRCode.toDataURL(otpAuthUrl, {
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
  return qrCodeDataURL;
}

// Complete 2FA setup flow
async function setup2FAFlow() {
  try {
    // 1. Get secret key from API
    const setupResponse = await setup2FA();
    if (!setupResponse.success) {
      throw new Error(setupResponse.error);
    }

    const { secret_key, account_name, issuer } = setupResponse.data;
    
    // 2. Generate QR code locally
    const qrCodeDataURL = await generateQRCode(secret_key, account_name, issuer);
    
    // 3. Display QR code to user
    const qrCodeImg = document.getElementById('qr-code');
    qrCodeImg.src = qrCodeDataURL;
    
    return { secret_key, qrCodeDataURL };
  } catch (error) {
    console.error('2FA setup failed:', error);
    throw error;
  }
}
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

function useUserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/v2/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    const response = await fetch('/api/v2/user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    const data = await response.json();
    if (data.success) {
      await fetchProfile(); // Refresh profile
    }
    return data;
  };

  return { profile, loading, updateProfile, refreshProfile: fetchProfile };
}
```

## Testing

### Test 2FA Setup
```bash
# 1. Setup 2FA
curl -X POST "https://demoapi.whyxpose.com/api/v2/user/setup-2fa" \
  -H "Authorization: Bearer <TOKEN>"

# 2. Use any 6-digit number for testing (e.g., 123456)
curl -X POST "https://demoapi.whyxpose.com/api/v2/user/verify-2fa-setup" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"otp": "123456"}'

# 3. Verify 2FA is enabled
curl -X GET "https://demoapi.whyxpose.com/api/v2/user/profile" \
  -H "Authorization: Bearer <TOKEN>"
```

### Test Password Change
```bash
curl -X POST "https://demoapi.whyxpose.com/api/v2/user/change-password" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "currentPassword123!",
    "new_password": "newPassword456!",
    "confirm_password": "newPassword456!"
  }'
```

## Notes

- All endpoints require valid JWT authentication
- Profile updates are immediate and don't require email verification
- 2FA setup is currently in testing mode (accepts any 6-digit code)
- Password changes immediately invalidate all existing sessions
- Email changes should trigger verification in production environments
- Consider implementing rate limiting for password change attempts
