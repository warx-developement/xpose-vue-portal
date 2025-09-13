# WhyXpose API v2 Documentation

## Base URL
```
http://demoapi.whyxpose.com/api/v2
```

## Authentication
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents
1. [System & Health Endpoints](#1-system--health-endpoints)
2. [Authentication Endpoints](#2-authentication-endpoints)
3. [User Management Endpoints](#3-user-management-endpoints)
4. [Reports Endpoints](#4-reports-endpoints)
5. [Bugs Endpoints](#5-bugs-endpoints)
6. [Comments Endpoints](#6-comments-endpoints)
7. [Dashboard Endpoints](#7-dashboard-endpoints)
8. [Role Management Endpoints](#8-role-management-endpoints)
9. [PDF Generation Endpoints](#9-pdf-generation-endpoints)
10. [SuperAdmin Endpoints](#10-superadmin-endpoints)

---

## 1. System & Health Endpoints

### Health Check
```http
GET /api/v2/health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-08 13:08:10",
  "version": "2.0.0"
}
```

### Generate UUID
```http
GET /api/v2/uuid
```
**Response:**
```json
{
  "uuid": "f9140954-391b-4027-8941-bbc8cf9b3f04"
}
```

### Current Time
```http
GET /api/v2/time
```
**Response:**
```json
{
  "timestamp": "2025-09-08 13:08:10",
  "unix": 1757411290
}
```

### Validate Token
```http
GET /api/v2/validate-token
Authorization: Bearer <token>
```
**Response:**
```json
{
  "valid": true,
  "user_id": 49,
  "expires_at": "2025-09-08 15:08:10"
}
```

### API Documentation
```http
GET /api/v2/docs
```
**Response:**
```json
{
  "title": "WhyXpose API v2",
  "version": "2.0.0",
  "endpoints": {
    "authentication": [...],
    "reports": [...],
    "bugs": [...]
  }
}
```

---

## 2. Authentication Endpoints

### Login
```http
POST /api/v2/auth/login
Content-Type: application/json

{
  "email": "john.smith@techcorp.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 49,
    "name": "John Smith",
    "email": "john.smith@techcorp.com",
    "role": "admin",
    "company_id": 1
  }
}
```

### Logout
```http
POST /api/v2/auth/logout
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Forgot Password
```http
POST /api/v2/auth/forgot-password
Content-Type: application/json

{
  "email": "john.smith@techcorp.com"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password
```http
POST /api/v2/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "password": "new_password123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Verify Email
```http
POST /api/v2/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_here"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Get User Companies
```http
GET /api/v2/auth/companies
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "companies": [
    {
      "id": 1,
      "name": "TechCorp Solutions",
      "uuid": "company-uuid-here",
      "is_primary": true
    }
  ]
}
```

### Switch Company
```http
POST /api/v2/auth/switch-company
Authorization: Bearer <token>
Content-Type: application/json

{
  "company_id": 1
}
```
**Response:**
```json
{
  "success": true,
  "message": "Company switched successfully"
}
```

---

## 3. User Management Endpoints

### Get User Profile
```http
GET /api/v2/user/profile
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "user": {
    "id": 49,
    "name": "John Smith",
    "email": "john.smith@techcorp.com",
    "role": "admin",
    "company_id": 1,
    "company_name": "TechCorp Solutions",
    "avatar": null,
    "is_2fa_enabled": false,
    "is_email_verified": true,
    "permissions": [
      "reports.create",
      "reports.view_all",
      "reports.view_own",
      "reports.edit_all",
      "reports.edit_own",
      "reports.edit_assigned",
      "reports.delete",
      "reports.manage_access",
      "bugs.create",
      "bugs.view_all",
      "bugs.view_own",
      "bugs.view_report",
      "bugs.edit_all",
      "bugs.edit_own",
      "bugs.edit_report",
      "bugs.delete",
      "bugs.change_status",
      "comments.create",
      "comments.view_all",
      "comments.view_own",
      "comments.view_report",
      "comments.edit_own",
      "comments.delete_own",
      "comments.delete_all",
      "attachments.upload",
      "attachments.view_all",
      "attachments.view_own",
      "attachments.view_report",
      "attachments.delete",
      "team.view",
      "team.invite",
      "team.edit_roles",
      "team.remove",
      "team.manage_access",
      "analytics.view",
      "analytics.export",
      "settings.view",
      "settings.edit",
      "reports.generate_pdf"
    ]
  }
}
```

### Change Password
```http
POST /api/v2/user/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "old_password",
  "new_password": "new_password123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Setup 2FA
```http
POST /api/v2/user/setup-2fa
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "secret": "JBSWY3DPEHPK3PXP"
}
```

### Verify 2FA Setup
```http
POST /api/v2/user/verify-2fa-setup
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "123456"
}
```
**Response:**
```json
{
  "success": true,
  "message": "2FA enabled successfully"
}
```

### Disable 2FA
```http
POST /api/v2/user/disable-2fa
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "current_password"
}
```
**Response:**
```json
{
  "success": true,
  "message": "2FA disabled successfully"
}
```

---

## 4. Reports Endpoints

### Get All Reports
```http
GET /api/v2/reports
Authorization: Bearer <token>
```
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term
- `sort_by` (optional): Sort field (default: create_at)
- `sort_order` (optional): Sort direction (default: desc)
- `X-Company-ID` (header, optional): Company UUID to filter by

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "report_id": "f9140954-391b-4027-8941-bbc8cf9b3f04",
      "name": "Q1 Security Assessment",
      "scope": "Web application security testing",
      "created_by": "John Smith",
      "created_at": "2025-09-07 10:52:40",
      "access": [
        {
          "id": 49,
          "name": "John Smith",
          "email": "john.smith@techcorp.com",
          "avatar": null
        }
      ],
      "bugs_count": {
        "Critical": 2,
        "High": 5,
        "Medium": 8,
        "Low": 3,
        "Info": 1,
        "total": 19,
        "resolved": 5
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 1,
    "total_pages": 1
  }
}
```

### Create Report
```http
POST /api/v2/reports/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Q1 Security Assessment",
  "scope": "Web application security testing",
  "access": [49, 50, 51]
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "report_id": "f9140954-391b-4027-8941-bbc8cf9b3f04"
  },
  "message": "Report created successfully"
}
```

### Get Report Details
```http
GET /api/v2/reports/{id}
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "report_id": "f9140954-391b-4027-8941-bbc8cf9b3f04",
    "name": "Q1 Security Assessment",
    "scope": "Web application security testing",
    "created_by": "John Smith",
    "created_at": "2025-09-07 10:52:40",
    "access": [
      {
        "id": 49,
        "name": "John Smith",
        "email": "john.smith@techcorp.com",
        "avatar": null
      }
    ],
    "security_grade": {
      "grade": "C",
      "description": "Some high severity vulnerabilities"
    },
    "vulnerabilities_summary": {
      "total": 19,
      "critical": 2,
      "high": 5,
      "medium": 8,
      "low": 3,
      "info": 1,
      "resolved": 5,
      "fixed_percentage": 26.3
    },
    "top_vulnerable_targets": [
      {
        "domain": "api.techcorp.com",
        "count": 8
      }
    ],
    "top_vulnerability_categories": [
      {
        "category": "Cross-Site Scripting (XSS)",
        "count": 5
      }
    ],
    "vulnerability_chart": [
      {
        "severity": "Critical",
        "count": 2,
        "color": "#dc3545"
      }
    ],
    "status_chart": [
      {
        "status": "Open",
        "count": 14,
        "color": "#dc3545"
      }
    ],
    "status_severity_matrix": {
      "Critical": {
        "Open": 2,
        "Pending": 0,
        "Accepted": 0,
        "Needs More Info": 0,
        "Retesting": 0,
        "Resolved": 0,
        "Won't Fix": 0,
        "Total": 2
      }
    },
    "recent_bugs": [
      {
        "id": 3,
        "title": "Cross-Site Scripting (XSS) in Contact Form",
        "domain": "contact.techcorp.com",
        "severity": "Medium",
        "status": "Open",
        "created_at": "2025-09-07 10:52:40"
      }
    ]
  }
}
```

### Update Report
```http
PUT /api/v2/reports/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Report Name",
  "scope": "Updated scope description"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Report updated successfully"
}
```

### Delete Report
```http
DELETE /api/v2/reports/{id}
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

### Add User Access to Report
```http
POST /api/v2/reports/{id}/access
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 50
}
```
**Response:**
```json
{
  "success": true,
  "message": "User access added successfully"
}
```

### Remove User Access from Report
```http
DELETE /api/v2/reports/{id}/access/{user_id}
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "User access removed successfully"
}
```

---

## 5. Bugs Endpoints

### Get Bugs for Report
```http
GET /api/v2/reports/{report_id}/bugs
Authorization: Bearer <token>
```
**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `severity` (optional): Filter by severity
- `status` (optional): Filter by status
- `search` (optional): Search term

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "bug_id": "f9140954-391b-4027-8941-bbc8cf9b3f04",
      "title": "Cross-Site Scripting (XSS) in Contact Form",
      "domain": "contact.techcorp.com",
      "description": "The contact form is vulnerable to stored XSS attacks...",
      "poc": "1. Navigate to contact.techcorp.com\n2. Enter name: <script>alert('XSS')</script>...",
      "fix": "1. Implement proper input validation...",
      "severity": {
        "label": "Medium",
        "color": "warning",
        "value": 2
      },
      "status": {
        "label": "Open",
        "color": "primary",
        "value": 0
      },
      "type": {
        "id": 2,
        "name": "Cross-Site Scripting (XSS)"
      },
      "created_by": "John Smith",
      "created_at": "2025-09-07 10:52:40",
      "updated_at": "2025-09-07 12:52:40",
      "use_cvss": false,
      "cvss": null
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 1,
    "total_pages": 1
  }
}
```

### Create Bug
```http
POST /api/v2/reports/{report_id}/bugs/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "SQL Injection in Login Form",
  "domain": "login.techcorp.com",
  "description": "The login form is vulnerable to SQL injection attacks...",
  "poc": "1. Navigate to login.techcorp.com\n2. Enter username: admin' OR '1'='1...",
  "fix": "1. Use parameterized queries...",
  "severity": 3,
  "type": 1,
  "use_cvss": true,
  "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
  "cvss_score": 9.8,
  "cvss_severity": "Critical"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "bug_id": "new-bug-uuid-here"
  },
  "message": "Bug created successfully"
}
```

### Get Bug Details
```http
GET /api/v2/bugs/{id}
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "bug_id": "f9140954-391b-4027-8941-bbc8cf9b3f04",
    "title": "Cross-Site Scripting (XSS) in Contact Form",
    "domain": "contact.techcorp.com",
    "description": "The contact form at contact.techcorp.com is vulnerable to stored XSS attacks...",
    "poc": "1. Navigate to contact.techcorp.com\n2. Enter name: <script>alert('XSS')</script>...",
    "fix": "1. Implement proper input validation and sanitization...",
    "severity": {
      "label": "Medium",
      "color": "warning",
      "value": 2
    },
    "status": {
      "label": "Open",
      "color": "primary",
      "value": 0
    },
    "type": {
      "id": 2,
      "name": "Cross-Site Scripting (XSS)"
    },
    "created_by": "John Smith",
    "created_at": "2025-09-07 10:52:40",
    "updated_at": "2025-09-07 12:52:40",
    "use_cvss": false,
    "cvss": null,
    "comments": [
      {
        "id": 2,
        "comment": "Bug created",
        "user_name": "John Smith",
        "avatar": null,
        "is_const": true,
        "created_at": "2025-09-07 10:52:40"
      }
    ],
    "attachments": []
  }
}
```

### Update Bug Status
```http
POST /api/v2/bugs/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": 1
}
```
**Response:**
```json
{
  "success": true,
  "message": "Bug status updated successfully"
}
```

### Add Bug Attachment
```http
POST /api/v2/bugs/{id}/attachments
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [binary file data]
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "image_url": "signed-url-here"
  },
  "message": "Attachment uploaded successfully"
}
```

### Delete Bug Attachment
```http
DELETE /api/v2/bugs/{id}/attachments/{attachment_id}
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Attachment deleted successfully"
}
```

### Get Bug Types
```http
GET /api/v2/bugs/types
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "SQL Injection",
      "description": "SQL injection vulnerabilities"
    },
    {
      "id": 2,
      "name": "Cross-Site Scripting (XSS)",
      "description": "Cross-site scripting vulnerabilities"
    }
  ]
}
```

### Get CVSS Options
```http
GET /api/v2/bugs/cvss-options
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "attack_vector": [
      {"value": "N", "label": "Network"},
      {"value": "A", "label": "Adjacent Network"},
      {"value": "L", "label": "Local"},
      {"value": "P", "label": "Physical"}
    ],
    "attack_complexity": [
      {"value": "L", "label": "Low"},
      {"value": "H", "label": "High"}
    ]
  }
}
```

---

## 6. Comments Endpoints

### Get Bug Comments
```http
GET /api/v2/bugs/{bug_id}/comments
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "comment": "Bug created",
      "user_name": "John Smith",
      "avatar": null,
      "is_const": true,
      "created_at": "2025-09-07 10:52:40"
    }
  ]
}
```

### Create Comment
```http
POST /api/v2/bugs/{bug_id}/comments/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "comment": "This is a new comment on the bug"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 3
  },
  "message": "Comment created successfully"
}
```

### Update Comment
```http
PUT /api/v2/comments/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "comment": "Updated comment text"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Comment updated successfully"
}
```

### Add Comment Attachment
```http
POST /api/v2/comments/{id}/attachments
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [binary file data]
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "image_url": "signed-url-here"
  },
  "message": "Attachment uploaded successfully"
}
```

### Delete Comment Attachment
```http
DELETE /api/v2/comments/{id}/attachments/{attachment_id}
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Attachment deleted successfully"
}
```

---

## 7. Dashboard Endpoints

### Get Dashboard Data
```http
GET /api/v2/dashboard
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "reports_count": 5,
    "bugs_count": 19,
    "critical_bugs": 2,
    "high_bugs": 5,
    "resolved_bugs": 5,
    "recent_activity": [
      {
        "type": "bug_created",
        "description": "New bug created: SQL Injection in Login Form",
        "timestamp": "2025-09-08 10:30:00"
      }
    ]
  }
}
```

### Get Notifications
```http
GET /api/v2/dashboard/notifications
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "New Report Created",
      "description": "You have been added to the report: Q1 Security Assessment",
      "type": "report",
      "is_read": false,
      "created_at": "2025-09-08 10:30:00"
    }
  ]
}
```

### Mark Notification as Read
```http
POST /api/v2/dashboard/notifications/{id}/read
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Mark All Notifications as Read
```http
POST /api/v2/dashboard/notifications/read-all
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### Get Analytics
```http
GET /api/v2/dashboard/analytics
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "bugs_by_severity": {
      "Critical": 2,
      "High": 5,
      "Medium": 8,
      "Low": 3,
      "Info": 1
    },
    "bugs_by_status": {
      "Open": 14,
      "Pending": 2,
      "Resolved": 5
    },
    "bugs_over_time": [
      {
        "date": "2025-09-01",
        "count": 3
      }
    ]
  }
}
```

---

## 8. Role Management Endpoints

### Get All Permissions
```http
GET /api/v2/roles/permissions
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "module": "reports",
      "permissions": [
        {
          "slug": "reports.create",
          "name": "Create Reports",
          "description": "Create new security reports"
        }
      ]
    }
  ]
}
```

### Get Permissions by Module
```http
GET /api/v2/roles/permissions/{module}
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "slug": "reports.create",
      "name": "Create Reports",
      "description": "Create new security reports"
    }
  ]
}
```

### Get All Roles
```http
GET /api/v2/roles
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin",
      "description": "Full administrative access",
      "permissions": ["reports.create", "reports.view_all"]
    }
  ]
}
```

### Get Role Details
```http
GET /api/v2/roles/{id}
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin",
    "description": "Full administrative access",
    "permissions": ["reports.create", "reports.view_all"]
  }
}
```

### Create Role
```http
POST /api/v2/roles/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pentester",
  "description": "Security testing role",
  "permissions": ["reports.create", "bugs.create"]
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2
  },
  "message": "Role created successfully"
}
```

### Update Role
```http
PUT /api/v2/roles/{id}/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Role Name",
  "description": "Updated description",
  "permissions": ["reports.create", "reports.view_all"]
}
```
**Response:**
```json
{
  "success": true,
  "message": "Role updated successfully"
}
```

### Delete Role
```http
DELETE /api/v2/roles/{id}/delete
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

### Get User Roles
```http
GET /api/v2/roles/user/{user_id}
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin",
      "description": "Full administrative access"
    }
  ]
}
```

### Assign Roles to User
```http
POST /api/v2/roles/user/{user_id}/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "role_ids": [1, 2]
}
```
**Response:**
```json
{
  "success": true,
  "message": "Roles assigned successfully"
}
```

### Remove Role from User
```http
DELETE /api/v2/roles/user/{user_id}/role/{role_id}/remove
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Role removed successfully"
}
```

### Get User Permissions
```http
GET /api/v2/roles/user/{user_id}/permissions
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    "reports.create",
    "reports.view_all",
    "bugs.create"
  ]
}
```

### Check User Permission
```http
GET /api/v2/roles/user/{user_id}/permission/{permission}
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "has_permission": true
}
```

### Get My Permissions
```http
GET /api/v2/roles/my-permissions
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    "reports.create",
    "reports.view_all",
    "bugs.create"
  ]
}
```

### Get Admins
```http
GET /api/v2/roles/admins
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 49,
      "name": "John Smith",
      "email": "john.smith@techcorp.com"
    }
  ]
}
```

### Demote Admin
```http
POST /api/v2/roles/demote-admin/{user_id}
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Admin demoted successfully"
}
```

---

## 9. PDF Generation Endpoints

### Generate Report PDF
```http
POST /api/v2/reports/{report_id}/pdf/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "template": "standard",
  "include_comments": true,
  "include_attachments": false
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "pdf_id": 1,
    "status": "generating"
  },
  "message": "PDF generation started"
}
```

### Get PDF Status
```http
GET /api/v2/reports/{report_id}/pdf/{pdf_id}/status
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "completed",
    "progress": 100,
    "created_at": "2025-09-08 10:30:00"
  }
}
```

### Download PDF
```http
GET /api/v2/reports/{report_id}/pdf/{pdf_id}/download
Authorization: Bearer <token>
```
**Response:**
```
[Binary PDF file data]
```

### Delete PDF
```http
DELETE /api/v2/reports/{report_id}/pdf/{pdf_id}
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "PDF deleted successfully"
}
```

### List Report PDFs
```http
GET /api/v2/reports/{report_id}/pdf
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": "completed",
      "created_at": "2025-09-08 10:30:00",
      "file_size": 2048576
    }
  ]
}
```

---

## 10. SuperAdmin Endpoints

### SuperAdmin Login
```http
POST /api/v2/superadmin/login
Content-Type: application/json

