# Resource API Documentation

## Create Resource

API endpoint: POST /api/v1/resource/create

Requires: Valid JWT token in Authorization header (Bearer token)

Only ORG_ADMIN can create resources.

Input:
```json
{
    "name": "Conference Room A",
    "type": "MEETING_ROOM",
    "organization_id": "organization_id_here",
    "bufferTimeMinutes": 15
}
```

Expected output (success):
```json
{
    "success": true,
    "data": {
        "resource": {
            "id": "resource_id_here",
            "name": "Conference Room A",
            "type": "MEETING_ROOM",
            "organization_id": "organization_id_here",
            "bufferTimeMinutes": 15,
            "isDeleted": false,
            "createdBy": "user_id_here"
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

## Get Organization Resources

API endpoint: GET /api/v1/resource/:organizationId

Requires: Valid JWT token in Authorization header (Bearer token)

All organization members can view resources.

Input: Path parameter (organizationId)

Expected output (success):
```json
{
    "success": true,
    "data": {
        "resources": [
            {
                "id": "resource_id_here",
                "name": "Conference Room A",
                "type": "MEETING_ROOM",
                "organization_id": "organization_id_here",
                "bufferTimeMinutes": 15,
                "isDeleted": false,
                "createdBy": "user_id_here"
            }
        ]
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

## Soft Delete Resource

API endpoint: DELETE /api/v1/resource/:resourceId

Requires: Valid JWT token in Authorization header (Bearer token)

Only ORG_ADMIN can delete resources.

Input: Path parameter (resourceId)

Expected output (success):
```json
{
    "success": true,
    "data": {
        "resource": {
            "id": "resource_id_here",
            "name": "Conference Room A",
            "type": "MEETING_ROOM",
            "organization_id": "organization_id_here",
            "bufferTimeMinutes": 15,
            "isDeleted": true,
            "createdBy": "user_id_here"
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
- Resource names must be unique within the same organization
- bufferTimeMinutes is the gap time after each booking ends (default 0)
- Resources are soft deleted, never actually removed from the database
- All queries automatically filter out soft-deleted resources (isDeleted: false)
