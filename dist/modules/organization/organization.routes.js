"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRouter = void 0;
const express_1 = require("express");
const organization_controller_1 = require("./organization.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.post("/create", auth_1.auth, organization_controller_1.organizationController.createOrganization);
exports.organizationRouter = router;
