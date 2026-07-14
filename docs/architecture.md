# Architecture

The backend for our messaging application uses TypeScript, NodeJS, Mongoose, Express.JS, WebSockets, and Jest at a high level.

The application is separated into various modules by domain. Each module has individual testing.

## Modules

Modules generally either interface with the database, network, or other modules, but not more than one.

### Users

The users module handles all features related to users, including database models, the repository, types, and the service layer. It contains tests for the repository and service layer.

As a database module, it contains files related to interfacing with Mongoose.

#### Organization
- `User.types.ts` - types for the user, including public and private document fields
- `User.model.ts` - model instantiation and defaults for the Mongoose database
- `UserRepository.ts` - the repository for the users collection, allowing the service to abstract away from the Mongoose layer
- `UserAuthorizationService.ts` - the authorization service, called within UserService to determine whether the actor has permission to perform an action
- `UserService.ts` - business logic surrounding users, does not know what Mongoose is
- `UserModule.ts` - exported items for the users module, specifically the `UserService` and `UserRepository` classes

There is also a `dto/` folder containing DTOs for creating a user and updating their profile. These actions use DTOs (while the passwords use a hard-coded function) since I expect these actions' parameters to change in the future.

For information about testing, see [testing.md](testing.md).

### Messaging

The messaging module contains all features related to messaging. As a database module, it is almost identical in structure to the `users` module, so detailed information is omitted.

The main difference between `messaging` and `users` is that `messaging` contains multiple different Monogoose collections corresponding to `Message`, `Image`, and `Chat`. Since these cannot exist independently, their business logic is heavily intertwined and collected under one module.

### Authentication

The authentication module contains all features related to authentication, including some user creation logic. It is a unique module that deals mostly with external libraries (`bcrypt` and `jsonwebtoken`) but also with the `UserRepository` and the `UserService`.

The authentication module does not directly interface with Mongoose. Instead, it interfaces with the repositories for the user models it interacts with.

Due to the necessity of password hashing to create a new user or update a password, these functionalities are provided through the authentication module and related controllers.

#### Organization
- `PasswordService.ts` - `bcrypt` wrapper that provides password hashing and verification
- `JwtService.ts` - `jsonwebtoken` wrapper that provides generation and verification of JWTs
- `AuthenticationService.ts` - broad functions for the authentication module, including logins, refresh, registration, and updating passwords

### API

The API module contains all of the HTTP request endpoints.

It provides access to persistent storage (including group creation and image uploading) and authentication for clients.

#### Organization
- `controllers/` - business logic for API routes; connects HTTP requests to the associated services
- `middleware/` - filters and aggregators for information needed to process HTTP requests, including authentication
- `middleware/validators/` - HTTP request body field format, data type, and presence verification
- `routes/` - routing classes for connecting the Express application to the controllers and endpoint parsing

### Configuration

The configuration (config) module contains some configuration wrappers. It pulls from the `.env` file and contains some related application configuration.
