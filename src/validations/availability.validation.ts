import { z } from "zod";

export const getAvailabilitySchema = z.object({
    resource_id: z.string().min(1, "Resource ID is required"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    duration: z.string().transform((val) => Number(val)).refine((val) => !isNaN(val) && val > 0, "Duration must be a positive number in minutes")
});
