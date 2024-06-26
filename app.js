const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const path = require("path");

const contactsRouter = require("./routes/api/contacts");
const usersRouter = require("./routes/api/usersRoutes");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.get("contacts/:id", (req, res) => {
  res.send(req.params.id);
});

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/contacts", contactsRouter);
app.use("/users", usersRouter);

app.use("/avatars", express.static(path.join(__dirname, "public/avatars")));

app.use((_, res, __) => {
  res.status(404).json({
    status: "error",
    code: 404,
    message: "Use api on routes: /api/contacts",
    data: "Not found",
  });
});

app.use((err, _, res, __) => {
  console.log(err.stack);
  res.status(500).json({
    status: "fail",
    code: 500,
    message: err.message,
    data: "Internal Server Error",
  });
});

module.exports = app;
