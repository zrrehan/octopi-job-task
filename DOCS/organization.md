# Organization API Documentation

## Create Organization

API endpoint: POST /api/v1/organization/create

Requires: Valid JWT token in Authorization header (Bearer token)

Input:
```json
{
    "name": "My Company",
    "timezone": "UTC"
}
```
Examples of valid timezones:
- "UTC" (Coordinated Universal Time, default)
- "Asia/Dhaka" (UTC+6:00)
- "America/New_York" (UTC-5:00 / UTC-4:00 DST)
- "Europe/London" (UTC+0:00 / UTC+1:00 DST)

Expected output (success):
```json
{
    "success": true,
    "data": {
        "organization": {
            "id": "organization_id_here",
            "name": "My Company",
            "timezone": "UTC",
            "isActive": true,
            "admin_id": "user_id_here",
            "members": [
                {
                    "user_id": "user_id_here",
                    "role": "ORG_ADMIN"
                }
            ]
        }
    }
}
```

Expected output (error):
```json
{
    "success": false,
    "message": "Error message here"
}
```

## Add User to Organization

API endpoint: POST /api/v1/organization/add-user

Requires: Valid JWT token in Authorization header (Bearer token)

Input:
```json
{
    "organizationId": "organization_id_here",
    "userEmail": "employee@example.com"
}
```

Expected output (success):
```json
{
    "success": true,
    "data": {
        "organization": {
            "id": "organization_id_here",
            "name": "My Company",
            "timezone": "UTC",
            "isActive": true,
            "admin_id": "user_id_here",
            "members": [
                {
                    "user_id": "admin_user_id_here",
                    "role": "ORG_ADMIN"
                },
                {
                    "user_id": "employee_user_id_here",
                    "role": "EMPLOYEE"
                }
            ]
        }
    }
}
```

Expected output (error):
```json
{
    "success": false,
    "message": "Error message here"
}
```

## Notes:
- When a user creates an organization, they are automatically added as the ORG_ADMIN in the members array
- Organization has admin_id which is the ID of the user who created it
- Roles are per-organization, so a user can be EMPLOYEE in one organization and ORG_ADMIN in another
- All fields except "name" are optional and have default values
- Only the organization admin can add users to the organization
