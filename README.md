# Campaign Keep

Campaign Keep is a D&D-first web application for tabletop RPG groups who want one home for campaign management, player-facing lore, handouts, session prep, and character sheets.

This repository is presented as a product-minded full-stack portfolio project. The focus is not only on shipping features, but on structuring the app the way a real SaaS MVP would be built: modular routes, role-aware permissions, seeded reference data, and a UI direction that feels intentional rather than purely utilitarian.

## Portfolio Notice

This repository is public so recruiters and reviewers can inspect the code and product direction.

It is not open source. Reuse, redistribution, deployment, modification, or derivative commercial use is not permitted without explicit written permission. See [LICENSE](./LICENSE).

## What It Does

- Authentication with session-based login and registration
- User dashboard with campaigns, invitations, recent characters, and recent activity
- Campaign workspaces with role-aware navigation and visibility rules
- Modules for wiki, sessions, NPCs, locations, items, quests, handouts, notes, and archive
- D&D 2024 character creation flow with class-aware defaults and seeded catalog data
- Character sheet pages with attacks, actions, inventory, spells, and feature display
- Master/player permission model with public, master-private, and owner-private visibility

## Product Direction

The app is designed around a simple product thesis:

> be the campaign brain, not a VTT

That means the experience prioritizes:

- prep and memory over maps and combat automation
- shared campaign context over chat
- readable, immersive character and lore presentation over spreadsheet-style tooling

## Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS v4
- Prisma ORM
- PostgreSQL
- shadcn-style UI primitives

## Technical Highlights

- Prisma schema models both campaign data and D&D 2024 catalog/reference data
- Server actions are used for core mutations such as auth, invites, wiki CRUD, and character creation
- Character generation is data-driven from seeded class, subclass, feat, spell, item, and action catalogs
- The app supports role-per-campaign access instead of role-per-account, so one user can be a master in one campaign and a player in another
- Seed data provides a working demo campaign and enough catalog content to demonstrate the D&D-focused product direction

## Current Status

This is an actively evolving MVP. The current implementation is strongest in:

- app structure and permissions
- campaign shell and module layout
- seeded D&D data model
- character creation and sheet presentation
- end-to-end local setup

Planned next steps include deeper guided character progression, tighter master-controlled leveling workflows, richer sheet interactions, and a more complete rule-driven onboarding flow after joining a campaign.

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Copy the environment file

```bash
cp .env.example .env
```

3. Set a local PostgreSQL connection and session secret in `.env`

```env
DATABASE_URL="postgresql://postgres:your-local-db-password@localhost:5432/campaign_keep?schema=public"
SESSION_SECRET="replace-with-a-long-random-secret"
```

4. Generate the Prisma client and sync the database

```bash
npm run db:generate
npm run db:push
```

5. Seed the database

```bash
npm run db:seed
```

6. Run the app

```bash
npm run dev
```

## Demo Seed Data

The seed creates a small working dataset for local review.

- Master: `master@campaignkeep.dev` / `demo1234`
- Player: `player@campaignkeep.dev` / `demo1234`
- Invite token: `EMBER-OPEN-SEAT`

These credentials are intended for local demo purposes only.

## Useful Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run db:generate
npm run db:push
npm run db:seed
npm run db:studio
```

## Deployment Notes

For Vercel or other hosted environments, set the environment variables directly in the deployment platform.

Required:

- `DATABASE_URL`
- `SESSION_SECRET`

If you are using Supabase from an IPv4-only environment, prefer the Session Pooler connection string instead of the direct database host.

## Repository Notes

- `.env` and other local environment files are ignored
- `.env.example` contains only safe placeholders
- temporary local extraction files are ignored
- demo credentials live in seed data, not in committed secrets

## Why This Makes a Good Portfolio Project

This project demonstrates work across:

- product thinking
- backend modeling
- auth and permissions
- database seeding strategy
- full-stack Next.js implementation
- UI direction for a niche domain product

It is intentionally not a toy CRUD app. The app balances domain-specific modeling with reusable engineering patterns that translate well to production product teams.

## License

All rights reserved. Publicly visible for portfolio review only.
