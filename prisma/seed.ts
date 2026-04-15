import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@markin.dev" },
    update: {},
    create: {
      email: "demo@markin.dev",
      name: "Demo Marketer",
      image: "https://avatars.githubusercontent.com/u/0",
    },
  });

  const repo = await prisma.repo.upsert({
    where: { owner_name_userId: { owner: "demo-org", name: "marketing-site", userId: user.id } },
    update: {},
    create: {
      owner: "demo-org",
      name: "marketing-site",
      branch: "main",
      userId: user.id,
    },
  });

  await prisma.change.create({
    data: {
      request: "Change the homepage pricing from $29/mo to $49/mo",
      file: "src/app/page.tsx",
      oldText: "$29/mo",
      newText: "$49/mo",
      explanation: "Updated homepage pricing display",
      prUrl: "https://github.com/demo-org/marketing-site/pull/42",
      prNumber: 42,
      status: "submitted",
      repoId: repo.id,
      userId: user.id,
    },
  });

  await prisma.draft.create({
    data: {
      request: "Add a 'New' badge next to the Enterprise plan",
      file: "src/app/pricing/page.tsx",
      oldText: "Enterprise",
      newText: "Enterprise <Badge>New</Badge>",
      explanation: "Added New badge to Enterprise plan title",
      repoId: repo.id,
      userId: user.id,
    },
  });

  console.log("Seed complete:", { user: user.email, repo: `${repo.owner}/${repo.name}` });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
