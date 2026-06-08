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
exports.organizationServices = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Organization_1 = require("../../models/Organization");
const User_1 = require("../../models/User");
const serviceCreateOrganization = (userId, name, timezone) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const organization = new Organization_1.Organization({
            name,
            timezone,
            admin_id: userObjectId,
            members: [
                { user_id: userObjectId, role: "ORG_ADMIN" }
            ]
        });
        const savedOrganization = yield organization.save();
        return {
            success: true,
            data: {
                organization: {
                    id: savedOrganization._id.toString(),
                    name: savedOrganization.name,
                    timezone: savedOrganization.timezone,
                    isActive: savedOrganization.isActive,
                    admin_id: savedOrganization.admin_id.toString(),
                    members: savedOrganization.members.map(member => ({
                        user_id: member.user_id.toString(),
                        role: member.role
                    }))
                }
            }
        };
    }
    catch (error) {
        return { success: false, message: error.message };
    }
});
const serviceAddUserToOrganization = (adminUserId, organizationId, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orgObjectId = new mongoose_1.default.Types.ObjectId(organizationId);
        const adminUserObjectId = new mongoose_1.default.Types.ObjectId(adminUserId);
        // Find organization
        const organization = yield Organization_1.Organization.findById(orgObjectId);
        if (!organization) {
            return { success: false, message: "Organization not found" };
        }
        // Check if current user is admin of organization
        if (organization.admin_id.toString() !== adminUserId) {
            return { success: false, message: "You are not authorized to add users to this organization" };
        }
        // Find user by email
        const userToAdd = yield User_1.User.findOne({ email: userEmail });
        if (!userToAdd) {
            return { success: false, message: "User not found" };
        }
        // Check if user is already a member
        const isAlreadyMember = organization.members.some(member => member.user_id.toString() === userToAdd._id.toString());
        if (isAlreadyMember) {
            return { success: false, message: "User is already a member of this organization" };
        }
        // Add user as employee
        organization.members.push({
            user_id: userToAdd._id,
            role: "EMPLOYEE"
        });
        const savedOrganization = yield organization.save();
        return {
            success: true,
            data: {
                organization: {
                    id: savedOrganization._id.toString(),
                    name: savedOrganization.name,
                    timezone: savedOrganization.timezone,
                    isActive: savedOrganization.isActive,
                    admin_id: savedOrganization.admin_id.toString(),
                    members: savedOrganization.members.map(member => ({
                        user_id: member.user_id.toString(),
                        role: member.role
                    }))
                }
            }
        };
    }
    catch (error) {
        return { success: false, message: error.message };
    }
});
exports.organizationServices = {
    serviceCreateOrganization,
    serviceAddUserToOrganization
};
