const express = require("express");
const contactsController = require("../../controllers/contactsController");
const auth = require("../../middleware/auth");

const router = express.Router();

router.post("/", auth, contactsController.createContact);

router.get("/", auth, contactsController.getUserContacts);

module.exports = router;
