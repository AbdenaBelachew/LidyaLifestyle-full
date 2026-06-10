require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./middleware/auth").verify, require("./routes/users"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/products", require("./routes/products"));
app.use("/api/products", require("./middleware/auth").verify, require("./middleware/admin").requireAdmin, require("./routes/productImages"));
app.use("/api/cart", require("./middleware/auth").verify, require("./routes/carts"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/admin", require("./middleware/auth").verify, require("./middleware/admin").requireAdmin, require("./routes/admin"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "LidyaLifestyle API is running", timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`LidyaLifestyle server running on port ${PORT}`);
});
