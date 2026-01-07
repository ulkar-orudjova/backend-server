const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    console.log("⏳ MongoDB - yə bağlanmağa çalışır...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB - yə bağlandı");
  } catch (err) {
    console.error("❌ MongoDB bağlantı xətası:", err);
    console.error("📌 .env faylında olan MONGODB_URI - nin düzgün olduğunu yoxla");
    process.exit(1);
  }
};
connectDB();

const app = express();
// İcazə verilən bütün URL-ləri bura əlavə edin
const allowedOrigins = [
  "https://fonder-cvn6.vercel.app",
  "https://fonder-admin-omega.vercel.app" // Yeni frontend URL-i bura mütləq əlavə edilməlidir
];

app.use(cors({
  origin: function (origin, callback) {
    // 1. origin yoxdursa (məsələn: server-to-server və ya curl)
    // 2. Localhost-dursa
    // 3. Siyahımızdakı URL-lərdən biridirsə
    if (!origin || origin.startsWith("http://localhost") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Bloklanan Origin:", origin); // Hansı URL-in bloklandığını görmək üçün
      callback(new Error("CORS icazəsi yoxdur!"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", cartRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Backend server http://localhost:${PORT} ünvanında başladıldı.\nDeveloper: Tərlan Əlicanov`);
});


module.exports = app;
