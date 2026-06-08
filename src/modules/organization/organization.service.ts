import mongoose from "mongoose";
import { Organization } from "../../models/Organization";
import { User } from "../../models/User";

const serviceCreateOrganization = async (
    userId: string,
    name: string,
    timezone: string
) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const organization = new Organization({
            name,
            timezone,
            admin_id: userObjectId,
            members: [
                { user_id: userObjectId, role: "ORG_ADMIN" }
            ]
        });

        const savedOrganization = await organization.save();

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
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const serviceAddUserToOrganization = async (
    adminUserId: string,
    organizationId: string,
    userEmail: string
) => {
    try {
        const orgObjectId = new mongoose.Types.ObjectId(organizationId);
        const adminUserObjectId = new mongoose.Types.ObjectId(adminUserId);

        // Find organization
        const organization = await Organization.findById(orgObjectId);
        if (!organization) {
            return { success: false, message: "Organization not found" };
        }

        // Check if current user is admin of organization
        if (organization.admin_id.toString() !== adminUserId) {
            return { success: false, message: "You are not authorized to add users to this organization" };
        }

        // Find user by email
        const userToAdd = await User.findOne({ email: userEmail });
        if (!userToAdd) {
            return { success: false, message: "User not found" };
        }

        // Check if user is already a member
        const isAlreadyMember = organization.members.some(
            member => member.user_id.toString() === userToAdd._id.toString()
        );
        if (isAlreadyMember) {
            return { success: false, message: "User is already a member of this organization" };
        }

        // Add user as employee
        organization.members.push({
            user_id: userToAdd._id,
            role: "EMPLOYEE"
        });

        const savedOrganization = await organization.save();

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
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

export const organizationServices = {
    serviceCreateOrganization,
    serviceAddUserToOrganization
};
