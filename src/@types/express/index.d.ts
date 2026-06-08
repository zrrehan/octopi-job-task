import { Request } from "express";
import { IAuthUser } from "../../types/index";

declare global {
    namespace Express {
        interface Request {
            user?: IAuthUser;
        }
    }
}

export {};
