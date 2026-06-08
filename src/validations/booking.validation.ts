import { z } from "zod";

export const getAvailabilitySchema = z.object({
    resource_id: z.string().min(1, "Resource ID is required"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    duration: z.string().transform((val) => Number(val)).refine((val) => !isNaN(val) && val > 0, "Duration must be a positive number in minutes")
});

export const createBookingSchema = z.object({
    resource_id: z.string().min(1, "Resource ID is required"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
    duration_minutes: z.number().min(1, "Duration must be at least 1 minute")
});
