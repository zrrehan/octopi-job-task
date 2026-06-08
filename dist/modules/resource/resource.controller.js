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
exports.resourceController = void 0;
const resource_service_1 = require("./resource.service");
const resource_validation_1 = require("../../validations/resource.validation");
const createResource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }
    try {
        const validatedData = resource_validation_1.createResourceSchema.parse(req.body);
        const result = yield resource_service_1.resourceServices.serviceCreateResource(req.user.userId, validatedData.name, validatedData.type, validatedData.organization_id, validatedData.bufferTimeMinutes);
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
const getResourcesByOrganization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }
    try {
        const { organizationId } = req.params;
        const result = yield resource_service_1.resourceServices.serviceGetResourcesByOrganization(req.user.userId, organizationId);
        if (!result.success) {
            return res.status(400).send(result);
        }
        return res.send(result);
    }
    catch (error) {
        return res.status(400).send({ success: false, message: error.message });
    }
});
const softDeleteResource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }
    try {
        const { resourceId } = req.params;
        const result = yield resource_service_1.resourceServices.serviceSoftDeleteResource(req.user.userId, resourceId);
        if (!result.success) {
            return res.status(400).send(result);
        }
        return res.send(result);
    }
    catch (error) {
        return res.status(400).send({ success: false, message: error.message });
    }
});
exports.resourceController = {
    createResource,
    getResourcesByOrganization,
    softDeleteResource
};
