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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
const auth_validation_1 = require("../../validations/auth.validation");
const createNewUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const validatedData = auth_validation_1.signupSchema.parse(req.body);
        const { name, email, password, phone } = validatedData;
        const result = yield auth_service_1.authServices.serviceCreateUser(name, email, password, phone);
        if (!result.success) {
            return res.status(400).send({ success: false, message: result.message });
        }
        res.send(result);
    }
    catch (error) {
        const message = ((_b = (_a = error.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || "Validation error";
        res.status(400).send({ success: false, message });
    }
});
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const validatedData = auth_validation_1.signinSchema.parse(req.body);
        const { email, password } = validatedData;
        const result = yield auth_service_1.authServices.loginUser(email, password);
        if (!result.success) {
            return res.status(400).send({ success: false, message: result.message });
        }
        res.send(result);
    }
    catch (error) {
        const message = ((_b = (_a = error.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || "Validation error";
        res.status(400).send({ success: false, message });
    }
});
exports.authController = {
    createNewUser,
    loginUser
};
