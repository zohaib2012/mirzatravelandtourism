import { Router } from "express";
import * as group from "../controllers/groupController.js";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, group.getGroups);
router.get("/filters", authenticate, group.getFilterOptions);
router.get("/:id", authenticate, group.getGroupById);

router.post("/", authenticate, authorizeAdmin, group.createGroup);
router.put("/:id", authenticate, authorizeAdmin, group.updateGroup);
router.delete("/:id", authenticate, authorizeAdmin, group.deleteGroup);

export default router;
