import { IssueService } from "../src/services/issue.service";
import type { IIssueRepository } from "../src/repositories/issue.repository";
import type { IssueReport, CreateIssueInput, IssueStatus } from "../src/types/issue.types";
import { AppError } from "../src/utils/AppError";

/**
 * In-memory fake implementing the same contract as the Prisma-backed
 * IssueRepository — mirrors the pattern already established for
 * FakeUserRepository in tests/auth.service.test.ts.
 */
class FakeIssueRepository implements IIssueRepository {
  private issues = new Map<string, IssueReport>();
  private nextId = 1;

  async findById(id: string): Promise<IssueReport | null> {
    return this.issues.get(id) ?? null;
  }

  async findAll(filters?: {
    status?: IssueStatus;
    category?: IssueReport["category"];
    reportedById?: string;
  }): Promise<IssueReport[]> {
    let results = Array.from(this.issues.values());
    if (filters?.status) results = results.filter((i) => i.status === filters.status);
    if (filters?.category) results = results.filter((i) => i.category === filters.category);
    if (filters?.reportedById) {
      results = results.filter((i) => i.reportedById === filters.reportedById);
    }
    return results;
  }

  async create(data: CreateIssueInput): Promise<IssueReport> {
    const issue: IssueReport = {
      id: String(this.nextId++),
      title: data.title,
      description: data.description ?? null,
      category: data.category,
      status: "PENDING",
      latitude: data.latitude,
      longitude: data.longitude,
      imageUrl: data.imageUrl ?? null,
      aiConfidence: data.aiConfidence ?? null,
      reportedById: data.reportedById,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.issues.set(issue.id, issue);
    return issue;
  }

  async updateStatus(id: string, status: IssueStatus): Promise<IssueReport> {
    const issue = this.issues.get(id);
    if (!issue) throw new Error(`No issue found with id ${id}`);
    issue.status = status;
    issue.updatedAt = new Date();
    return issue;
  }

  async delete(id: string): Promise<void> {
    this.issues.delete(id);
  }
}

function buildService(): { service: IssueService; repo: FakeIssueRepository } {
  const repo = new FakeIssueRepository();
  return { service: new IssueService(repo), repo };
}

describe("IssueService.createIssue", () => {
  it("creates an issue with the user-provided category when no image is attached", async () => {
    const { service } = buildService();

    const issue = await service.createIssue({
      title: "Pothole on Main St",
      category: "POTHOLE",
      latitude: 12.9716,
      longitude: 77.5946,
      reportedById: "user-1",
    });

    expect(issue.title).toBe("Pothole on Main St");
    expect(issue.category).toBe("POTHOLE");
    expect(issue.status).toBe("PENDING");
    expect(issue.aiConfidence).toBeNull();
  });

  it("degrades gracefully to the user-provided category when the AI service is unreachable", async () => {
    // No AI service is running in this test environment, and an
    // imageUrl is provided here specifically to exercise that code
    // path — createIssue must still succeed rather than fail the
    // whole request just because AI enrichment isn't available.
    const { service } = buildService();

    const issue = await service.createIssue({
      title: "Garbage pile",
      category: "GARBAGE",
      latitude: 12.9,
      longitude: 77.5,
      imageUrl: "/uploads/does-not-exist.jpg",
      reportedById: "user-1",
    });

    expect(issue.category).toBe("GARBAGE");
    expect(issue.aiConfidence).toBeNull();
  });
});

describe("IssueService.getIssueById", () => {
  it("returns the issue when it exists", async () => {
    const { service, repo } = buildService();
    const created = await repo.create({
      title: "Broken streetlight",
      category: "STREETLIGHT",
      latitude: 1,
      longitude: 1,
      reportedById: "user-1",
    });

    const found = await service.getIssueById(created.id);
    expect(found.id).toBe(created.id);
  });

  it("throws a NotFoundError-derived AppError for an unknown id", async () => {
    const { service } = buildService();
    await expect(service.getIssueById("does-not-exist")).rejects.toThrow(AppError);
  });
});

describe("IssueService.getAllIssues", () => {
  it("passes filters through to the repository", async () => {
    const { service, repo } = buildService();
    await repo.create({
      title: "A",
      category: "POTHOLE",
      latitude: 1,
      longitude: 1,
      reportedById: "user-1",
    });
    await repo.create({
      title: "B",
      category: "GARBAGE",
      latitude: 1,
      longitude: 1,
      reportedById: "user-2",
    });

    const potholes = await service.getAllIssues({ category: "POTHOLE" });
    expect(potholes).toHaveLength(1);
    expect(potholes[0].title).toBe("A");
  });
});

describe("IssueService.updateIssueStatus", () => {
  it("updates the status of an existing issue", async () => {
    const { service, repo } = buildService();
    const created = await repo.create({
      title: "Water leak",
      category: "WATER_LEAKAGE",
      latitude: 1,
      longitude: 1,
      reportedById: "user-1",
    });

    const updated = await service.updateIssueStatus(created.id, "IN_PROGRESS");
    expect(updated.status).toBe("IN_PROGRESS");
  });

  it("throws for a nonexistent issue instead of silently updating nothing", async () => {
    const { service } = buildService();
    await expect(service.updateIssueStatus("does-not-exist", "RESOLVED")).rejects.toThrow(
      AppError,
    );
  });
});

describe("IssueService.deleteIssue", () => {
  it("removes an existing issue", async () => {
    const { service, repo } = buildService();
    const created = await repo.create({
      title: "Damaged sign",
      category: "DAMAGED_SIGNAGE",
      latitude: 1,
      longitude: 1,
      reportedById: "user-1",
    });

    await service.deleteIssue(created.id);
    expect(await repo.findById(created.id)).toBeNull();
  });

  it("throws for a nonexistent issue instead of silently no-oping", async () => {
    const { service } = buildService();
    await expect(service.deleteIssue("does-not-exist")).rejects.toThrow(AppError);
  });
});
