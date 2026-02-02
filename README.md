# College Placement Portal Backend

This service powers a placement portal with coordinator and student roles, dynamic application forms, and application exports.

## Quick Start

```bash
npm install
npm run prisma:generate
npm run dev
```

Open `http://localhost:4000` to use the lightweight testing UI bundled in `public/`.

## Key Concepts

- **Dynamic application fields** are stored as metadata (`DynamicField`) and **never hardcoded**.
- **Responses** store `fieldId -> value` mappings in `ApplicationFieldResponse`.
- **File uploads** are stored separately in `UploadedFile` and referenced by URL.
- **Eligibility** is evaluated based on student profile data + company criteria.

## Core API Surface

- `POST /auth/register` / `POST /auth/login`
- `GET /students/me` / `PUT /students/me`
- `POST /companies` / `PATCH /companies/:id`
- `POST /companies/:companyId/fields` / `PATCH /companies/:companyId/fields/:fieldId` / `DELETE /companies/:companyId/fields/:fieldId`
- `GET /companies/:companyId/apply` / `POST /companies/:companyId/apply`
- `GET /companies/:companyId/applications`
- `GET /exports/companies/:companyId/applications/csv`
- `POST /uploads`