{
  "email": "superadmin@whyxpose.com",
  "password": "superadmin_password"
}
```
**Response:**
```json
{
  "success": true,
  "token": "superadmin_jwt_token_here",
  "user": {
    "id": 1,
    "name": "Super Admin",
    "email": "superadmin@whyxpose.com",
    "role": "superadmin"
  }
}
```

### Get All Companies
```http
GET /api/v2/superadmin/companies
Authorization: Bearer <superadmin_token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "TechCorp Solutions",
      "uuid": "company-uuid-here",
      "created_at": "2025-09-01 10:00:00",
      "users_count": 5
    }
  ]
}
```

### Get Company Details
```http
GET /api/v2/superadmin/companies/{id}
Authorization: Bearer <superadmin_token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "TechCorp Solutions",
    "uuid": "company-uuid-here",
    "created_at": "2025-09-01 10:00:00",
    "users": [
      {
        "id": 49,
        "name": "John Smith",
        "email": "john.smith@techcorp.com",
        "role": "admin"
      }
    ]
  }
}
```

### Create Company
```http
POST /api/v2/superadmin/companies/create
Authorization: Bearer <superadmin_token>
Content-Type: application/json

{
  "name": "New Company",
  "description": "Company description"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "uuid": "new-company-uuid"
  },
  "message": "Company created successfully"
}
```

### Update Company
```http
PUT /api/v2/superadmin/companies/{id}/update
Authorization: Bearer <superadmin_token>
Content-Type: application/json

