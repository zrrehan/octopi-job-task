"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingSchema = exports.getAvailabilitySchema = void 0;
const zod_1 = require("zod");
exports.getAvailabilitySchema = zod_1.z.object({
    resource_id: zod_1.z.string().min(1, "Resource ID is required"),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    duration: zod_1.z.string().transform((val) => Number(val)).refine((val) => !isNaN(val) && val > 0, "Duration must be a positive number in minutes")
});
exports.createBookingSchema = zod_1.z.object({
    resource_id: zod_1.z.string().min(1, "Resource ID is required"),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    start_time: zod_1.z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
    duration_minutes: zod_1.z.number().min(1, "Duration must be at least 1 minute")
});
