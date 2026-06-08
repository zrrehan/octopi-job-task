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

## Notes:
- When a user creates an organization, they are automatically added as the ORG_ADMIN in the members array
- Organization has admin_id which is the ID of the user who created it
- Roles are per-organization, so a user can be EMPLOYEE in one organization and ORG_ADMIN in another
- All fields except "name" are optional and have default values
