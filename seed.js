const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("./models/user");
const Product = require("./models/product");

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB - yə bağlanmağa çalışır...");
  })
  .catch((err) => {
    console.error("❌ MongoDB - yə bağlanma zamanı xəta:", err);
  });

// const users = [
//   {
//     name: "Admin",
//     surname: "User",
//     email: "admin@example.com",
//     password: bcrypt.hashSync("admin123", 10),
//     role: "admin",
//   },
// ];

// const products = [
//   {
//     id: "1",
//     name: "Brand Experience Audit",
//     details:
//       "We dive through every part of your customer journey — from first impression to post-purchase — to gauge your brand perception and uncover opportunities to convert more customers, build brand loyalty, and drive lasting growth.",
//     price: 2.0,
//     productImage: "uploads/brand-audit-img.webp",
//   },
//   {
//     id: "2",
//     name: "Brand Build",
//     details:
//       "Everything you need to launch with impact and grow with confidence: smart strategy, a uniquely memorable identity, award-worthy design, and digital guidelines that keep your brand consistent, adaptable, and ready for whatever’s next.",
//     price: 25.0,
//     productImage: "uploads/brand-build.webp",
//   },
//   {
//     id: "3",
//     name: "Shopify Website",
//     details:
//       "A beautifully branded and fully operational webstore with design strategy and key features to increase sales, cart size, repeat purchases, life time value, and referrals. Give your brand an engaging, fast, and responsive shopping experience that converts and supports future expansion. ",
//     price: 50.0,
//     productImage: "uploads/shopify-website.webp",
//   },
//   {
//     id: "4",
//     name: "Brand Support",
//     details:
//       "Lean support covering essentials with ongoing brand strategy, guidance, and on-demand project work, optimized performance and comprehensive oversight with a dedicated team, a full-service brand partner across strategy, design, and digital to support omnichannel growth.",
//     price: 1.0,
//     productImage: "uploads/brand-support.webp",
//   },
// ];

const seedDatabase = async () => {
  try {
    //await User.deleteMany();
    //await Product.deleteMany();

    //await User.insertMany(users);
    //await Product.insertMany(products);

    console.log("✅ Məlumatlar MongoDB - yə əlavə olundu !");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Xəta baş verdi:", error);
    mongoose.connection.close();
  }
};

seedDatabase();
