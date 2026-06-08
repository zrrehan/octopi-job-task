"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const auth = (req, res, next) => {
    const bearerToken = req.headers.authorization || "";
    let token = "";
    if (bearerToken !== "") {
        token = bearerToken.split(" ")[1];
    }
    else {
        return res.status(401).send({ success: false, message: "Unauthorized: No token provided" });
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET_KEY);
        req.user = decodedToken;
        next();
    }
    catch (error) {
        return res.status(401).send({ success: false, message: "Unauthorized: Invalid token" });
    }
};
exports.auth = auth;
