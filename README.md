# MarkIn

> **GitOut.**
> Plain English editing for your marketing site. No Git required.

MarkIn lets marketing teams edit their Next.js / React site by describing changes
in plain English. Engineers review every change as a pull request. Marketers
never see a terminal, a merge conflict, or a branch.

![MarkIn screenshot placeholder](./public/screenshot-placeholder.png)

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env
# Fill in:
#   GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET (https://github.com/settings/developers)
#   ANTHROPIC_API_KEY (https://console.anthropic.com)
#   NEXTAUTH_SECRET   (openssl rand -base64 32)

# 3. Database
npx prisma db push
npm run db:seed   # optional: creates a demo user + sample data

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How the analyze flow works

```
User types: "Change the homepage pricing from $29/mo to $49/mo"
        │
        ▼
POST /api/analyze
        │
        ├─► GitHub: fetch repo file tree
        ├─► Claude (FILE_IDENTIFIER_PROMPT): which file?
        │       └─► [{ file: "src/app/page.tsx", confidence: 0.95, ... }]
        ├─► GitHub: fetch that file's content
        └─► Claude (EDIT_GENERATOR_PROMPT): exact edit
                └─► { original_text, new_text, line_number, explanation }

Client renders DiffPreview → user clicks "Ship it"
        │
        ▼
POST /api/submit
        │
        ├─► GitHub: create branch markin/edit-{ts}
        ├─► GitHub: commit replacement
        ├─► GitHub: open PR with original request as body
        └─► DB: persist Change row
```

---

## Tech stack

- **Next.js 14+** (App Router) with TypeScript
- **Tailwind CSS** with custom dark/gold brand theme
- **Anthropic Claude API** (`claude-sonnet-4-6`) for NL → code edits
- **GitHub REST API** via Octokit
- **NextAuth.js** with GitHub OAuth (scope: `repo`, `read:user`, `user:email`)
- **Prisma + SQLite** for local dev (Postgres-ready for production)
- **Vercel-ready** out of the box

---

## Project structure

```
markin/
├── prisma/
│   ├── schema.prisma     # User, Repo, Change, Draft
│   └── seed.ts
├── public/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing
│   │   ├── dashboard/            # Editor + Drafts + History
│   │   └── api/                  # auth, repos, analyze, preview, submit, drafts
│   ├── components/               # ChangeInput, DiffPreview, ThinkingSteps, …
│   ├── lib/                      # claude, github, prompts, auth, db
│   └── types/
└── README.md
```

---

## Build Later (Roadmap)

- [ ] **Live visual preview** — render a screenshot of the page with the change applied
- [ ] **Brand guardrails** — file-level + component-level permission configs
- [ ] **Batch changes** — one request, multiple files
- [ ] **Change impact scan** — "this edit affects 3 pages"
- [ ] **Change calendar** — schedule PRs for launch timing
- [ ] **Team features** — multi-user orgs, role-based access
- [ ] **Audit trail export** — CSV / PDF for compliance

---

## Contributing

PRs welcome. Please run `npm run lint` and keep changes focused.
For larger features, open an issue first so we can align on direction.

---

## License

MIT © MarkIn
