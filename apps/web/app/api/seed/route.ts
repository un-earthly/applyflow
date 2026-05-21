import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const SEED_KEY = process.env.SEED_KEY ?? "dev-seed-123";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Safety: require a seed key in production; allow dev without one
  const body = await request.json().catch(() => ({}));
  if (process.env.NODE_ENV === "production" && body.key !== SEED_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const db = adminDb();

    // ─── Clean existing seed users ───
    const existing = await adminAuth().listUsers(100);
    const seedEmails = ["user@example.com", "admin@example.com"];
    for (const u of existing.users) {
      if (seedEmails.includes(u.email ?? "")) {
        await adminAuth().deleteUser(u.uid);
      }
    }

    // ─── Create test user ───
    const userRecord = await adminAuth().createUser({
      email: "user@example.com",
      password: "password123",
      displayName: "Test User",
      emailVerified: true,
    });

    await db.collection("users").doc(userRecord.uid).set({
      id: userRecord.uid,
      fullName: "Test User",
      headline: "Full-Stack Developer",
      avatarUrl: "",
      location: "San Francisco, CA",
      phone: "+1 555-0100",
      linkedInUrl: "https://linkedin.com/in/testuser",
      portfolioUrl: "https://testuser.dev",
      yearsOfExperience: 4,
      workAuthStatus: "work_visa",
      subscriptionTier: "pro",
      role: "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await db.collection("preferences").doc(userRecord.uid).set({
      jobTitles: ["Software Engineer", "Full-Stack Developer", "Frontend Engineer"],
      locations: ["San Francisco", "New York", "Remote"],
      openToRemote: true,
      salaryMin: 120000,
      salaryMax: 200000,
      salaryCurrency: "USD",
      employmentTypes: ["full_time", "contract"],
      industries: ["Technology", "Fintech"],
      excludedCompanies: [],
      excludedKeywords: [],
    });

    // ─── Create test admin ───
    const adminRecord = await adminAuth().createUser({
      email: "admin@example.com",
      password: "password123",
      displayName: "Admin User",
      emailVerified: true,
    });

    await adminAuth().setCustomUserClaims(adminRecord.uid, { admin: true });

    await db.collection("users").doc(adminRecord.uid).set({
      id: adminRecord.uid,
      fullName: "Admin User",
      headline: "Platform Admin",
      avatarUrl: "",
      location: "Remote",
      phone: "",
      linkedInUrl: "",
      portfolioUrl: "",
      yearsOfExperience: 0,
      workAuthStatus: "citizen",
      subscriptionTier: "team",
      role: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // ─── Seed resumes for test user ───
    const resume1 = await db.collection("resumes").add({
      userId: userRecord.uid,
      name: "Primary Resume",
      jsonData: {
        basics: {
          name: "Test User",
          label: "Full-Stack Developer",
          email: "user@example.com",
          phone: "+1 555-0100",
          url: "https://testuser.dev",
          summary: "Passionate full-stack developer with 4 years of experience building scalable web applications using React, Node.js, and TypeScript.",
          location: { city: "San Francisco", region: "CA", country: "US" },
          profiles: [
            { network: "LinkedIn", url: "https://linkedin.com/in/testuser", username: "testuser" },
            { network: "GitHub", url: "https://github.com/testuser", username: "testuser" },
          ],
        },
        work: [
          {
            company: "TechCorp",
            role: "Senior Frontend Engineer",
            location: "San Francisco, CA",
            startDate: "2022-01",
            current: true,
            description: "Leading frontend architecture for a SaaS platform serving 50k+ users.",
            highlights: ["Reduced bundle size by 40%", "Migrated to Next.js 14", "Built design system"],
          },
          {
            company: "StartupXYZ",
            role: "Full-Stack Developer",
            location: "Remote",
            startDate: "2020-06",
            endDate: "2021-12",
            current: false,
            description: "Full-stack development for an early-stage fintech startup.",
            highlights: ["Built payment integration", "Launched MVP in 3 months"],
          },
        ],
        education: [
          {
            institution: "University of California, Berkeley",
            degree: "Bachelor of Science",
            field: "Computer Science",
            location: "Berkeley, CA",
            startDate: "2016",
            endDate: "2020",
            current: false,
          },
        ],
        skills: [
          { name: "React", level: "expert" },
          { name: "TypeScript", level: "expert" },
          { name: "Node.js", level: "advanced" },
          { name: "PostgreSQL", level: "advanced" },
          { name: "AWS", level: "intermediate" },
          { name: "Python", level: "intermediate" },
        ],
        projects: [
          {
            name: "Open Source CLI Tool",
            description: "A developer productivity CLI used by 2k+ developers",
            url: "https://github.com/testuser/cli-tool",
            highlights: ["2,000+ GitHub stars", "Featured in Hacker News"],
          },
        ],
      },
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const resume2 = await db.collection("resumes").add({
      userId: userRecord.uid,
      name: "Backend-Focused",
      jsonData: {
        basics: {
          name: "Test User",
          label: "Backend Engineer",
          email: "user@example.com",
          phone: "+1 555-0100",
          summary: "Backend engineer specializing in distributed systems and API design.",
          location: { city: "San Francisco", region: "CA", country: "US" },
        },
        work: [
          {
            company: "TechCorp",
            role: "Senior Frontend Engineer",
            location: "San Francisco, CA",
            startDate: "2022-01",
            current: true,
            description: "Leading frontend architecture for a SaaS platform.",
            highlights: ["Reduced bundle size by 40%"],
          },
        ],
        skills: [
          { name: "Node.js", level: "expert" },
          { name: "PostgreSQL", level: "expert" },
          { name: "Redis", level: "advanced" },
          { name: "Docker", level: "advanced" },
          { name: "Kubernetes", level: "intermediate" },
        ],
      },
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // ─── Seed applications for test user ───
    const applications = [
      { companyName: "Google", roleTitle: "Senior Frontend Engineer", status: "interview", source: "linkedin", daysAgo: 14, location: "Mountain View, CA", remoteType: "hybrid" },
      { companyName: "Stripe", roleTitle: "Full-Stack Developer", status: "applied", source: "greenhouse", daysAgo: 3, location: "Remote", remoteType: "remote" },
      { companyName: "Notion", roleTitle: "Software Engineer", status: "screening", source: "lever", daysAgo: 7, location: "New York, NY", remoteType: "hybrid" },
      { companyName: "Figma", roleTitle: "Frontend Engineer", status: "offer", source: "greenhouse", daysAgo: 21, location: "San Francisco, CA", remoteType: "onsite" },
      { companyName: "Vercel", roleTitle: "Developer Advocate", status: "rejected", source: "direct", daysAgo: 30, location: "Remote", remoteType: "remote" },
      { companyName: "Linear", roleTitle: "Product Engineer", status: "ghosted", source: "linkedin", daysAgo: 45, location: "Remote", remoteType: "remote" },
      { companyName: "OpenAI", roleTitle: "Staff Engineer", status: "applied", source: "indeed", daysAgo: 1, location: "San Francisco, CA", remoteType: "onsite" },
      { companyName: "Anthropic", roleTitle: "ML Engineer", status: "screening", source: "greenhouse", daysAgo: 5, location: "Remote", remoteType: "remote" },
    ];

    for (const app of applications) {
      await db.collection("applications").add({
        userId: userRecord.uid,
        companyName: app.companyName,
        roleTitle: app.roleTitle,
        jobUrl: `https://${app.companyName.toLowerCase()}.com/careers`,
        source: app.source,
        status: app.status,
        appliedAt: new Date(Date.now() - app.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        notes: `Applied via ${app.source}`,
        salaryRange: "$150k - $220k",
        location: app.location,
        remoteType: app.remoteType,
        metadata: {},
      });
    }

    // ─── Seed subscription for test user ───
    await db.collection("subscriptions").doc(userRecord.uid).set({
      userId: userRecord.uid,
      tier: "pro",
      status: "active",
      stripeCustomerId: "cus_test_user",
      stripeSubscriptionId: "sub_test_user",
      currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // ─── Seed usage quota for test user ───
    await db.collection("usageQuotas").doc(`${userRecord.uid}_${new Date().toISOString().slice(0, 7)}`).set({
      userId: userRecord.uid,
      month: new Date().toISOString().slice(0, 7),
      autofillsUsed: 23,
      autofillsCap: 50,
      resumesUsed: 2,
      resumesCap: 10,
      aiTokensUsed: 45000,
      aiTokensCap: 100000,
      tailoredVersionsUsed: 1,
      tailoredVersionsCap: 5,
    });

    return NextResponse.json({
      ok: true,
      users: [
        { uid: userRecord.uid, email: "user@example.com", password: "password123", role: "user" },
        { uid: adminRecord.uid, email: "admin@example.com", password: "password123", role: "admin" },
      ],
      resumes: [resume1.id, resume2.id],
      applications: applications.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Seed failed", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
