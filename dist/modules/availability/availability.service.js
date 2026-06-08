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
exports.availabilityServices = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const luxon_1 = require("luxon");
const Resource_1 = require("../../models/Resource");
const Organization_1 = require("../../models/Organization");
const Booking_1 = require("../../models/Booking");
const serviceGetAvailability = (resourceId, dateStr, duration) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Step 1: Validate resource exists and is not deleted
        const resource = yield Resource_1.Resource.findById(new mongoose_1.default.Types.ObjectId(resourceId));
        if (!resource || resource.isDeleted) {
            return { success: false, message: "Resource not found or deleted" };
        }
        // Get organization
        const org = yield Organization_1.Organization.findById(resource.organization_id);
        if (!org) {
            return { success: false, message: "Organization not found" };
        }
        // Validate working hours
        if (!org.workingHours.start || !org.workingHours.end) {
            return { success: false, message: "Organization has no working hours configured" };
        }
        // Step 1: Validate date is not in past and within maxBookingDays
        const nowOrg = luxon_1.DateTime.now().setZone(org.timezone);
        const requestedDate = luxon_1.DateTime.fromFormat(dateStr, "yyyy-MM-dd").setZone(org.timezone).startOf("day");
        if (requestedDate < nowOrg.startOf("day")) {
            return { success: false, message: "Cannot book a date in the past" };
        }
        const maxDate = nowOrg.plus({ days: org.maxBookingDays });
        if (requestedDate > maxDate.endOf("day")) {
            return { success: false, message: `Cannot book more than ${org.maxBookingDays} days in advance` };
        }
        // Step 2-3: Get working hours in org timezone
        const [startHour, startMin] = org.workingHours.start.split(":").map(Number);
        const [endHour, endMin] = org.workingHours.end.split(":").map(Number);
        const workStart = requestedDate.set({ hour: startHour, minute: startMin, second: 0, millisecond: 0 });
        const workEnd = requestedDate.set({ hour: endHour, minute: endMin, second: 0, millisecond: 0 });
        // Step 4: Fetch confirmed bookings for this resource and date
        const dayStartUTC = workStart.toUTC();
        const dayEndUTC = workEnd.toUTC();
        const bookings = yield Booking_1.Booking.find({
            resource_id: resource._id,
            status: "CONFIRMED",
            start: { $gte: dayStartUTC.toJSDate(), $lt: dayEndUTC.toJSDate() }
        });
        // Step 5: Generate all possible slots
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
        // Step 6: Filter blocked slots
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
            // Check if slot is in the past (if date is today)
            if (requestedDate.hasSame(nowOrg, "day")) {
                if (slotEnd < now) {
                    slot.available = false;
                    continue;
                }
            }
            // Check overlap with bookings and buffer times
            for (let booking of bookings) {
                const bookingStartOrg = luxon_1.DateTime.fromJSDate(booking.start).setZone(org.timezone);
                const bookingEndOrg = luxon_1.DateTime.fromJSDate(booking.end).setZone(org.timezone);
                const bufferEndOrg = bookingEndOrg.plus({ minutes: resource.bufferTimeMinutes });
                // Check overlap between slot and booking
                const overlaps = (slotStart < bookingEndOrg) && (slotEnd > bookingStartOrg);
                if (overlaps) {
                    slot.available = false;
                    break;
                }
                // Check overlap with buffer time
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
exports.availabilityServices = {
    serviceGetAvailability
};
