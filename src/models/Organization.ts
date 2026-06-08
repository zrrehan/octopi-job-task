import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrganizationMember {
    user_id: Types.ObjectId;
    role: "ORG_ADMIN" | "EMPLOYEE";
}

export interface IOrganization extends Document {
    name: string;
    timezone: string;
    isActive: boolean;
    admin_id: Types.ObjectId;
    members: IOrganizationMember[];
}

const OrganizationMemberSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true, enum: ["ORG_ADMIN", "EMPLOYEE"], default: "EMPLOYEE" }
});

const OrganizationSchema: Schema = new Schema({
    name: { type: String, required: true },
    timezone: { type: String, required: true, default: "UTC" },
    isActive: { type: Boolean, required: true, default: true },
    admin_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [OrganizationMemberSchema], required: true, default: [] }
}, {
    timestamps: true
});

export const Organization = mongoose.model<IOrganization>("Organization", OrganizationSchema);
