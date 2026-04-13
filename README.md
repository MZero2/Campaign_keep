# Campaign Keep (MVP v1 bootstrap)

All-in-one web platform for tabletop RPG campaigns (D&D-first), with:

- campaign management and lore wiki
- public/private campaign content
- character sheets (D&D base)
- player private notes/diary
- handouts archive and campaign search

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn-style UI primitives
- Prisma ORM
- PostgreSQL

## Implemented scope

- Authentication (register/login/logout) with secure HTTP-only session cookie
- User dashboard:
- active campaigns
- role per campaign
- invitations
- recent characters and sessions
- create campaign and join by invite token
- Campaign area with stable sidebar:
- Dashboard
- Sessions
- Wiki
- NPCs
- Locations
- Items
- Quests
- Handouts
- Characters
- My Notes
- Archive
- Settings
- Permissions model:
- `MASTER` vs `PLAYER`
- visibility levels: `PRIVATE_MASTER`, `PUBLIC_CAMPAIGN`, `OWNED_PRIVATE`
- Wiki full CRUD (create/read/update/delete) with visibility enforcement
- Seeded demo campaign data
- Campaign search across modules

## Project structure

```text
campaign-keep/
  prisma/
    schema.prisma
    seed.ts
  src/
    app/
      actions/
      dashboard/
      campaigns/[slug]/
        wiki/
        sessions/
        npcs/
        locations/
        items/
        quests/
        handouts/
        characters/
        notes/
        archive/
        settings/
        search/
      login/
      register/
      features/
      pricing/
    components/
      ui/
    lib/
```

## Setup

1. Install dependencies

```bash
npm install
```

2. Create env file

```bash
cp .env.example .env
```

3. Set PostgreSQL connection in `.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campaign_keep?schema=public"
SESSION_SECRET="your-long-random-secret"
```

4. Generate Prisma client and run migration

```bash
npm run db:generate
npm run db:migrate
```

5. Seed demo data

```bash
npm run db:seed
```

6. Start dev server

```bash
npm run dev
```

## Demo credentials

- Master: `master@campaignkeep.dev` / `demo1234`
- Player: `player@campaignkeep.dev` / `demo1234`
- Demo invite token: `EMBER-OPEN-SEAT`

## Verification

- `npm run lint` passes
- `npm run build` passes
