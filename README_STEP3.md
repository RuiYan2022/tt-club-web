# Step 3 — Recurring Group Sessions & Safe Cascades

Apply SQL:
- `supabase/migrations/0003_group_sessions_unique.sql`
- `supabase/migrations/0004_delete_safe_group_sessions.sql`

API:
- POST `/api/groups/generate-sessions`
- POST `/api/groups/sync`

Example:
```bash
curl -X POST http://localhost:3000/api/groups/generate-sessions -H "Content-Type: application/json" -d '{}'
```
```bash
curl -X POST http://localhost:3000/api/groups/sync -H "Content-Type: application/json" -d '{
  "groupId": "GROUP_UUID",
  "changeFrom": "2025-10-01T00:00:00.000Z",
  "changeTo": "2025-12-31T23:59:59.000Z"
}'
```
