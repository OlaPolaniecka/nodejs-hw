const express = require("express");
const users = require("../../models/users");
const auth = require("../../middleware/auth");

const router = express.Router();

router.post("/signup", users.signup);
router.post("/login", users.login);
router.get("/logout", auth, users.logout);
router.get("/current", auth, users.getCurrentUser);

module.exports = router;
