import { z } from "zod";

export const createResourceSchema = z.object({
    name: z.string().min(1, "Resource name is required"),
    type: z.enum(["MEETING_ROOM", "DESK", "DEVICE"]),
    organization_id: z.string().min(1, "Organization ID is required"),
    bufferTimeMinutes: z.number().min(0, "Buffer time must be 0 or more").optional().default(0)
});
