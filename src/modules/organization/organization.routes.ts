import { Router } from "express";
import { organizationController } from "./organization.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/create", auth, organizationController.createOrganization);
router.post("/add-user", auth, organizationController.addUserToOrganization);

export const organizationRouter = router;
