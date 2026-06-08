import { Request, Response } from "express";
import { IAuthUser } from "../../types/index";
import { bookingServices } from "./booking.service";
import { getAvailabilitySchema, createBookingSchema } from "../../validations/booking.validation";

interface AuthRequest extends Request {
    user?: IAuthUser;
}

const getAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const validatedData = getAvailabilitySchema.parse(req.query);
        const result = await bookingServices.serviceGetAvailability(
            validatedData.resource_id,
            validatedData.date,
            validatedData.duration
        );
        if (!result.success) {
            return res.status(400).send(result);
        }
        return res.send(result);
    } catch (error: any) {
        const message = error.issues?.[0]?.message || "Validation error";
        return res.status(400).send({ success: false, message });
    }
};

const createBooking = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }
    try {
        const validatedData = createBookingSchema.parse(req.body);
        const result = await bookingServices.serviceCreateBooking(
            req.user.userId,
            validatedData.resource_id,
            validatedData.date,
            validatedData.start_time,
            validatedData.duration_minutes
        );
        if (!result.success) {
            return res.status(400).send(result);
        }
        return res.send(result);
    } catch (error: any) {
        const message = error.issues?.[0]?.message || "Validation error";
        return res.status(400).send({ success: false, message });
    }
};

const getMyBookings = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }
    try {
        const result = await bookingServices.serviceGetMyBookings(req.user.userId);
        if (!result.success) {
            return res.status(400).send(result);
        }
        return res.send(result);
    } catch (error: any) {
        return res.status(400).send({ success: false, message: error.message });
    }
};

const cancelBooking = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }
    try {
        const { bookingId } = req.params as { bookingId: string };
        const result = await bookingServices.serviceCancelBooking(req.user.userId, bookingId);
        if (!result.success) {
            return res.status(400).send(result);
        }
        return res.send(result);
    } catch (error: any) {
        return res.status(400).send({ success: false, message: error.message });
    }
};

export const bookingController = {
    getAvailability,
    createBooking,
    getMyBookings,
    cancelBooking
};
