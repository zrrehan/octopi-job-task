import { z } from "zod";

export const createOrganizationSchema = z.object({
    name: z.string().min(1, "Organization name is required"),
    timezone: z.string().optional().default("UTC")
});

export const addUserToOrgSchema = z.object({
    organizationId: z.string().min(1, "Organization ID is required"),
    userEmail: z.string().email("Invalid email format")
});
