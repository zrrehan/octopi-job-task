import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBooking extends Document {
    resource_id: Types.ObjectId;
    organization_id: Types.ObjectId;
    user_id: Types.ObjectId;
    start_time: Date;
    end_time: Date;
    status: "CONFIRMED" | "CANCELLED";
}

const BookingSchema: Schema = new Schema({
    resource_id: { type: Schema.Types.ObjectId, ref: "Resource", required: true },
    organization_id: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    status: { type: String, required: true, enum: ["CONFIRMED", "CANCELLED"], default: "CONFIRMED" }
}, {
    timestamps: true
});

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
