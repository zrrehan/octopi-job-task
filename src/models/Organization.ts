import mongoose, { Document, Schema, Types } from "mongoose";

export interface IWorkingHours {
    start: string; // format "HH:MM"
    end: string; // format "HH:MM"
}

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
    workingHours: IWorkingHours;
    maxBookingDays: number;
}

const OrganizationMemberSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true, enum: ["ORG_ADMIN", "EMPLOYEE"], default: "EMPLOYEE" }
});

const WorkingHoursSchema: Schema = new Schema({
    start: { type: String, required: true, default: "09:00" },
    end: { type: String, required: true, default: "18:00" }
});

const OrganizationSchema: Schema = new Schema({
    name: { type: String, required: true },
    timezone: { type: String, required: true, default: "UTC" },
    isActive: { type: Boolean, required: true, default: true },
    admin_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [OrganizationMemberSchema], required: true, default: [] },
    workingHours: { type: WorkingHoursSchema, required: true, default: { start: "09:00", end: "18:00" } },
    maxBookingDays: { type: Number, required: true, default: 30 }
}, {
    timestamps: true
});

export const Organization = mongoose.model<IOrganization>("Organization", OrganizationSchema);
