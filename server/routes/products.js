const express = require("express");
const jwt = require("jsonwebtoken");
const slugify = require("slugify");
const { query } = require("../config/db");
const { verify } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const router = express.Router();

function isAdminRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return false;
  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET || "lidya_secret_key_2024");
    return decoded.role === "admin";
  } catch {
    return false;
  }
}

function makeSlug(name) {
  return slugify(name, { lower: true, strict: true });
}

function buildProductSelect() {
  return `
    SELECT
      p.id, p.name, p.slug, p.short_description, p.description,
      p.price, p.category_id, p.stock_qty, p.sku, p.status,
      p.is_featured, p.is_active, p.created_at,
      c.name AS category_name,
      (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) AS primary_image,
      (SELECT COALESCE(json_agg(json_build_object('id', pi.id, 'image_path', pi.image_path, 'is_primary', pi.is_primary)), '[]'::json)
       FROM product_images pi WHERE pi.product_id = p.id) AS images
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `;
}

// GET /api/products (public)
router.get("/", async (req, res) => {
  try {
    const { category, featured, search, status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = isAdminRequest(req) ? [] : ["p.is_active = TRUE"];
    const params = [];

    if (category) {
      if (/^\d+$/.test(category)) {
        where.push("p.category_id = ?");
        params.push(category);
      } else {
        where.push("p.category_id = (SELECT id FROM categories WHERE slug = ? LIMIT 1)");
        params.push(category);
      }
    }
    if (featured === "true") {
      where.push("p.is_featured = TRUE");
    }
    if (status) {
      where.push("p.status = ?");
      params.push(status);
    }
    if (search) {
      const term = `%${search}%`;
      where.push("(p.name ILIKE ? OR COALESCE(p.short_description, '') ILIKE ? OR COALESCE(p.description, '') ILIKE ?)");
      params.push(term, term, term);
    }

    const whereStr = where.length ? "WHERE " + where.join(" AND ") : "";

    const countRows = await query(`SELECT COUNT(*) as total FROM products p ${whereStr}`, params);
    const total = countRows[0].total;

    const products = await query(
      `${buildProductSelect()} ${whereStr} ORDER BY p.is_featured DESC, p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: {
        products,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:slug (public)
router.get("/:slug", async (req, res) => {
  try {
    const products = await query(
      `${buildProductSelect()} WHERE p.slug = ?`,
      [req.params.slug]
    );
    if (products.length === 0) return res.status(404).json({ success: false, error: "Product not found" });
    res.json({ success: true, data: products[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products (admin)
router.post("/", verify, requireAdmin, async (req, res) => {
  try {
    const { name, slug, short_description, description, price, category_id, stock_qty, sku, status, is_featured, is_active } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: "Name and price are required" });
    }

    let finalSlug = slug || makeSlug(name);
    let existing = await query("SELECT id FROM products WHERE slug = ?", [finalSlug]);
    let suffix = 1;
    while (existing.length > 0) {
      finalSlug = `${makeSlug(name)}-${suffix++}`;
      existing = await query("SELECT id FROM products WHERE slug = ?", [finalSlug]);
    }

    const result = await query(
      `INSERT INTO products (name, slug, short_description, description, price, category_id, stock_qty, sku, status, is_featured, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, finalSlug, short_description || null, description || null, price, category_id || null, stock_qty || 0, sku || null, status || 'Instock', is_featured === true, is_active !== false]
    );

    const products = await query(`${buildProductSelect()} WHERE p.id = ?`, [result.insertId]);
    res.status(201).json({ success: true, data: products[0], message: "Product created" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/products/:id (admin)
router.put("/:id", verify, requireAdmin, async (req, res) => {
  try {
    const { name, slug, short_description, description, price, category_id, stock_qty, sku, status, is_featured, is_active } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: "Name and price are required" });
    }

    let finalSlug = slug || makeSlug(name);
    let existing = await query("SELECT id FROM products WHERE slug = ? AND id != ?", [finalSlug, req.params.id]);
    let suffix = 1;
    while (existing.length > 0) {
      finalSlug = `${makeSlug(name)}-${suffix++}`;
      existing = await query("SELECT id FROM products WHERE slug = ? AND id != ?", [finalSlug, req.params.id]);
    }

    await query(
      `UPDATE products SET name=?, slug=?, short_description=?, description=?, price=?, category_id=?, stock_qty=?, sku=?, status=?, is_featured=?, is_active=? WHERE id=?`,
      [name, finalSlug, short_description || null, description || null, price, category_id || null, stock_qty || 0, sku || null, status || 'Instock', is_featured === true, is_active !== false, req.params.id]
    );

    const products = await query(`${buildProductSelect()} WHERE p.id = ?`, [req.params.id]);
    res.json({ success: true, data: products[0], message: "Product updated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/products/:id (admin)
router.delete("/:id", verify, requireAdmin, async (req, res) => {
  try {
    await query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
