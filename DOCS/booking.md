# Booking API Documentation

## Get Availability

API endpoint: GET /api/v1/booking/availability

Query Parameters (all required):
- resource_id: Resource ID to check availability for
- date: Date in YYYY-MM-DD format to check availability on
- duration: Booking duration in minutes

Expected success response:
```json
{
  "success": true,
  "data": [
    {
      "start": "09:00",
      "end": "10:00",
      "available": true
    }
  ]
}
```

## Create Booking

API endpoint: POST /api/v1/booking/book

Requires: Valid JWT token in Authorization header (Bearer token)

Body Parameters (all required):
- resource_id: Resource ID to book
- date: Date in YYYY-MM-DD format to book on
- start_time: Start time in HH:MM format
- duration_minutes: Booking duration in minutes

Expected success response:
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking-id-here",
      "resource_id": "resource-id-here",
      "organization_id": "organization-id-here",
      "user_id": "user-id-here",
      "start_time": "2026-06-08T13:00:00.000Z",
      "end_time": "2026-06-08T14:00:00.000Z",
      "status": "CONFIRMED"
    }
  }
}
```

## Get My Bookings

API endpoint: GET /api/v1/booking/my-bookings

Requires: Valid JWT token in Authorization header (Bearer token)

Expected success response:
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking-id-here",
        "resource_id": "resource-id-here",
        "organization_id": "organization-id-here",
        "user_id": "user-id-here",
        "start_time": "2026-06-08T13:00:00.000Z",
        "end_time": "2026-06-08T14:00:00.000Z",
        "status": "CONFIRMED"
      }
    ]
  }
}
```

## Cancel Booking

API endpoint: DELETE /api/v1/booking/:bookingId

Requires: Valid JWT token in Authorization header (Bearer token)

Path parameter:
- bookingId: ID of booking to cancel

Expected success response:
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking-id-here",
      "resource_id": "resource-id-here",
      "organization_id": "organization-id-here",
      "user_id": "user-id-here",
      "start_time": "2026-06-08T13:00:00.000Z",
      "end_time": "2026-06-08T14:00:00.000Z",
      "status": "CANCELLED"
    }
  }
}
```
