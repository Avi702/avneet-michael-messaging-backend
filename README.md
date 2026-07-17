# Messaging Application Backend

This is the backend for a messaging application project that I'm working on with Avneet Aurora and Mohnish Pothineni. I'm developing the backend, and they're developing the frontend.

For the frontend, please see [the corresponding repository](https://github.com/Avi702/messaging-application-frontend).

## About the Application

For information about the structure and modules, see [architecture.md](docs/architecture.md).

For usage specifications, see [the HTTP API specification](docs/api.md) and [the socket.IO specification](docs/sockets.md).

## Get Started

The backend exposes different servers for different use cases.

### Environment Variables

Before starting any server, you must copy the `.env.example` file into `.env` and edit the options.

The options are as follows:

#### NODE_ENV (required)

If `NODE_ENV` is set to `development`, the server will run in development mode. This will result in more debug being printed and sent to clients when there are errors.

If `NODE_ENV` is set to `production`, the server will run in production mode. This will hide some error messages for security reasons.

If `NODE_ENV` is set to `testing`, the server will run in testing mode. This runs MongoDB in memory and does not require the `MONGODB_URI` variable to be set.

#### JWT_ACCESS_SECRET (required)

This should be a securely randomly generated secret. It is used to sign JWTs. It is required in all modes.

#### JWT_REFRESH_SECRET (required)

This should be a securely randomly generated secret. It is used to sign JWTs. It is required in all modes.

#### JWT_ACCESS_TOKEN_LIFETIME (required)

This is how long the JWT for access lasts. There are multiple valid formats, but I recommend using `NNT` where `NN` is a number and `T` is time. For example `15m` would represent 15 minutes. Valid values for `T` include `s`, `h`, and `d` for seconds, hours, and days respectively.

I recommend leaving this at the default value.

#### JWT_REFRESH_TOKEN_LIFETIME (required)

This is the same as `JWT_ACCESS_TOKEN_LIFETIME` but for the refresh token. I recommend leaving this at the default as well.

#### PORT

Port is the port on which the HTTP server will listen. It is not required and defaults to `3000`. It must be parseable as an integer.

#### MONGODB_URI

The URI for the MongoDB connection. This is needed unless in testing mode.

## Building

Before starting a server, the code must be compiled into JavaScript from its TypeScript source.

### 1. Install modules

Run the following command to install the modules:
```bash
npm install
```

### 2. Build the code

Run the following command to build the code
```bash
npm run build
```

## Starting a Server

To start a development server, run
```bash
npm run development
```

To start a production server, run
```bash
npm run production
```

To start a testing server (same as development server but with MongoDB running in memory), run:
```bash
npm run testing
```

If you've made some changes and want to quickly recompile and run a testing server, run:
```bash
npm run testserver
```
