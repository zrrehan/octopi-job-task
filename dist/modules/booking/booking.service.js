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
exports.bookingServices = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const luxon_1 = require("luxon");
const Resource_1 = require("../../models/Resource");
const Organization_1 = require("../../models/Organization");
const Booking_1 = require("../../models/Booking");
const serviceGetAvailability = (resourceId, dateStr, duration) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resource = yield Resource_1.Resource.findById(new mongoose_1.default.Types.ObjectId(resourceId));
        if (!resource || resource.isDeleted) {
            return { success: false, message: "Resource not found or deleted" };
        }
        const org = yield Organization_1.Organization.findById(resource.organization_id);
        if (!org) {
            return { success: false, message: "Organization not found" };
        }
        if (!org.workingHours.start || !org.workingHours.end) {
            return { success: false, message: "Organization has no working hours configured" };
        }
        const nowOrg = luxon_1.DateTime.now().setZone(org.timezone);
        const requestedDate = luxon_1.DateTime.fromFormat(dateStr, "yyyy-MM-dd").setZone(org.timezone).startOf("day");
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
        const dayStartUTC = workStart.toUTC();
        const dayEndUTC = workEnd.toUTC();
        const bookings = yield Booking_1.Booking.find({
            resource_id: resource._id,
            status: "CONFIRMED",
            start_time: { $gte: dayStartUTC.toJSDate(), $lt: dayEndUTC.toJSDate() }
        });
        const slots = [];
        let currentStart = workStart;
        const durationDuration = luxon_1.Duration.fromObject({ minutes: duration });
        while (currentStart.plus(durationDuration) <= workEnd) {
            const currentEnd = currentStart.plus(durationDuration);
            slots.push({
                start: currentStart.toFormat("HH:mm"),
                end: currentEnd.toFormat("HH:mm"),
                available: true
            });
            currentStart = currentEnd;
        }
        const now = luxon_1.DateTime.now().setZone(org.timezone);
        for (let slot of slots) {
            const slotStart = luxon_1.DateTime.fromFormat(slot.start, "HH:mm").setZone(org.timezone).set({
                year: requestedDate.year,
                month: requestedDate.month,
                day: requestedDate.day
            });
            const slotEnd = luxon_1.DateTime.fromFormat(slot.end, "HH:mm").setZone(org.timezone).set({
                year: requestedDate.year,
                month: requestedDate.month,
                day: requestedDate.day
            });
            if (requestedDate.hasSame(nowOrg, "day")) {
                if (slotEnd < now) {
                    slot.available = false;
                    continue;
                }
            }
            for (let booking of bookings) {
                const bookingStartOrg = luxon_1.DateTime.fromJSDate(booking.start_time).setZone(org.timezone);
                const bookingEndOrg = luxon_1.DateTime.fromJSDate(booking.end_time).setZone(org.timezone);
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
        return { success: true, data: slots };
    }
    catch (error) {
        return { success: false, message: error.message };
    }
});
const serviceCreateBooking = (userId, resourceId, dateStr, startTimeStr, durationMinutes) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const resourceObjectId = new mongoose_1.default.Types.ObjectId(resourceId);
        const resource = yield Resource_1.Resource.findById(resourceObjectId);
        if (!resource || resource.isDeleted) {
            return { success: false, message: "Resource not found or deleted" };
        }
        const org = yield Organization_1.Organization.findById(resource.organization_id);
        if (!org) {
            return { success: false, message: "Organization not found" };
        }
        const isMember = org.members.some(m => m.user_id.toString() === userId);
        if (!isMember) {
            return { success: false, message: "You are not a member of this organization" };
        }
        const nowOrg = luxon_1.DateTime.now().setZone(org.timezone);
        const requestedDate = luxon_1.DateTime.fromFormat(dateStr, "yyyy-MM-dd").setZone(org.timezone).startOf("day");
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
        const dayStartUTC = workStart.toUTC();
        const dayEndUTC = workEnd.toUTC();
        const existingBookings = yield Booking_1.Booking.find({
            resource_id: resourceObjectId,
            status: "CONFIRMED",
            start_time: { $gte: dayStartUTC.toJSDate(), $lt: dayEndUTC.toJSDate() }
        });
        const slotStartUTC = slotStart.toUTC();
        const slotEndUTC = slotEnd.toUTC();
        for (let booking of existingBookings) {
            const bookingStart = luxon_1.DateTime.fromJSDate(booking.start_time);
            const bookingEnd = luxon_1.DateTime.fromJSDate(booking.end_time);
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
        const booking = new Booking_1.Booking({
            user_id: userObjectId,
            resource_id: resourceObjectId,
            organization_id: resource.organization_id,
            start_time: slotStartUTC.toJSDate(),
            end_time: slotEndUTC.toJSDate(),
            status: "CONFIRMED"
        });
        const savedBooking = yield booking.save();
        return {
            success: true,
            data: {
                booking: {
                    id: savedBooking._id.toString(),
                    resource_id: savedBooking.resource_id.toString(),
                    organization_id: savedBooking.organization_id.toString(),
                    user_id: savedBooking.user_id.toString(),
                    start_time: luxon_1.DateTime.fromJSDate(savedBooking.start_time).toISO(),
                    end_time: luxon_1.DateTime.fromJSDate(savedBooking.end_time).toISO(),
                    status: savedBooking.status
                }
            }
        };
    }
    catch (error) {
        return { success: false, message: error.message };
    }
});
const serviceGetMyBookings = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const bookings = yield Booking_1.Booking.find({ user_id: userObjectId, status: { $ne: "CANCELLED" } });
        return {
            success: true,
            data: {
                bookings: bookings.map(booking => ({
                    id: booking._id.toString(),
                    resource_id: booking.resource_id.toString(),
                    organization_id: booking.organization_id.toString(),
                    user_id: booking.user_id.toString(),
                    start_time: luxon_1.DateTime.fromJSDate(booking.start_time).toISO(),
                    end_time: luxon_1.DateTime.fromJSDate(booking.end_time).toISO(),
                    status: booking.status
                }))
            }
        };
    }
    catch (error) {
        return { success: false, message: error.message };
    }
});
const serviceCancelBooking = (userId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingObjectId = new mongoose_1.default.Types.ObjectId(bookingId);
        const booking = yield Booking_1.Booking.findById(bookingObjectId);
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
        const savedBooking = yield booking.save();
        return {
            success: true,
            data: {
                booking: {
                    id: savedBooking._id.toString(),
                    resource_id: savedBooking.resource_id.toString(),
                    organization_id: savedBooking.organization_id.toString(),
                    user_id: savedBooking.user_id.toString(),
                    start_time: luxon_1.DateTime.fromJSDate(savedBooking.start_time).toISO(),
                    end_time: luxon_1.DateTime.fromJSDate(savedBooking.end_time).toISO(),
                    status: savedBooking.status
                }
            }
        };
    }
    catch (error) {
        return { success: false, message: error.message };
    }
});
exports.bookingServices = {
    serviceGetAvailability,
    serviceCreateBooking,
    serviceGetMyBookings,
    serviceCancelBooking
};
