import { Request, Response } from "express";
import { IAuthUser } from "../../types/index";
interface AuthRequest extends Request {
    user?: IAuthUser;
}
import { organizationServices } from "./organization.service";
import { createOrganizationSchema, addUserToOrgSchema } from "../../validations/organization.validation";

const createOrganization = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }
    try {
        const validatedData = createOrganizationSchema.parse(req.body);
        const result = await organizationServices.serviceCreateOrganization(
            req.user.userId,
            validatedData.name,
            validatedData.timezone
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

const addUserToOrganization = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }
    try {
        const validatedData = addUserToOrgSchema.parse(req.body);
        const result = await organizationServices.serviceAddUserToOrganization(
            req.user.userId,
            validatedData.organizationId,
            validatedData.userEmail
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

export const organizationController = {
    createOrganization,
    addUserToOrganization
};
