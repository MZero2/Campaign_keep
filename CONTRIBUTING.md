# Contributing

Thanks for taking an interest in Campaign Keep.

This repository is primarily maintained as a portfolio project and is currently not open to unsolicited external code contributions or reuse.

If you want to discuss the project, architecture, or collaboration opportunities, please contact the repository owner first.

## Development Workflow

1. Fork the repository
2. Create a feature branch
3. Install dependencies with `npm install`
4. Copy `.env.example` to `.env`
5. Run:

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Before Opening a PR

Please make sure the following pass locally:

```bash
npm run lint
npm run typecheck
npm run build
```

## Guidelines

- Keep changes scoped and intentional
- Preserve existing campaign permission rules
- Avoid committing secrets or local environment files
- Prefer data-driven additions over hardcoded UI logic where possible
- If adding D&D catalog data, keep the seed and schema aligned
- Do not assume public visibility means open-source reuse rights

## Design Notes

The UI should feel product-grade, readable, and atmospheric without drifting into clutter. Campaign Keep is not an enterprise admin panel and it is not a VTT.
