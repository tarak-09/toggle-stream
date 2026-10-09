# Feature Flag Daemon

An asynchronous feature flag daemon built with TypeScript and Node.js. It streams real-time state updates to connected clients using Server-Sent Events (SSE). It includes a RESTful management API to create, read, update, and delete feature flags.

## Why it exists

In distributed systems, rapidly changing feature flag configurations must be propagated to services without the overhead of aggressive polling or managing complex WebSocket connections. This daemon solves this by leveraging unidirectional Server-Sent Events (SSE) to broadcast flag changes instantly to all connected subscribers. 

## Installation

Ensure you have Node.js 18+ installed.

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Usage

Start the daemon:

```bash
npm start
```

Or run in development mode with `ts-node`:

```bash
npm run dev
```

The daemon will start on `http://localhost:3000` (configurable via the `PORT` environment variable).

## Examples

### 1. Management API

**Create a feature flag:**

```bash
curl -X POST http://localhost:3000/api/flags \
  -H "Content-Type: application/json" \
  -d '{"name":"new-ui","description":"Enable the new user interface","enabled":true}'
```
*Output:*
```json
{
  "id": "abc1234",
  "name": "new-ui",
  "description": "Enable the new user interface",
  "enabled": true,
  "createdAt": "2023-10-09T10:00:00.000Z",
  "updatedAt": "2023-10-09T10:00:00.000Z"
}
```

**List all feature flags:**

```bash
curl http://localhost:3000/api/flags
```
*Output:*
```json
[
  {
    "id": "default-flag",
    "name": "default-flag",
    "description": "A default flag",
    "enabled": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

**Update a flag:**

```bash
curl -X PATCH http://localhost:3000/api/flags/abc1234 \
  -H "Content-Type: application/json" \
  -d '{"enabled":false}'
```

**Delete a flag:**

```bash
curl -X DELETE http://localhost:3000/api/flags/abc1234
```

### 2. SSE Stream

Clients can subscribe to real-time updates by connecting to the `/api/stream` endpoint.

```bash
curl -N http://localhost:3000/api/stream
```

*Output:*
```text
event: initial
data: [{"id":"default-flag","name":"default-flag","description":"A default flag","enabled":true,"createdAt":"...","updatedAt":"..."}]

: heartbeat

event: update
data: {"id":"abc1234","name":"new-ui","description":"Enable the new user interface","enabled":true,"createdAt":"...","updatedAt":"..."}
```

## Running Tests

The test suite ensures the API and SSE streaming function correctly. We use `jest` and `supertest`.

```bash
npm test
```
