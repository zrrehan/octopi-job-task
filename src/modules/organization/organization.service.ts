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

export const organizationServices = {
    serviceCreateOrganization
};
