const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const Product = require("../models/product");
const jwt = require("jsonwebtoken");

// Cloudinary konfiqurasiyası
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage - Vercel serverless üçün uyğun
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fonder-products", // Cloudinary-də qovluq adı
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ width: 800, height: 800, crop: "limit" }], // Şəkil ölçüsü optimallaşdırılması
  },
});

const upload = multer({ storage: storage }).single("productImage");

const isAdmin = (token) => {
  try {
    // Handle both raw token and Bearer-prefixed token
    let actualToken = token;
    if (token && token.startsWith('Bearer ')) {
      actualToken = token.slice(7);
    }
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    return decoded.role === "admin";
  } catch (err) {
    return false;
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (error) {
    res.status(500).send("Xəta: getProducts" + error.message);
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Məhsul tapılmadı");

    res.send(product);
  } catch (error) {
    res.status(500).send("Xəta: getProductById" + error.message);
  }
};

const addProduct = async (req, res) => {
  const token = req.headers["authorization"];
  const userIsAdmin = isAdmin(token);

  if (!userIsAdmin) {
    return res.status(403).send("Sizin bu əməliyyat üçün icazəniz yoxdur");
  }

  upload(req, res, async (err) => {
    if (err) {
      console.log("Multer/Cloudinary xətası:", err);
      return res.status(400).send({ message: err.message });
    }

    const { name, details, price } = req.body;

    try {
      const newProduct = new Product({
        name,
        details,
        price,
        // Cloudinary URL-i birbaşa qaytarır (req.file.path)
        productImage: req.file ? req.file.path : null,
      });

      await newProduct.save();
      res.send(newProduct);
    } catch (error) {
      console.log("addProduct xətası:", error);
      res.status(500).send("Xəta: addProduct" + error.message);
    }
  });
};

const updateProduct = async (req, res) => {
  const token = req.headers["authorization"];
  const userIsAdmin = isAdmin(token);

  if (!userIsAdmin) {
    return res.status(403).send("Sizin bu əməliyyat üçün icazəniz yoxdur");
  }

  upload(req, res, async (err) => {
    if (err) {
      console.log("Multer/Cloudinary xətası:", err);
      return res.status(400).send({ message: err.message });
    }

    try {
      const { name, details, price } = req.body;
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).send("Məhsul tapılmadı");

      product.name = name || product.name;
      product.details = details || product.details;
      product.price = price || product.price;

      if (req.file) {
        // Köhnə şəkili Cloudinary-dən silmək (isteğə bağlı)
        if (product.productImage) {
          try {
            // URL-dən public_id çıxarmaq
            const urlParts = product.productImage.split('/');
            const publicIdWithExt = urlParts.slice(-2).join('/'); // folder/filename
            const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ""); // extension silmək
            await cloudinary.uploader.destroy(publicId);
          } catch (deleteErr) {
            console.log("Köhnə şəkil silinmədi:", deleteErr.message);
          }
        }
        product.productImage = req.file.path;
      }

      await product.save();
      res.send(product);
    } catch (error) {
      console.log("updateProduct xətası:", error);
      res.status(500).send("Xəta: updateProduct" + error.message);
    }
  });
};

const deleteProduct = async (req, res) => {
  const token = req.headers["authorization"];
  console.log("DELETE Product - Token:", token ? token.substring(0, 20) + "..." : "NO TOKEN");
  
  const userIsAdmin = isAdmin(token);
  console.log("DELETE Product - isAdmin:", userIsAdmin);

  if (!userIsAdmin) {
    console.log("DELETE Product - REJECTED: Not admin");
    return res.status(403).send("Sizin bu əməliyyat üçün icazəniz yoxdur");
  }
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Məhsul tapılmadı");
    }

    // Cloudinary-dən şəkili silmək
    if (product.productImage) {
      try {
        const urlParts = product.productImage.split('/');
        const publicIdWithExt = urlParts.slice(-2).join('/');
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary şəkil silindi:", publicId);
      } catch (deleteErr) {
        console.log("Cloudinary şəkil silinmədi:", deleteErr.message);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    console.log("DELETE Product - Success");
    res.send({ message: "Məhsul uğurla silindi" });
  } catch (error) {
    console.log("DELETE Product - Error:", error.message);
    res.status(500).send("Xəta: deleteProduct" + error.message);
  }
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
