"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const db_1 = require("./config/db");
const auth_routes_1 = require("./modules/auth/auth.routes");
const organization_routes_1 = require("./modules/organization/organization.routes");
const resource_routes_1 = require("./modules/resource/resource.routes");
const booking_routes_1 = require("./modules/booking/booking.routes");
const app = (0, express_1.default)();
const port = config_1.config.PORT;
// parser 
app.use(express_1.default.json());
// db initialization 
(0, db_1.initialDatabase)();
app.use("/api/v1/auth", auth_routes_1.authRouter);
app.use("/api/v1/organization", organization_routes_1.organizationRouter);
app.use("/api/v1/resource", resource_routes_1.resourceRouter);
app.use("/api/v1/booking", booking_routes_1.bookingRouter);
app.get("/", (req, res) => {
    res.send({
        success: true,
        message: "Resource Management Server is Alive"
    });
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
