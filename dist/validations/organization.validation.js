"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUserToOrgSchema = exports.createOrganizationSchema = void 0;
const zod_1 = require("zod");
exports.createOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Organization name is required"),
    timezone: zod_1.z.string().optional().default("UTC")
});
exports.addUserToOrgSchema = zod_1.z.object({
    organizationId: zod_1.z.string().min(1, "Organization ID is required"),
    userEmail: zod_1.z.string().email("Invalid email format")
});
