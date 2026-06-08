import mongoose, { Document, Schema, Types } from "mongoose";

export interface IResource extends Document {
    name: string;
    type: "MEETING_ROOM" | "DESK" | "DEVICE";
    organization_id: Types.ObjectId;
    bufferTimeMinutes: number;
    isDeleted: boolean;
    createdBy: Types.ObjectId;
}

const ResourceSchema: Schema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ["MEETING_ROOM", "DESK", "DEVICE"] },
    organization_id: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    bufferTimeMinutes: { type: Number, required: true, default: 0 },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, {
    timestamps: true
});

export const Resource = mongoose.model<IResource>("Resource", ResourceSchema);
