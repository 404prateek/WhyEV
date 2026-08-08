# WhyEV Project — Agent Rules

## Mock Data Policy

A mock should only be replaced when **all** of the following are true:

1. The complete backend logic is implemented and tested.
2. The database schema is finalized and migrated.
3. The API contract (endpoint, request/response shape) is defined and live.
4. The business rules governing the data are fully designed.

Until all four conditions are met:

- **Keep the mock in place.**
- Add a clear `// TODO:` comment in the code explaining exactly what future backend/API will replace it, including the expected endpoint or service.
- **Do not invent backend logic** just to eliminate mock data. Invented logic that doesn't reflect real business rules creates technical debt that is harder to remove than the mock itself.

### Example of correct mock preservation

```typescript
// TODO: Replace with GET /api/v1/dealers?city=... once dealer inventory
// backend is implemented (Phase F). Until then, mock data is shown.
const dealers = MOCK_DEALERS;
```

### Example of incorrect behavior (do NOT do this)

```typescript
// Bad: invented an endpoint that doesn't exist yet just to remove the mock
const dealers = await fetch('/api/v1/dealers').then(r => r.json());
```
