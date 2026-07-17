# API (HTTP)

The HTTP API allows acccess to persistent storage.

This file contains a route listing and specification for each route.

Note that this is an actions-based API, and all requests use POST.

## Common Patterns

### Routes Tables

The URL column is always the URL relative to that module's base URL.

The purpose is a friendly description of the route.

The auth column is checked (✅) if the user must be logged in (valid `accessToken`) to use the route (the route is a locked route). In specific documentation, endpoints that require authentication are marked with a 🔒.

### Errors

These are the errors common to every route. Note that no error tables will display these errors in these cases, and that if a route says "this route has no errors" or something similar, these errors may still occur.

If the request body does not match the given pattern, the server will return a `BadRequestError` (status `400`, code `BAD_REQUEST`).

If the request is not authenticated but should be (attempting to use a locked route), the server will return an `UnauthorizedError` (status `401`, code `UNAUTHORIZED` or `INVALID_TOKEN`). If the client should receive `INVALID_TOKEN`, the client should refresh if possible using `refresh`, or log in again using `login`.

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

Endpoint: `POST /api/v1/authentication/login`

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

Endpoint: `POST /api/v1/authentication/register`

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

Endpoint: `POST /api/v1/authentication/authenticate`

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

Endpoint: `POST /api/v1/authentication/refresh`

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

Endpoint: `POST /api/v1/authentication/updatePassword`

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



##  Users

Users routes allow users to update their profiles and fetch information about other user accounts.

Base URL: `/api/v1/users`

### Routes
| URL | Purpose | Auth |
| --- | --- | --- |
| getUserById | Fetches the `PublicUser` information for a user | ✅ |
| getUserByEmail | Fetches the `PublicUser` information for a user | ✅ |
| updateProfile | Updates a user's profile information | ✅ |

### Get User By ID 🔒

Endpoint: `POST /api/v1/users/getUserById`

#### Body
```js
{
    userId: string
}
```
- User ID must be a valid database ID

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
| UserNotFound | 404 | USER_NOT_FOUND | The user account with that ID was not found |

### Get User By ID 🔒

Endpoint: `POST /api/v1/users/getUserByEmail`

#### Body
```js
{
    email: string
}
```
- Email must be a valid email

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
| UserNotFound | 404 | USER_NOT_FOUND | The user account with that ID was not found |

### Update Profile 🔒

Endpoint: `POST /api/v1/users/updateProfile`

#### Body
```js
{
    displayName: string
}
```
- Display name must be between 3 and 64 characters (inclusive).

#### Responses
If successful:
```js
{
    success: true
}
```
There should be no additional failures for this route unless the user is not logged in.

## Messaging

Messaging routes allow users to manage and find information about chats.

Base URL: `/api/v1/messaging`

### Routes
| URL | Purpose | Auth |
| --- | --- | --- |
| createChat | Creates a new Chat (group chat) | ✅ |
| getChat | Gets information about a Chat | ✅ |
| addMemberToChat | Adds a member to a Chat | ✅ |
| removeMemberFromChat | Removes a member from a Chat | ✅ |
| updateChatInformation | Updates information about a Chat | ✅ |
| ⚠️ uploadImage | Uploads an image associated with a message | ✅ |
| ⚠️ getImage | Gets an image file from storage | ✅ |

### Create Chat 🔒

Endpoint: `POST /api/v1/messaging/createChat`

#### Body
```js
{
    title: string
}
```
- Title must be between 3 and 64 characters (inclusive).

#### Responses
If successful:
```js
{
    // see src/messaging/Chat.types.ts; this is a Chat
    _id: string; // Mongoose ObjectID
    
    title: string;
    createdAt: Date;
    // Mongoose ObjectIDs
    owner: string;
    members: string[];
}
```
There should be no additional failures for this route unless the user is not logged in.

### Get Chat 🔒

Endpoint: `POST /api/v1/messaging/getChat`

#### Authorization
This method requires that the user is in the Chat whose ID is specified by `chatId`.

#### Body
```js
{
    chatId: string
}
```
- Chat ID must be a valid MongoDB ID

#### Responses
If successful:
```js
{
    // see src/messaging/Chat.types.ts; this is a Chat
    _id: string; // Mongoose ObjectID
    
    title: string;
    createdAt: Date;
    // Mongoose ObjectIDs
    owner: string;
    members: string[];
}
```
| Error | Status | Code | Reason |
| --- | --- | --- | --- |
| ChatNotFound | 404 | CHAT_NOT_FOUND | The chat with that ID was not found |

### Add Member to Chat 🔒

Endpoint: `POST /api/v1/messaging/addMemberToChat`

