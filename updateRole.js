const mongoose = require("mongoose");
const User = require("./models/user");
require("dotenv").config();

const updateRole = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const email = "admin@example.com";
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found");
      process.exit(1);
    }

    user.role = "admin";
    await user.save();
    console.log(`Updated role for ${email} to admin`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

updateRole();
