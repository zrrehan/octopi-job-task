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
exports.organizationController = void 0;
const organization_service_1 = require("./organization.service");
const organization_validation_1 = require("../../validations/organization.validation");
const createOrganization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }
    try {
        const validatedData = organization_validation_1.createOrganizationSchema.parse(req.body);
        const result = yield organization_service_1.organizationServices.serviceCreateOrganization(req.user.userId, validatedData.name, validatedData.timezone);
        if (!result.success) {
            return res.status(400).send(result);
        }
        return res.send(result);
    }
    catch (error) {
        const message = ((_b = (_a = error.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || "Validation error";
        return res.status(400).send({ success: false, message });
    }
});
exports.organizationController = {
    createOrganization
};
