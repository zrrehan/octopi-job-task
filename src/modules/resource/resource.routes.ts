import { Router } from "express";
import { resourceController } from "./resource.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/create", auth, resourceController.createResource);
router.get("/:organizationId", auth, resourceController.getResourcesByOrganization);
router.delete("/:resourceId", auth, resourceController.softDeleteResource);

export const resourceRouter = router;
