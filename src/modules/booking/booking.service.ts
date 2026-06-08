import mongoose from "mongoose";
import { DateTime, Duration } from "luxon";
import { Resource } from "../../models/Resource";
import { Organization } from "../../models/Organization";
import { Booking } from "../../models/Booking";

interface Slot {
    start: string;
    end: string;
    available: boolean;
}

const serviceGetAvailability = async (
    resourceId: string,
    dateStr: string,
    duration: number
) => {
    try {
        const resource = await Resource.findById(new mongoose.Types.ObjectId(resourceId));
        if (!resource || resource.isDeleted) {
            return { success: false, message: "Resource not found or deleted" };
        }

        const org = await Organization.findById(resource.organization_id);
        if (!org) {
            return { success: false, message: "Organization not found" };
        }

        if (!org.workingHours.start || !org.workingHours.end) {
            return { success: false, message: "Organization has no working hours configured" };
        }

        const nowOrg = DateTime.now().setZone(org.timezone);
        const requestedDate = DateTime.fromISO(dateStr, { zone: org.timezone }).startOf("day");
        if (requestedDate < nowOrg.startOf("day")) {
            return { success: false, message: "Cannot book a date in the past" };
        }
        const maxDate = nowOrg.plus({ days: org.maxBookingDays });
        if (requestedDate > maxDate.endOf("day")) {
            return { success: false, message: `Cannot book more than ${org.maxBookingDays} days in advance` };
        }

        const [startHour, startMin] = org.workingHours.start.split(":").map(Number);
        const [endHour, endMin] = org.workingHours.end.split(":").map(Number);
        const workStart = requestedDate.set({ hour: startHour, minute: startMin, second: 0, millisecond: 0 });
        const workEnd = requestedDate.set({ hour: endHour, minute: endMin, second: 0, millisecond: 0 });

        const dayStartUTC = requestedDate.startOf("day").toUTC();
        const dayEndUTC = requestedDate.endOf("day").toUTC();
        const bookings = await Booking.find({
            resource_id: resource._id,
            status: "CONFIRMED",
            $and: [
                { start_time: { $lt: dayEndUTC.toJSDate() } },
                { end_time: { $gt: dayStartUTC.toJSDate() } }
            ]
        });

        // Store slot dates as DateTime objects to avoid re-parsing
        const slots: (Slot & { slotStart: DateTime, slotEnd: DateTime })[] = [];
        let currentStart = workStart;
        const durationDuration = Duration.fromObject({ minutes: duration });
        while (currentStart.plus(durationDuration) <= workEnd) {
            const currentEnd = currentStart.plus(durationDuration);
            slots.push({
                start: currentStart.toFormat("HH:mm"),
                end: currentEnd.toFormat("HH:mm"),
                available: true,
                slotStart: currentStart,
                slotEnd: currentEnd
            });
            currentStart = currentEnd;
        }

        const now = DateTime.now().setZone(org.timezone);
        for (let slot of slots) {
            const slotStart = slot.slotStart;
            const slotEnd = slot.slotEnd;

            if (requestedDate.hasSame(nowOrg, "day")) {
                if (slotEnd < now) {
                    slot.available = false;
                    continue;
                }
            }

            for (let booking of bookings) {
                const bookingStartOrg = DateTime.fromJSDate(booking.start_time).setZone(org.timezone);
                const bookingEndOrg = DateTime.fromJSDate(booking.end_time).setZone(org.timezone);
                const bufferEndOrg = bookingEndOrg.plus({ minutes: resource.bufferTimeMinutes });

                const overlaps = (slotStart < bookingEndOrg) && (slotEnd > bookingStartOrg);
                if (overlaps) {
                    slot.available = false;
                    break;
                }
                const bufferOverlaps = (slotStart < bufferEndOrg) && (slotEnd > bookingEndOrg);
                if (bufferOverlaps) {
                    slot.available = false;
                    break;
                }
            }
        }

        // Strip out temporary properties before returning
        const cleanSlots = slots.map(({ slotStart, slotEnd, ...cleanSlot }) => cleanSlot);
        return { success: true, data: cleanSlots };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const serviceCreateBooking = async (
    userId: string,
    resourceId: string,
    dateStr: string,
    startTimeStr: string,
    durationMinutes: number
) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const resourceObjectId = new mongoose.Types.ObjectId(resourceId);

        const resource = await Resource.findById(resourceObjectId);
        if (!resource || resource.isDeleted) {
            return { success: false, message: "Resource not found or deleted" };
        }

        const org = await Organization.findById(resource.organization_id);
        if (!org) {
            return { success: false, message: "Organization not found" };
        }

        const isMember = org.members.some(m => m.user_id.toString() === userId);
        if (!isMember) {
            return { success: false, message: "You are not a member of this organization" };
        }

        const nowOrg = DateTime.now().setZone(org.timezone);
        const requestedDate = DateTime.fromISO(dateStr, { zone: org.timezone }).startOf("day");
        const [startHour, startMin] = startTimeStr.split(":").map(Number);
        const slotStart = requestedDate.set({ hour: startHour, minute: startMin, second: 0, millisecond: 0 });
        const slotEnd = slotStart.plus({ minutes: durationMinutes });

        const [workHour, workMin] = org.workingHours.start.split(":").map(Number);
        const [workEndHour, workEndMin] = org.workingHours.end.split(":").map(Number);
        const workStart = requestedDate.set({ hour: workHour, minute: workMin, second: 0, millisecond: 0 });
        const workEnd = requestedDate.set({ hour: workEndHour, minute: workEndMin, second: 0, millisecond: 0 });
        if (slotStart < workStart || slotEnd > workEnd) {
            return { success: false, message: "Slot is outside working hours" };
        }

        if (slotEnd < nowOrg) {
            return { success: false, message: "Cannot book a past slot" };
        }

        const dayStartUTC = requestedDate.startOf("day").toUTC();
        const dayEndUTC = requestedDate.endOf("day").toUTC();
        const existingBookings = await Booking.find({
            resource_id: resourceObjectId,
            status: "CONFIRMED",
            $and: [
                { start_time: { $lt: dayEndUTC.toJSDate() } },
                { end_time: { $gt: dayStartUTC.toJSDate() } }
            ]
        });

        const slotStartUTC = slotStart.toUTC();
        const slotEndUTC = slotEnd.toUTC();
        for (let booking of existingBookings) {
            const bookingStart = DateTime.fromJSDate(booking.start_time);
            const bookingEnd = DateTime.fromJSDate(booking.end_time);
            const bufferEnd = bookingEnd.plus({ minutes: resource.bufferTimeMinutes });

            const bookingOverlap = (slotStartUTC < bookingEnd) && (slotEndUTC > bookingStart);
            if (bookingOverlap) {
                return { success: false, message: "Slot is already booked" };
            }

            const bufferOverlap = (slotStartUTC < bufferEnd) && (slotEndUTC > bookingEnd);
            if (bufferOverlap) {
                return { success: false, message: "Slot conflicts with a booking's buffer time" };
            }
        }

        const booking = new Booking({
            user_id: userObjectId,
            resource_id: resourceObjectId,
            organization_id: resource.organization_id,
            start_time: slotStartUTC.toJSDate(),
            end_time: slotEndUTC.toJSDate(),
            status: "CONFIRMED"
        });

        const savedBooking = await booking.save();

        return {
            success: true,
            data: {
                booking: {
                    id: savedBooking._id.toString(),
                    resource_id: savedBooking.resource_id.toString(),
                    organization_id: savedBooking.organization_id.toString(),
                    user_id: savedBooking.user_id.toString(),
                    start_time: DateTime.fromJSDate(savedBooking.start_time).toISO(),
                    end_time: DateTime.fromJSDate(savedBooking.end_time).toISO(),
                    status: savedBooking.status
                }
            }
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const serviceGetMyBookings = async (userId: string) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const bookings = await Booking.find({ user_id: userObjectId, status: { $ne: "CANCELLED" } });

        return {
            success: true,
            data: {
                bookings: bookings.map(booking => ({
                    id: booking._id.toString(),
                    resource_id: booking.resource_id.toString(),
                    organization_id: booking.organization_id.toString(),
                    user_id: booking.user_id.toString(),
                    start_time: DateTime.fromJSDate(booking.start_time).toISO(),
                    end_time: DateTime.fromJSDate(booking.end_time).toISO(),
                    status: booking.status
                }))
            }
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const serviceCancelBooking = async (userId: string, bookingId: string) => {
    try {
        const bookingObjectId = new mongoose.Types.ObjectId(bookingId);
        const booking = await Booking.findById(bookingObjectId);
        if (!booking) {
            return { success: false, message: "Booking not found" };
        }

        if (booking.user_id.toString() !== userId) {
            return { success: false, message: "You are not authorized to cancel this booking" };
        }

        if (booking.status === "CANCELLED") {
            return { success: false, message: "Booking is already cancelled" };
        }

        booking.status = "CANCELLED";
        const savedBooking = await booking.save();

        return {
            success: true,
            data: {
                booking: {
                    id: savedBooking._id.toString(),
                    resource_id: savedBooking.resource_id.toString(),
                    organization_id: savedBooking.organization_id.toString(),
                    user_id: savedBooking.user_id.toString(),
                    start_time: DateTime.fromJSDate(savedBooking.start_time).toISO(),
                    end_time: DateTime.fromJSDate(savedBooking.end_time).toISO(),
                    status: savedBooking.status
                }
            }
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

export const bookingServices = {
    serviceGetAvailability,
    serviceCreateBooking,
    serviceGetMyBookings,
    serviceCancelBooking
};