{
  "name": "Updated Company Name",
  "description": "Updated description"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Company updated successfully"
}
```

### Delete Company
```http
DELETE /api/v2/superadmin/companies/{id}/delete
Authorization: Bearer <superadmin_token>
```
**Response:**
```json
{
  "success": true,
  "message": "Company deleted successfully"
}
```

### Get All Users
```http
GET /api/v2/superadmin/users
Authorization: Bearer <superadmin_token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 49,
      "name": "John Smith",
      "email": "john.smith@techcorp.com",
      "role": "admin",
      "company_name": "TechCorp Solutions",
      "created_at": "2025-09-01 10:00:00"
    }
  ]
}
```

### Get User Details
```http
GET /api/v2/superadmin/users/{id}
Authorization: Bearer <superadmin_token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 49,
    "name": "John Smith",
    "email": "john.smith@techcorp.com",
    "role": "admin",
    "company_id": 1,
    "company_name": "TechCorp Solutions",
    "created_at": "2025-09-01 10:00:00"
  }
}
```

### Create User
```http
POST /api/v2/superadmin/users/create
Authorization: Bearer <superadmin_token>
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@techcorp.com",
  "password": "password123",
  "role": "pentester",
  "company_id": 1
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 50
  },
  "message": "User created successfully"
}
```

### Update User
```http
PUT /api/v2/superadmin/users/{id}/update
Authorization: Bearer <superadmin_token>
Content-Type: application/json

