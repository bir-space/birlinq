# birlinq Move MVP

Privacy-first QR platform for car owners (RU-first).

## Architecture and folder structure

```text
src/
  app/
    page.tsx                 # marketing landing
    qr/[code]/page.tsx       # public QR page (no auth)
    activate/[code]/page.tsx # owner activation
    owner/page.tsx           # owner cabinet
    admin/page.tsx           # admin cabinet
    partner/page.tsx         # partner cabinet
  features/move/
    public-qr/PublicQrPage.tsx
    activation/ActivationPage.tsx
    owner/OwnerDashboardPage.tsx
    admin/AdminDashboardPage.tsx
    partner/PartnerDashboardPage.tsx
  lib/
    api.ts                   # typed API layer and endpoint wiring
    move-scenarios.ts        # scenario catalog
    i18n/ru.ts               # RU-first localization dictionary
```

## Endpoints wired

- `GET /move/public/qr/:code`
- `POST /move/public/qr/:code/interactions`
- `GET /move/activation/:code`
- `POST /move/activation/:code`
- `GET /move/owner/dashboard`
- `GET /move/admin/overview`
- `POST /move/admin/qr/:code/block`
- `POST /move/admin/qr/:code/unblock`
- `GET /move/partner/overview`

Set `NEXT_PUBLIC_API_BASE_URL` to connect the frontend to backend API.

## Local run

```bash
npm install
npm run dev
```
