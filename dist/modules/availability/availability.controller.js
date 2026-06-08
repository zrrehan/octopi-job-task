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
exports.availabilityController = void 0;
const availability_service_1 = require("./availability.service");
const availability_validation_1 = require("../../validations/availability.validation");
const getAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const validatedData = availability_validation_1.getAvailabilitySchema.parse(req.query);
        const result = yield availability_service_1.availabilityServices.serviceGetAvailability(validatedData.resource_id, validatedData.date, validatedData.duration);
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
exports.availabilityController = {
    getAvailability
};