{
  "name": "Updated User Name",
  "email": "updated@techcorp.com",
  "role": "admin"
}
```
**Response:**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

### Delete User
```http
DELETE /api/v2/superadmin/users/{id}/delete
Authorization: Bearer <superadmin_token>
```
**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Get Analytics
```http
GET /api/v2/superadmin/analytics
Authorization: Bearer <superadmin_token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "total_companies": 5,
    "total_users": 25,
    "total_reports": 50,
    "total_bugs": 200,
    "companies": [
      {
        "id": 1,
        "name": "TechCorp Solutions",
        "users_count": 5,
        "reports_count": 10,
        "bugs_count": 40
      }
    ]
  }
}
```

### Get Company Analytics
```http
GET /api/v2/superadmin/analytics/company/{company_id}
Authorization: Bearer <superadmin_token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "company_name": "TechCorp Solutions",
    "users_count": 5,
    "reports_count": 10,
    "bugs_count": 40,
    "bugs_by_severity": {
      "Critical": 5,
      "High": 10,
      "Medium": 15,
      "Low": 8,
      "Info": 2
    }
  }
}
```

### Get System Logs
```http
GET /api/v2/superadmin/logs
Authorization: Bearer <superadmin_token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 49,
      "action": "login",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-09-08 10:30:00"
    }
  ]
}
```

### Get User Logs
```http
GET /api/v2/superadmin/logs/user/{user_id}
Authorization: Bearer <superadmin_token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "action": "login",
      "ip_address": "192.168.1.1",
      "created_at": "2025-09-08 10:30:00"
    }
  ]
}
```

### Add User to Company
```http
POST /api/v2/superadmin/users/{user_id}/companies/{company_id}
Authorization: Bearer <superadmin_token>
```
**Response:**
```json
{
  "success": true,
  "message": "User added to company successfully"
}
```

### Remove User from Company
```http
DELETE /api/v2/superadmin/users/{user_id}/companies/{company_id}/remove
Authorization: Bearer <superadmin_token>
```
**Response:**
```json
{
  "success": true,
  "message": "User removed from company successfully"
}
```

### Get User Companies
```http
GET /api/v2/superadmin/users/{user_id}/companies
Authorization: Bearer <superadmin_token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "TechCorp Solutions",
      "is_primary": true
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "email": "The email field is required"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **General endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 10 requests per minute per IP
- **File upload endpoints**: 20 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1757411290
```

---

## CORS Support

The API supports Cross-Origin Resource Sharing (CORS) for web applications:
- **Allowed Origins**: `*` (configurable)
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization, X-Requested-With, Accept, Referer, User-Agent
- **Credentials**: Supported

---

## WebSocket Support

Real-time notifications are available via WebSocket:
- **Endpoint**: `ws://demoapi.whyxpose.com/ws`
- **Authentication**: JWT token in query parameter
- **Events**: `bug_created`, `bug_updated`, `comment_added`, `notification_received`

---

## SDKs and Libraries

Official SDKs are available for:
- **JavaScript/Node.js**: `npm install whyxpose-api`
- **Python**: `pip install whyxpose-api`
- **PHP**: `composer require whyxpose/api-client`

---

## Support

For API support and questions:
- **Documentation**: [https://docs.whyxpose.com](https://docs.whyxpose.com)
- **Support Email**: support@whyxpose.com
- **GitHub Issues**: [https://github.com/whyxpose/api/issues](https://github.com/whyxpose/api/issues)
