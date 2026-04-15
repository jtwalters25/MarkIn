# MarkIn

> Edit your live Next.js site copy in minutes. No code, no Git, no engineers.

MarkIn lets founders and marketers update their website using plain English.
Describe the change, review it, and publish safely, without touching the codebase.

---

## Why MarkIn?

Updating marketing copy shouldn’t require:
- digging through a codebase
- opening a pull request
- waiting on an engineer
- risking broken builds

But for most Next.js startups, it does.

MarkIn removes that bottleneck.

---

## How it works

1. **Describe the change**  
   _“Change homepage pricing from $29 to $49”_

2. **Preview the result**  
   See exactly what will change before it goes live

3. **Publish safely**  
   Deploy instantly or create a pull request, with rollback built in

---

## What you can do

- Update headlines, CTAs, and pricing without engineering help  
- Fix typos instantly  
- Ship copy changes in minutes instead of days  
- Safely experiment with messaging  

---

## Before vs After

**Before**
- Slack an engineer  
- Wait for a PR and deploy  
- Slow iteration  

**After**
- Describe the change  
- Review it  
- Publish in under 2 minutes  

---

## Tech Overview (for developers)

- Next.js (App Router) + TypeScript  
- Anthropic Claude for natural language → code edits  
- GitHub API for version control and PR workflows  
- Prisma for persistence  
- NextAuth for GitHub authentication  

---

## How it works under the hood