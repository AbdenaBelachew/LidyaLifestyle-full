const express = require("express");
const fs = require("fs");
const path = require("path");
const { query } = require("../config/db");
const { upload } = require("../middleware/upload");
const router = express.Router();

// POST /api/products/:id/images (admin, multipart)
router.post("/:id/images", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No image file provided" });

    // Check if this is the first image (make it primary)
    const existing = await query("SELECT id FROM product_images WHERE product_id = ?", [req.params.id]);
    const is_primary = existing.length === 0;

    const result = await query(
      "INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, ?)",
      [req.params.id, `/uploads/${req.file.filename}`, is_primary]
    );

    const images = await query("SELECT * FROM product_images WHERE product_id = ?", [req.params.id]);
    res.status(201).json({ success: true, data: images, message: "Image uploaded" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/products/:id/images/:imageId/primary (admin)
router.put("/:id/images/:imageId/primary", async (req, res) => {
  try {
    await query("UPDATE product_images SET is_primary = FALSE WHERE product_id = ?", [req.params.id]);
    await query("UPDATE product_images SET is_primary = TRUE WHERE id = ?", [req.params.imageId]);
    const images = await query("SELECT * FROM product_images WHERE product_id = ?", [req.params.id]);
    res.json({ success: true, data: images, message: "Primary image updated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/products/:id/images/:imageId (admin)
router.delete("/:id/images/:imageId", async (req, res) => {
  try {
    const imageRow = await query("SELECT image_path FROM product_images WHERE id = ? AND product_id = ?", [req.params.imageId, req.params.id]);
    if (imageRow.length > 0 && imageRow[0].image_path) {
      const filename = path.basename(imageRow[0].image_path);
      const filePath = path.join(__dirname, "..", "uploads", filename);
      fs.unlink(filePath, () => {});
    }
    await query("DELETE FROM product_images WHERE id = ? AND product_id = ?", [req.params.imageId, req.params.id]);

    // If deleted image was primary, set another one as primary
    const remaining = await query("SELECT id FROM product_images WHERE product_id = ? ORDER BY id LIMIT 1", [req.params.id]);
    if (remaining.length > 0) {
      await query("UPDATE product_images SET is_primary = TRUE WHERE id = ?", [remaining[0].id]);
    }

    const images = await query("SELECT * FROM product_images WHERE product_id = ?", [req.params.id]);
    res.json({ success: true, data: images, message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:id/images (public)
router.get("/:id/images", async (req, res) => {
  try {
    const images = await query("SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id", [req.params.id]);
    res.json({ success: true, data: images });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
