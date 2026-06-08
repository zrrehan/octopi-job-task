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
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingController = void 0;
const booking_service_1 = require("./booking.service");
const booking_validation_1 = require("../../validations/booking.validation");
const getAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const validatedData = booking_validation_1.getAvailabilitySchema.parse(req.query);
        const result = yield booking_service_1.bookingServices.serviceGetAvailability(validatedData.resource_id, validatedData.date, validatedData.duration);
        if (!result.success) {
            return res.status(400).send(result);
        }
        return res.send(result);
    }
    catch (error) {
        const message = ((_b = (_a = error.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || "Validation error";
        return res.status(400).send({ success: false, message });
    }
});
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }
    try {
        const validatedData = booking_validation_1.createBookingSchema.parse(req.body);
        const result = yield booking_service_1.bookingServices.serviceCreateBooking(req.user.userId, validatedData.resource_id, validatedData.date, validatedData.start_time, validatedData.duration_minutes);
        if (!result.success) {
            return res.status(400).send(result);
        }
        return res.send(result);
    }
    catch (error) {
        const message = ((_b = (_a = error.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || "Validation error";
        return res.status(400).send({ success: false, message });
    }
});
const getMyBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }
    try {
        const result = yield booking_service_1.bookingServices.serviceGetMyBookings(req.user.userId);
        if (!result.success) {
            return res.status(400).send(result);
        }
        return res.send(result);
    }
    catch (error) {
        return res.status(400).send({ success: false, message: error.message });
    }
});
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }
    try {
        const { bookingId } = req.params;
        const result = yield booking_service_1.bookingServices.serviceCancelBooking(req.user.userId, bookingId);
        if (!result.success) {
            return res.status(400).send(result);
        }
        return res.send(result);
    }
    catch (error) {
        return res.status(400).send({ success: false, message: error.message });
    }
});
exports.bookingController = {
    getAvailability,
    createBooking,
    getMyBookings,
    cancelBooking
};
