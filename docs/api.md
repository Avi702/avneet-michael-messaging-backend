# API (HTTP)

The HTTP API allows acccess to persistent storage.

This file contains a route listing and specification for each route.

Note that this is an actions-based API, and all requests use POST.

## Common Patterns

### Routes Tables

The URL column is always the URL relative to that module's base URL.

The purpose is a friendly description of the route.

The auth column is checked (✅) if the user must be logged in (valid `accessToken`) to use the route. In specific documentation, endpoints that require authentication are marked with a 🔒.

### Errors

If the request body does not match the given pattern, the server will return a `BadRequestError` (status `400`, code `BAD_REQUEST`).

If the request is not authenticated but should be, the server will return an `UnauthorizedError` (status `401`, code `UNAUTHORIZED` or `INVALID_TOKEN`). If the client should receive `INVALID_TOKEN`, the client should refresh if possible using `refresh`, or log in again using `login`.

If the request is not authorized, i.e., the user is logged in correctly but does not have permission to use the endpoint in the way specified, the server will return a generic `UnauthorizedError` (status `401`, code `UNAUTHORIZED`). This is intentional business logic and cannot be circumvented.

The format of errors returned by the server is:
```js
{
    error: {
        code: string,
        message: string,
    }
}
```

In the event of a generic server error, the server will return `500` with code `INTERNAL_SERVER_ERROR`.

## Authentication

Authentication routes allow users to perform functions related to account management and tokens.

Base URL: `/api/v1/authentication`

### Routes
| URL | Purpose | Auth |
| --- | --- | --- |
| login | Creates authentication and refresh tokens from an email and password | ❌ |
| register | Registers a new user account | ❌ |
| authenticate | Pulls the user information for the logged in user | ✅ |
| refresh | Gets a new access token from a refresh token | ❌ |
| updatePassword | Updates the logged in user's pasword | ✅ |

### Login

#### Body
```js
{
    email: string,
    password: string,
}
```
- Email must be a valid email.
- Password must be between 8 and 64 characters (inclusive).

#### Responses
If successful:
```js
{
    accessToken: string,
    refreshToken: string,
    user: PublicUser        // see src/users/User.types.ts
}
```
Failures may return:
| Error | Status | Code | Reason |
| --- | --- | --- | --- |
| UserNotFound | 404 | USER_NOT_FOUND | The user account with that email was not found |
| PasswordIncorrect | 401 | PASSWORD_INCORRECT | The password supplied was incorrect |

### Register

#### Body
```js
{
    // see users/dto/CreateUserDto.ts for more information
    email: string,
    password: string,
    birthDate: string, // YYYY-MM-DD
    displayName: string
}
```
- Email must be a valid email.
- Password must be between 8 and 64 characters (inclusive).
- Birth date must be in format `YYYY-MM-DD`.
- Display name must be between 3 and 64 characters (inclusive).

#### Responses
If successful:
```js
{
    // see src/user/User.types.ts for more information; this is a PublicUser
    _id: string,
    createdAt: Date,
    displayName: string,
    lastOnline: Date,
    isOnline: boolean
}
```
Failures may return:
| Error | Status | Code | Reason |
| --- | --- | --- | --- |
| UserNotOldEnough | 400 | USER_NOT_OLD_ENOUGH | User is not at least `UserService.MINIMUM_AGE` years old |
| UserAlreadyExists | 409 | USER_ALREADY_EXISTS | User with email already exists |

### Authenticate

#### Body
```js
{
    accessToken: string     // valid JWT
}
```
- Access token must be a valid JWT

#### Responses
If successful:
```js
{
    // see src/user/User.types.ts for more information; this is a PublicUser
    _id: string,
    createdAt: Date,
    displayName: string,
    lastOnline: Date,
    isOnline: boolean
}
```
Failures may return:
| Error | Status | Code | Reason |
| --- | --- | --- | --- |
| InvalidToken | 401 | INVALID_TOKEN | Token is expired or corrupted |
| UserNotFound | 404 | USER_NOT_FOUND | User with ID specified by token not found |

### Refresh

#### Body
```js
{
    refreshToken: string     // valid JWT
}
```
- Refresh token must be a valid JWT

#### Responses
If successful:
```js
{
    accessToken: string,
    refreshToken: string
}
```
Failures may return:
| Error | Status | Code | Reason |
| --- | --- | --- | --- |
| InvalidToken | 401 | INVALID_TOKEN | Token is expired or corrupted |
| UserNotFound | 404 | USER_NOT_FOUND | User with ID specified by token not found |

### Update Password 🔒

#### Body
```js
{
    password: string
}
```
- Password must be between 8 and 64 characters (inclusive).

#### Responses
If successful:
```js
{
    success: boolean
}
```
There should be no failures for this route, unless the user is not authenticated.

