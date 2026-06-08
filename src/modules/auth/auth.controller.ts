import { Request, Response } from "express";
import { authServices } from "./auth.service";
import { signupSchema, signinSchema } from "../../validations/auth.validation";

const createNewUser = async(req: Request, res: Response) => {
    try {
        const validatedData = signupSchema.parse(req.body);
        const { name, email, password, phone } = validatedData;
        const result = await authServices.serviceCreateUser(name, email, password, phone);
        if (!result.success) {
            return res.status(400).send({ success: false, message: result.message });
        }
        res.send(result);
    } catch (error: any) {
        const message = error.issues?.[0]?.message || "Validation error";
        res.status(400).send({ success: false, message });
    }
};

const loginUser = async(req: Request, res: Response) => {
    try {
        const validatedData = signinSchema.parse(req.body);
        const { email, password } = validatedData;
        const result = await authServices.loginUser(email, password);
        if (!result.success) {
            return res.status(400).send({ success: false, message: result.message });
        }
        res.send(result);
    } catch (error: any) {
        const message = error.issues?.[0]?.message || "Validation error";
        res.status(400).send({ success: false, message });
    }
};

export const authController = {
    createNewUser, 
    loginUser
};
