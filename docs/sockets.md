# Live Socket.IO Server

This file contains the documentation for the Socket.IO connection.

## Connecting

Connect using the official Socket.IO client. The endpoint is the server default endpoint `/socket.io/`.

Example code:
```js
const socket = io("https://example.com/socket.io/", {
    auth: {
        token: "jwt-access-token",
    },
});
```

### Authentication

The above code should automatically authenticate the Socket.IO connection until it is closed. New access tokens are not necessary periodically.

Note that refresh tokens cannot be used to log in to the live server. Call the HTTP API to get an access token before making the Socket.IO connection.

## Communicating

The live server handles sending and receiving messages, as well as getting historical messages. All other functions are reserved for the HTTP API.

### Events

The following events are available for the client to send to the server to request information or post changes.

| Event | Purpose |
| --- | --- |
| message:send | Send a new message |
| message:get | Get historical messages (paginated) |
| chat:open | Subscribe to a chat's message channel |
| chat:close | Unsubscribe from all chat messaging channels |

### Common Responses

These responses are common to all events.

If the client sends invalid arguments:
```js
{
    success: false,
    note: string
}
```
If there is another error, such as trying to send a message to a chat that the user is not a member of:
```js
{
    success: false,
    note: "error during message sending",
}
```
Note that for security reasons, details are not given.

### Send Message

Event name: `message:send`

The send message event allows a client to send a message in a chat.

While the client technically does not need to actively subscribe to the chat to send a message, there should not be any cases in which a client sends a message without being subscribed to that chat.

#### Authorization

The user must be a member of the chat specified.

#### Body
```js
{
    chatId: string,
    textContent: string,
}
```
- Chat ID must be a valid MongoDB ID.
- Text content must be between 2 and 256 characters inclusive.

#### Responses
All responses are under the event `reply:message:send`.

If the client successfully sends the message, the client will receive this message:
```js
{
    success: true,
    note: "success",
    message: Message // see src/messaging/Message.types.ts; this is a Message
}
```
If the client successfully sends the message, other subscribed users will receive this message:
```js
{
    success: true,
    note: "new message",
    message: Message // see src/messaging/Message.types.ts; this is a Message
}
```

### Get Message

Event name: `message:get`

The get message event allows a client to get a paginated list of recent messages.

#### Authorization

The user must be a member of the chat specified.

#### Body
```js
{
    chatId: string,
    limit: number,
    cursorDate: Date,
    cursorId: string
}
```
- Chat ID is a MongoDB ID.
- Limit is the maximum number of messages to retrieve at once. it must be an integer between 1 and 50 (inclusive).
- Cursor Date and Cursor ID are the date and ID of the last message currently in the client's view. Cursor ID must be a valid MongoDB ID.

#### Responses
All responses are under the event `reply:message:get`.

If the client successfully gets the messages:
```js
{
    success: true,
    note: "success",
    messages: Message[] // see src/messaging/Message.types.ts; this is a Message
}
```

### Open Chat

Event name: `chat:open`

The open chat event allows a client to subscribe to a Chat's current messages.

Internally, it joins the client to that chat's Socket.IO room.

#### Authorization

The user must be a member of the chat specified.

#### Body
```js
{
    chatId: string
}
```
- Chat ID is a MongoDB ID.

#### Responses
All responses are under the event `reply:chat:open`.

If the client successfully joins the chat, the client should receive
```js
{
    success: true,
    note: "joined chat"
}
```

### Close Chat

Event name: `chat:close`

The close chat event allows a client to unsubscribe from Chat message channels.

⚠️ This will unsubscribe the client from all Chat message channels. This is an intended behavior. Clients should only subscribe to the currently open chat window. The implementation for this event simply loops over the rooms the socket is in and leaves all of them.

#### Body
No body is necessary for `chat:close`.

#### Responses
No matter what, the client should receive a `reply:chat:close` containing this information, since there is no interaction outside of the Socket.IO API for this event:
```js
{
    success: true,
    note: "closed chat"
}
```
