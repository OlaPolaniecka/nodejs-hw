const express = require("express");
const Joi = require("joi");
const contacts = require("../../models/contacts");
const auth = require("../../middleware/auth");

const router = express.Router();

const validateContact = (contact) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
  });
  return schema.validate(contact);
};

router.get("/", auth, async (req, res, next) => {
  try {
    const allContacts = await contacts.listContacts();
    res.json(allContacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:contactId", auth, async (req, res, next) => {
  try {
    const contact = await contacts.getContactById(req.params.contactId);
    res.json(contact);
  } catch (error) {
    res.status(404).json({ message: "Not found" });
  }
});

router.post("/", auth, async (req, res, next) => {
  try {
    const { error } = validateContact(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const newContact = await contacts.addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:contactId", auth, async (req, res, next) => {
  try {
    const deleteContact = await contacts.removeContact(req.params.contactId);
    res.json({ message: "Contact deleted" });
    res.json(deleteContact);
  } catch (error) {
    res.status(404).json({ message: "Not found" });
  }
});

router.put("/", auth, async (req, res, next) => {
  try {
    const { error } = validateContact(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const updatedContact = await contacts.updateContact(
      req.params.id,
      req.body
    );
    res.json(updatedContact);
  } catch (error) {
    res.status(404).json({ message: "Not found" });
  }
});

router.patch("/:contactId/favorite", auth, async (req, res, next) => {
  try {
    const { favorite } = req.body;
    if (favorite === undefined) {
      return res.status(400).json({ message: "missing field favorite" });
    }
    const updatedContact = await contacts.findByIdAndUpdate(
      req.params.contactId,
      { favorite },
      { new: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json(updatedContact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
