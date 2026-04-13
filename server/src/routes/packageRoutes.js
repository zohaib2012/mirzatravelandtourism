const router = require("express").Router();
const pkg = require("../controllers/packageController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

// Public/Agent routes
router.get("/", authenticate, pkg.getPackages);
router.get("/visa-types", authenticate, pkg.getVisaTypes);
router.get("/transports", authenticate, pkg.getTransports);
router.get("/hotels", authenticate, pkg.getHotels);
router.get("/:id", authenticate, pkg.getPackageById);

// Admin routes
router.post("/", authenticate, authorizeAdmin, pkg.createPackage);
router.put("/:id", authenticate, authorizeAdmin, pkg.updatePackage);
router.delete("/:id", authenticate, authorizeAdmin, pkg.deletePackage);

module.exports = router;
