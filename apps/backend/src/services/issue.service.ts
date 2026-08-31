import fs from "fs";
import path from "path";
import { IssueRepository, type IIssueRepository } from "@repositories/issue.repository";
import { env } from "@config/env";
import { logger } from "@config/logger";
import { NotFoundError } from "@utils/AppError";
import type {
  IssueReport,
  CreateIssueInput,
  IssueCategory,
  IssueStatus,
} from "@app-types/issue.types";

export class IssueService {
  constructor(private readonly issueRepository: IIssueRepository = new IssueRepository()) {}

  async createIssue(data: CreateIssueInput): Promise<IssueReport> {
    let aiCategory: IssueCategory | undefined;
    let aiConfidence: number | undefined;

    // If an imageUrl is provided, try to call the AI service for classification/confidence
    if (data.imageUrl) {
      try {
        const resolvedPath = this.resolveImagePath(data.imageUrl);
        // ⚡ Bolt Optimization: Replace synchronous fs.existsSync with async fs.promises.readFile + catch
        // This prevents event loop blocking on high traffic endpoints and reduces filesystem syscalls by avoiding a TOCTOU race.
        let fileBuffer: Buffer | null = null;
        if (resolvedPath) {
          try {
            fileBuffer = await fs.promises.readFile(resolvedPath);
          } catch (e: unknown) {
            if (e instanceof Error && (e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
          }
        }

        if (resolvedPath && fileBuffer) {
          const filename = path.basename(resolvedPath);

          // Build native FormData for multipart upload
          const formData = new FormData();
          const blob = new Blob([fileBuffer], { type: "image/jpeg" });
          formData.append("file", blob, filename);

          logger.info(`Sending image ${filename} to AI service at ${env.AI_SERVICE_URL}`);
          const aiResponse = await fetch(`${env.AI_SERVICE_URL}/api/v1/detect`, {
            method: "POST",
            body: formData,
          });

          if (aiResponse.ok) {
            const result = (await aiResponse.json()) as {
              success: boolean;
              detections: Array<{
                label: string;
                confidence: number;
              }>;
            };

            if (result.success && result.detections && result.detections.length > 0) {
              // Find the detection with the highest confidence
              const bestDetection = result.detections.reduce((best, current) =>
                current.confidence > best.confidence ? current : best
              );

              // Map label to IssueCategory
              const mappedCategory = this.mapLabelToCategory(bestDetection.label);
              if (mappedCategory) {
                aiCategory = mappedCategory;
                aiConfidence = bestDetection.confidence;
                logger.info(
                  `AI detection succeeded: mapped to ${aiCategory} with confidence ${aiConfidence}`
                );
              }
            } else {
              logger.info("AI service returned no detections for the image");
            }
          } else {
            logger.warn(`AI service returned status ${aiResponse.status}`);
          }
        } else {
          logger.warn(`Image file does not exist at resolved path: ${resolvedPath}`);
        }
      } catch (err) {
        // Graceful degradation: log error but proceed to create the issue
        logger.error({ err }, "Failed to perform AI detection. Proceeding without AI enrichment.");
      }
    }

    return this.issueRepository.create({
      ...data,
      category: aiCategory ?? data.category,
      aiConfidence,
    });
  }

  async getIssueById(id: string): Promise<IssueReport> {
    const issue = await this.issueRepository.findById(id);
    if (!issue) {
      throw new NotFoundError(`Issue with ID ${id} not found`);
    }
    return issue;
  }

  async getAllIssues(filters?: {
    status?: IssueStatus;
    category?: IssueCategory;
    reportedById?: string;
  }): Promise<IssueReport[]> {
    return this.issueRepository.findAll(filters);
  }

  async updateIssueStatus(id: string, status: IssueStatus): Promise<IssueReport> {
    // Verify issue exists first
    await this.getIssueById(id);
    return this.issueRepository.updateStatus(id, status);
  }

  async deleteIssue(id: string): Promise<void> {
    // Verify issue exists first
    await this.getIssueById(id);
    await this.issueRepository.delete(id);
  }

  private resolveImagePath(imageUrl: string): string | null {
    // If it's a relative uploads path e.g. /uploads/abc.jpg
    if (imageUrl.startsWith("/uploads/")) {
      return path.join(__dirname, "../../../public", imageUrl);
    }
    // If it's an absolute path
    if (path.isAbsolute(imageUrl)) {
      return imageUrl;
    }
    return null;
  }

  private mapLabelToCategory(label: string): IssueCategory | null {
    const normalized = label.toUpperCase().replace(/\s+/g, "_");
    const validCategories: IssueCategory[] = [
      "POTHOLE",
      "GARBAGE",
      "STREETLIGHT",
      "WATER_LEAKAGE",
      "DAMAGED_SIGNAGE",
      "OTHER",
    ];

    if (validCategories.includes(normalized as IssueCategory)) {
      return normalized as IssueCategory;
    }

    // Fallbacks or partial matches
    if (normalized.includes("SIGN")) return "DAMAGED_SIGNAGE";
    if (normalized.includes("WATER") || normalized.includes("LEAK")) return "WATER_LEAKAGE";
    if (normalized.includes("LIGHT")) return "STREETLIGHT";
    if (normalized.includes("TRASH") || normalized.includes("WASTE")) return "GARBAGE";

    return null;
  }
}
