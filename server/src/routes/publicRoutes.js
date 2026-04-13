const router = require("express").Router();
const admin = require("../controllers/adminController");

// Public routes (no auth needed) - for landing page data
router.get("/branches", admin.getOfficeBranches);
router.get("/authorizations", admin.getAuthorizations);
router.get("/deals", admin.getDeals);
router.get("/settings", admin.getCompanySettings);

module.exports = router;
