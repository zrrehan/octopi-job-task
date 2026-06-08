import mongoose from "mongoose";
import { Resource } from "../../models/Resource";
import { Organization } from "../../models/Organization";

const serviceCreateResource = async (
    userId: string,
    name: string,
    type: "MEETING_ROOM" | "DESK" | "DEVICE",
    organization_id: string,
    bufferTimeMinutes: number
) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const orgObjectId = new mongoose.Types.ObjectId(organization_id);

        // Check if organization exists
        const organization = await Organization.findById(orgObjectId);
        if (!organization) {
            return { success: false, message: "Organization not found" };
        }

        // Check if user is admin of this organization
        if (organization.admin_id.toString() !== userId) {
            return { success: false, message: "Only organization admin can create resources" };
        }

        // Check if resource name is already taken in this organization
        const existingResource = await Resource.findOne({
            name,
            organization_id: orgObjectId,
            isDeleted: false
        });
        if (existingResource) {
            return { success: false, message: "Resource name already exists in this organization" };
        }

        const resource = new Resource({
            name,
            type,
            organization_id: orgObjectId,
            bufferTimeMinutes,
            isDeleted: false,
            createdBy: userObjectId
        });

        const savedResource = await resource.save();

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
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const serviceGetResourcesByOrganization = async (
    userId: string,
    organization_id: string
) => {
    try {
        const orgObjectId = new mongoose.Types.ObjectId(organization_id);

        // Verify organization exists
        const organization = await Organization.findById(orgObjectId);
        if (!organization) {
            return { success: false, message: "Organization not found" };
        }

        // Verify user is a member of the organization
        const isMember = organization.members.some(
            member => member.user_id.toString() === userId
        );
        if (!isMember) {
            return { success: false, message: "You are not a member of this organization" };
        }

        const resources = await Resource.find({
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
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const serviceSoftDeleteResource = async (
    userId: string,
    resourceId: string
) => {
    try {
        const resourceObjectId = new mongoose.Types.ObjectId(resourceId);

        const resource = await Resource.findById(resourceObjectId);
        if (!resource) {
            return { success: false, message: "Resource not found" };
        }

        // Check if user is admin of this organization
        const organization = await Organization.findById(resource.organization_id);
        if (!organization) {
            return { success: false, message: "Organization not found" };
        }
        if (organization.admin_id.toString() !== userId) {
            return { success: false, message: "Only organization admin can delete resources" };
        }

        resource.isDeleted = true;
        const savedResource = await resource.save();

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
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

export const resourceServices = {
    serviceCreateResource,
    serviceGetResourcesByOrganization,
    serviceSoftDeleteResource
};
