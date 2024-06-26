const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const gravatar = require("gravatar");
const fs = require("fs").promises;
const path = require("path");
const Jimp = require("jimp");

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: {
    type: String,
    default: null,
  },
  avatarURL: {
    type: String,
    default: null,
  },
});

const User = mongoose.model("User", userSchema);

const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const signup = async (req, res) => {
  try {
    const { error } = registrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({ message: "Email in use" });
    }
    const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "mm" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      subscription: "starter",
      avatarURL,
    });

    await newUser.save();
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user.token = token;
    await user.save();

    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
  try {
    const user = req.user;
    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (error) {
    console.error(error);
    const errorMessage = error.message
      ? error.message
      : "An unexpected error occurred";
    res.status(500).json({ message: errorMessage });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const { email, subscription } = req.user;
    res.json({
      email,
      subscription,
    });
  } catch (error) {
    const errorMessage = error.message
      ? error.message
      : "Internal server error";
    res.status(500).json({ message: errorMessage });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { file } = req;
    const filePath = path.join(__dirname, "../", file.path);

    const image = await Jimp.read(filePath);
    await image.resize(250, 250).writeAsync(filePath);

    const publicAvatarPath = `public/avatars/${file.filename}`;
    await fs.rename(filePath, path.join(__dirname, "../", publicAvatarPath));

    const avatarURL = `/avatars/${file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { avatarURL });

    res.json({ avatarURL });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update avatar" });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser,
  updateAvatar,
};
