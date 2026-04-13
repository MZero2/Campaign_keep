# Contributing

Thanks for taking an interest in Campaign Keep.

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

## Design Notes

The UI should feel product-grade, readable, and atmospheric without drifting into clutter. Campaign Keep is not an enterprise admin panel and it is not a VTT.
