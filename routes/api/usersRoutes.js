const express = require("express");
const users = require("../../models/users");
const auth = require("../../middleware/auth");
const upload = require("../../multerConfig/multer");
const User = require("../../models/users");

const router = express.Router();

router.post("/signup", users.signup);
router.post("/login", users.login);
router.get("/logout", auth, users.logout);
router.get("/current", auth, users.getCurrentUser);
router.patch("/avatars", auth, upload.single("avatar"), users.updateAvatar);
router.post("/verify", users.resendVerificationEmail);

router.get("/verify/:verificationToken", async (req, res) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verificationToken = null;
    user.verify = true;
    await user.save();

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
