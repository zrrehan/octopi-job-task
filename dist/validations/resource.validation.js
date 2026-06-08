"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResourceSchema = void 0;
const zod_1 = require("zod");
exports.createResourceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Resource name is required"),
    type: zod_1.z.enum(["MEETING_ROOM", "DESK", "DEVICE"]),
    organization_id: zod_1.z.string().min(1, "Organization ID is required"),
    bufferTimeMinutes: zod_1.z.number().min(0, "Buffer time must be 0 or more").optional().default(0)
});
