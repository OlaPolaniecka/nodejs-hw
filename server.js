const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.DB_HOST;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: false,
};

mongoose
  .connect(MONGODB_URI, options)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
  });
