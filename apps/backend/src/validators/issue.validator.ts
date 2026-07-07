import { z } from "zod";

const categories = [
  "POTHOLE",
  "GARBAGE",
  "STREETLIGHT",
  "WATER_LEAKAGE",
  "DAMAGED_SIGNAGE",
  "OTHER",
] as const;

const statuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"] as const;

export const createIssueSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    description: z.string().optional(),
    category: z.enum(categories, {
      errorMap: () => ({ message: "Invalid issue category" }),
    }),
    latitude: z.coerce
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
    longitude: z.coerce
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
    imageUrl: z.string().optional(),
  }),
});

export const updateIssueStatusSchema = z.object({
  body: z.object({
    status: z.enum(statuses, {
      errorMap: () => ({ message: "Invalid issue status" }),
    }),
  }),
});
