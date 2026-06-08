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
exports.resourceServices = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Resource_1 = require("../../models/Resource");
const Organization_1 = require("../../models/Organization");
const serviceCreateResource = (userId, name, type, organization_id, bufferTimeMinutes) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const orgObjectId = new mongoose_1.default.Types.ObjectId(organization_id);
        // Check if organization exists
        const organization = yield Organization_1.Organization.findById(orgObjectId);
        if (!organization) {
            return { success: false, message: "Organization not found" };
        }
        // Check if user is admin of this organization
        if (organization.admin_id.toString() !== userId) {
            return { success: false, message: "Only organization admin can create resources" };
        }
        // Check if resource name is already taken in this organization
        const existingResource = yield Resource_1.Resource.findOne({
            name,
            organization_id: orgObjectId,
            isDeleted: false
        });
        if (existingResource) {
            return { success: false, message: "Resource name already exists in this organization" };
        }
        const resource = new Resource_1.Resource({
            name,
            type,
            organization_id: orgObjectId,
            bufferTimeMinutes,
            isDeleted: false,
            createdBy: userObjectId
        });
        const savedResource = yield resource.save();
        return {
            success: true,
            data: {
                resource: {
                    id: savedResource._id.toString(),
                    name: savedResource.name,
                    type: savedResource.type,
                    organization_id: savedResource.organization_id.toString(),
                    bufferTimeMinutes: savedResource.bufferTimeMinutes,
                    isDeleted: savedResource.isDeleted,
                    createdBy: savedResource.createdBy.toString()
                }
            }
        };
    }
    catch (error) {
        return { success: false, message: error.message };
    }
});
const serviceGetResourcesByOrganization = (userId, organization_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orgObjectId = new mongoose_1.default.Types.ObjectId(organization_id);
        // Verify organization exists
        const organization = yield Organization_1.Organization.findById(orgObjectId);
        if (!organization) {
            return { success: false, message: "Organization not found" };
        }
        // Verify user is a member of the organization
        const isMember = organization.members.some(member => member.user_id.toString() === userId);
        if (!isMember) {
            return { success: false, message: "You are not a member of this organization" };
        }
        const resources = yield Resource_1.Resource.find({
            organization_id: orgObjectId,
            isDeleted: false
        });
        return {
            success: true,
            data: {
                resources: resources.map(resource => ({
                    id: resource._id.toString(),
                    name: resource.name,
                    type: resource.type,
                    organization_id: resource.organization_id.toString(),
                    bufferTimeMinutes: resource.bufferTimeMinutes,
                    isDeleted: resource.isDeleted,
                    createdBy: resource.createdBy.toString()
                }))
            }
        };
    }
    catch (error) {
        return { success: false, message: error.message };
    }
});
const serviceSoftDeleteResource = (userId, resourceId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resourceObjectId = new mongoose_1.default.Types.ObjectId(resourceId);
        const resource = yield Resource_1.Resource.findById(resourceObjectId);
        if (!resource) {
            return { success: false, message: "Resource not found" };
        }
        // Check if user is admin of this organization
        const organization = yield Organization_1.Organization.findById(resource.organization_id);
        if (!organization) {
            return { success: false, message: "Organization not found" };
        }
        if (organization.admin_id.toString() !== userId) {
            return { success: false, message: "Only organization admin can delete resources" };
        }
        resource.isDeleted = true;
        const savedResource = yield resource.save();
        return {
            success: true,
            data: {
                resource: {
                    id: savedResource._id.toString(),
                    name: savedResource.name,
                    type: savedResource.type,
                    organization_id: savedResource.organization_id.toString(),
                    bufferTimeMinutes: savedResource.bufferTimeMinutes,
                    isDeleted: savedResource.isDeleted,
                    createdBy: savedResource.createdBy.toString()
                }
            }
        };
    }
    catch (error) {
        return { success: false, message: error.message };
    }
});
exports.resourceServices = {
    serviceCreateResource,
    serviceGetResourcesByOrganization,
    serviceSoftDeleteResource
};
