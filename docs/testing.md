# Testing

This project contains both unit tests and integration (e2e, in this case) tests.

Every documented input and output in [the API specification](api.md) and [the live Socket.IO specification](sockets.md) is E2E tested for accuracy and conformance to the specification.

## Running Tests

Tests may be run with `npm run test` following a successful install. See [the README](../README.md) for more information about how to set up the server.

## Unit Tests

Unit tests are organized by module. The testable portions of each module are located in an `__tests__` folder near the classes to be tested.

Unit tests are not provided for pass-through APIs such as controllers. Instead, these are end-to-end tested to ensure correct behavior.

## Integration Tests

Integration tests are mostly end-to-end, although some modules import other services and use them in their tests, making these tests a hybrid of integration and unit tests.

The end-to-end tests are located in the `tests` folder (see [the e2e subfolder](../tests/e2e)). They are separated by module into the API tests and the live (Socket.IO) tests.