#### Authorization
This method requires that the user is the owner of the Chat whose ID is specified by `chatId`.

#### Body
```js
{
    chatId: string,
    userId: string
}
```
- Chat ID must be a valid MongoDB ID
- User ID must be a valid MongoDB ID

#### Responses
If successful:
```js
{
    success: true
}
```

| Error | Status | Code | Reason |
| --- | --- | --- | --- |
| UserNotFound | 404 | USER_NOT_FOUND | The user account with that ID was not found |
| ChatNotFound | 404 | CHAT_NOT_FOUND | The chat with that ID was not found |
| UserOwnsChat | 409 | USER_OWNS_CHAT | The user to be added owns the chat |
| UserAlreadyInChat | 409 | USER_ALREADY_IN_CHAT | The user to be added is already in the chat |

### Remove Member from Chat 🔒

Endpoint: `POST /api/v1/messaging/removeMemberFromChat`

#### Authorization
This method requires that the user is the owner of the Chat whose ID is specified by `chatId`.

#### Body
```js
{
    chatId: string,
    userId: string
}
```
- Chat ID must be a valid MongoDB ID.
- User ID must be a valid MongoDB ID.

#### Responses
If successful:
```js
{
    success: true
}
```

| Error | Status | Code | Reason |
| --- | --- | --- | --- |
| UserNotFound | 404 | USER_NOT_FOUND | The user account with that ID was not found |
| ChatNotFound | 404 | CHAT_NOT_FOUND | The chat with that ID was not found |
| UserOwnsChat | 409 | USER_OWNS_CHAT | The user to be removed owns the chat |
| UserNotInChat | 404 | USER_NOT_IN_CHAT | The user to be removed is not in the chat |

### Update Chat Information 🔒

Endpoint: `POST /api/v1/messaging/updateChatInformation`

#### Authorization
This method requires that the user is the owner of the Chat whose ID is specified by `chatId`.

#### Body
```js
{
    chatId: string,
    title: string
}
```
- Chat ID must be a valid MongoDB ID.
- Title must be between 3 and 64 characters (inclusive).

#### Responses
If successful:
```js
{
    success: boolean
}
```
Success will be true if the user was removed and false if the user was not in the Chat. Receiving `success = false` does not constitute an error.

| Error | Status | Code | Reason |
| --- | --- | --- | --- |
| ChatNotFound | 404 | CHAT_NOT_FOUND | The chat with that ID was not found |

### ⚠️ Upload Image 🔒

Endpoint: `POST /api/v1/messaging/uploadImage`

#### ⚠️ Placeholder Endpoint

Image handling has not yeet been implemented properly. Images uploaded will not be stored on the server. Additional middleware and a file storage protocol will be necessary before image support is ready.

#### Authorization
This method requires that the user sent the message associated with the image.

#### Body
```js
{
    messageId: string,
    uri: string
}
```
- Message ID must be a valid MongoDB ID. This is the ID of the message the image is attached to.
- URI will be handled differently in the final implementation.

#### Responses
If successful:
```js
{
    // see src/messaging/Image.types.ts; this is an Image
    // MongoDB ID
    _id: string;

    uri: string;
    createdAt: Date;
    // MongoDB ID
    message: string;
}
```

| Error | Status | Code | Reason |
| --- | --- | --- | --- |
| MessageNotFound | 404 | MESSAGE_NOT_FOUND | The message with that ID was not found |

### ⚠️ Get Image 🔒

Endpoint: `POST /api/v1/messaging/getImage`

#### ⚠️ Placeholder Endpoint

Image handling has not yeet been implemented properly. Images uploaded will not be stored on the server. Additional middleware and a file storage protocol will be necessary before image support is ready.

#### Authorization
This method requires that the user is in the chat associated with the message associated with the image. I.e., the image was uploaded in a chat the user has access to.

#### Body
```js
{
    imageId: string
}
```
- Image ID must be a valid MongoDB ID. This is the ID of the image.

#### Responses
If successful:
```js
{
    // see src/messaging/Image.types.ts; this is an Image
    // MongoDB ID
    _id: string;

    uri: string;
    createdAt: Date;
    // MongoDB ID
    message: string;
}
```

| Error | Status | Code | Reason |
| --- | --- | --- | --- |
| ImageNotFound | 404 | IMAGE_NOT_FOUND | The image with that ID was not found |

## Status

### Health

Endpoint: `POST /api/v1/health`
Endpoint: `GET /api/v1/health`

#### Body
No body is necessary.

#### Responses
Health endpoints always return:
```js
{
    ok: true
}
```
They are intended to provide a quick status check for the server.

