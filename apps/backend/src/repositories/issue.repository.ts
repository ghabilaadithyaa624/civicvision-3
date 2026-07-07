import { getPrismaClient } from "@database/index";
import type {
  IssueReport,
  CreateIssueInput,
  IssueCategory,
  IssueStatus,
} from "@app-types/issue.types";

interface PrismaIssueReportRow {
  id: string;
  title: string;
  description: string | null;
  category: string; // from Prisma enum
  status: string; // from Prisma enum
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  aiConfidence: number | null;
  reportedById: string;
  createdAt: Date;
  updatedAt: Date;
}

function toIssueReport(row: PrismaIssueReportRow): IssueReport {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as IssueCategory,
    status: row.status as IssueStatus,
    latitude: row.latitude,
    longitude: row.longitude,
    imageUrl: row.imageUrl,
    aiConfidence: row.aiConfidence,
    reportedById: row.reportedById,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export interface IIssueRepository {
  findById(id: string): Promise<IssueReport | null>;
  findAll(filters?: {
    status?: IssueStatus;
    category?: IssueCategory;
    reportedById?: string;
  }): Promise<IssueReport[]>;
  create(data: CreateIssueInput): Promise<IssueReport>;
  updateStatus(id: string, status: IssueStatus): Promise<IssueReport>;
  delete(id: string): Promise<void>;
}

export class IssueRepository implements IIssueRepository {
  constructor(private readonly prisma: ReturnType<typeof getPrismaClient> = getPrismaClient()) {}

  async findById(id: string): Promise<IssueReport | null> {
    const row = (await this.prisma.issueReport.findUnique({
      where: { id },
    })) as PrismaIssueReportRow | null;
    return row ? toIssueReport(row) : null;
  }

  async findAll(filters?: {
    status?: IssueStatus;
    category?: IssueCategory;
    reportedById?: string;
  }): Promise<IssueReport[]> {
    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;
    if (filters?.reportedById) where.reportedById = filters.reportedById;

    const rows = (await this.prisma.issueReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })) as PrismaIssueReportRow[];

    return rows.map(toIssueReport);
  }

  async create(data: CreateIssueInput): Promise<IssueReport> {
    const row = (await this.prisma.issueReport.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        category: data.category,
        latitude: data.latitude,
        longitude: data.longitude,
        imageUrl: data.imageUrl ?? null,
        aiConfidence: data.aiConfidence ?? null,
        reportedById: data.reportedById,
      },
    })) as PrismaIssueReportRow;

    return toIssueReport(row);
  }

  async updateStatus(id: string, status: IssueStatus): Promise<IssueReport> {
    const row = (await this.prisma.issueReport.update({
      where: { id },
      data: { status },
    })) as PrismaIssueReportRow;

    return toIssueReport(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.issueReport.delete({
      where: { id },
    });
  }
}
