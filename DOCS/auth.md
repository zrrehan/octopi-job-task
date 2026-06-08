# Auth API Documentation

## 1. Signup (Register New User)

API endpoint: POST /api/v1/auth/signup

Input:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890"
}
```

Expected output (success):
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "user-id-here",
            "name": "John Doe",
            "email": "john@example.com"
        },
        "token": "jwt-token-here"
    }
}
```

Expected output (email already exists):
```json
{
    "success": false,
    "message": "Email already exists"
}
```

Expected output (validation error):
```json
{
    "success": false,
    "message": "Password must be at least 6 characters long"
}
```

---

## 2. Signin (Login User)

API endpoint: POST /api/v1/auth/signin

Input:
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

Expected output (success):
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "user-id-here",
            "name": "John Doe",
            "email": "john@example.com"
        },
        "token": "jwt-token-here"
    }
}
```

Expected output (email didn't match):
```json
{
    "success": false,
    "message": "Email didn't match"
}
```

Expected output (wrong password):
```json
{
    "success": false,
    "message": "Wrong password"
}
```

Expected output (validation error):
```json
{
    "success": false,
    "message": "Email or Password Did not match"
}
```

---

## 3. Middleware Usage

### Auth Middleware
Used to verify JWT tokens and attach user information to `req.user`
```typescript
import { auth } from "./middleware/auth";
app.get("/protected-route", auth, (req, res) => {
  // req.user contains userId and email
});
```
