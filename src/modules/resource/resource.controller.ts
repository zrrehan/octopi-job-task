import { Request, Response } from "express";
import { IAuthUser } from "../../types/index";
import { resourceServices } from "./resource.service";
import { createResourceSchema } from "../../validations/resource.validation";

interface AuthRequest extends Request {
    user?: IAuthUser;
}

const createResource = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }
    try {
        const validatedData = createResourceSchema.parse(req.body);
        const result = await resourceServices.serviceCreateResource(
            req.user.userId,
            validatedData.name,
            validatedData.type,
            validatedData.organization_id,
            validatedData.bufferTimeMinutes
        );
        if (!result.success) {
            return res.status(400).send(result);
        }
        return res.send(result);
    } catch (error: any) {
        const message = error.issues?.[0]?.message || "Validation error";
        return res.status(400).send({ success: false, message });
    }
};

const getResourcesByOrganization = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }
    try {
        const { organizationId } = req.params as { organizationId: string };
        const result = await resourceServices.serviceGetResourcesByOrganization(
            req.user.userId,
            organizationId
        );
        if (!result.success) {
            return res.status(400).send(result);
        }
        return res.send(result);
    } catch (error: any) {
        return res.status(400).send({ success: false, message: error.message });
    }
};

const softDeleteResource = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }
    try {
        const { resourceId } = req.params as { resourceId: string };
        const result = await resourceServices.serviceSoftDeleteResource(
            req.user.userId,
            resourceId
        );
        if (!result.success) {
            return res.status(400).send(result);
        }
        return res.send(result);
    } catch (error: any) {
        return res.status(400).send({ success: false, message: error.message });
    }
};

export const resourceController = {
    createResource,
    getResourcesByOrganization,
    softDeleteResource
};
