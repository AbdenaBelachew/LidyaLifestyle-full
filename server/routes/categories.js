const express = require("express");
const slugify = require("slugify");
const { query } = require("../config/db");
const { verify } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const router = express.Router();

function makeSlug(name) {
  return slugify(name, { lower: true, strict: true });
}

// GET /api/categories (public)
router.get("/", async (req, res) => {
  try {
    const cats = await query(`
      SELECT c.*, p.name AS parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      ORDER BY c.sort_order, c.name
    `);
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/categories/:id (public)
router.get("/:id", async (req, res) => {
  try {
    const cats = await query(`
      SELECT c.*, p.name AS parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.id = ?
    `, [req.params.id]);
    if (cats.length === 0) return res.status(404).json({ success: false, error: "Category not found" });
    res.json({ success: true, data: cats[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/categories (admin)
router.post("/", verify, requireAdmin, async (req, res) => {
  try {
    const { name, slug, parent_id, is_active } = req.body;
    if (!name) return res.status(400).json({ success: false, error: "Name is required" });

    let finalSlug = slug || makeSlug(name);
    // Handle duplicate slugs
    let existing = await query("SELECT id FROM categories WHERE slug = ?", [finalSlug]);
    let suffix = 1;
    while (existing.length > 0) {
      finalSlug = `${makeSlug(name)}-${suffix++}`;
      existing = await query("SELECT id FROM categories WHERE slug = ?", [finalSlug]);
    }

    const result = await query(
      "INSERT INTO categories (name, slug, parent_id, is_active) VALUES (?, ?, ?, ?)",
      [name, finalSlug, parent_id || null, is_active !== false]
    );
    const cats = await query("SELECT * FROM categories WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: cats[0], message: "Category created" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/categories/:id (admin)
router.put("/:id", verify, requireAdmin, async (req, res) => {
  try {
    const { name, slug, parent_id, is_active } = req.body;
    if (!name) return res.status(400).json({ success: false, error: "Name is required" });

    let finalSlug = slug || makeSlug(name);
    let existing = await query("SELECT id FROM categories WHERE slug = ? AND id != ?", [finalSlug, req.params.id]);
    let suffix = 1;
    while (existing.length > 0) {
      finalSlug = `${makeSlug(name)}-${suffix++}`;
      existing = await query("SELECT id FROM categories WHERE slug = ? AND id != ?", [finalSlug, req.params.id]);
    }

    await query(
      "UPDATE categories SET name = ?, slug = ?, parent_id = ?, is_active = ? WHERE id = ?",
      [name, finalSlug, parent_id || null, is_active !== false, req.params.id]
    );
    const cats = await query("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: cats[0], message: "Category updated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/categories/:id (admin)
router.delete("/:id", verify, requireAdmin, async (req, res) => {
  try {
    await query("UPDATE categories SET is_active = FALSE WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Category deactivated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
