const router = require("express").Router();
const group = require("../controllers/groupController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

// Agent routes
router.get("/", authenticate, group.getGroups);
router.get("/filters", authenticate, group.getFilterOptions);
router.get("/:id", authenticate, group.getGroupById);

// Admin routes
router.post("/", authenticate, authorizeAdmin, group.createGroup);
router.put("/:id", authenticate, authorizeAdmin, group.updateGroup);
router.delete("/:id", authenticate, authorizeAdmin, group.deleteGroup);

module.exports = router;
