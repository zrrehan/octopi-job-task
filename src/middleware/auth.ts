import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken";
import { config } from "../config";
import { IAuthUser } from "../types/index";

interface AuthRequest extends Request {
    user?: IAuthUser
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const bearerToken = req.headers.authorization || "";
    let token = "";
    if (bearerToken !== "") {
        token = bearerToken.split(" ")[1] as string;
    } else {
        return res.status(401).send({ success: false, message: "Unauthorized: No token provided" });
    }
    try {
        const decodedToken = jwt.verify(token, config.JWT_SECRET_KEY as string) as IAuthUser;
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(401).send({ success: false, message: "Unauthorized: Invalid token" });
    }
};