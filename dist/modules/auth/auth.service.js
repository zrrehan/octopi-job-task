"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authServices = void 0;
const User_1 = require("../../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const serviceCreateUser = (name, email, password, phone) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPass = yield bcrypt_1.default.hash(password, 10);
    try {
        const user = new User_1.User({
            name,
            email,
            password: hashedPass,
            phone
        });
        const savedUser = yield user.save();
        const token = jsonwebtoken_1.default.sign({
            userId: savedUser._id.toString(),
            email: savedUser.email
        }, config_1.config.JWT_SECRET_KEY || "", {
            expiresIn: "7d"
        });
        return {
            success: true,
            data: {
                user: {
                    id: savedUser._id.toString(),
                    name: savedUser.name,
                    email: savedUser.email
                },
                token: token
            }
        };
    }
    catch (error) {
        if (error.code === 11000) {
            return { success: false, message: "Email already exists" };
        }
        return { success: false, message: error.message };
    }
});
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.User.findOne({ email });
    if (!user) {
        return { success: false, message: "Email or Password Did not match" };
    }
    const passMatched = yield bcrypt_1.default.compare(password, user.password);
    if (!passMatched) {
        return { success: false, message: "Email or Password Did not match" };
    }
    const token = jsonwebtoken_1.default.sign({
        userId: user._id.toString(),
        email: user.email
    }, config_1.config.JWT_SECRET_KEY || "", {
        expiresIn: "7d"
    });
    return {
        success: true,
        data: {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            },
            token: token
        }
    };
});
exports.authServices = {
    serviceCreateUser,
    loginUser
};
