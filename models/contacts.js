const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const contactsPath = path.join(__dirname, "models", "contacts.json");

const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath);
    return JSON.parse(data);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getContactById = async (contactId) => {
  try {
    const contacts = await listContacts();
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }
    return contact;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const removeContact = async (contactId) => {
  try {
    const contacts = await listContacts();
    const updateContacts = contacts.filter((c) => c.id !== contactId);
    if (contacts.length === updateContacts.length) {
      throw new Error("Contact not found");
    }
    await fs.writeFile(contactsPath, JSON.stringify(updateContacts, null, 2));
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const addContact = async ({ name, email, phone }) => {
  try {
    const contacts = await listContacts();
    const newContact = { id: uuidv4(), name, email, phone };
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return newContact;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateContact = async (contactId, { name, email, phone }) => {
  try {
    const contacts = await listContacts();
    const updateContacts = contacts.map((c) => {
      if (c.id === contactId) {
        return { ...c, name, email, phone };
      }
      return c;
    });
    if (contacts.length === updateContacts.length) {
      throw new Error("Contact not found");
    }
    await fs.writeFile(contactsPath, JSON.stringify(updateContacts, null, 2));
    return updateContacts.find((c) => c.id === contactId);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
