const app = require("./app");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running. Use our API on port: 3000");
});

const MONGODB_URI =
  "mongodb+srv://97olka:<password>@cluster0.q4ue9io.mongodb.net/";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: false,
};

mongoose
  .connect(MONGODB_URI, options)
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
  });
