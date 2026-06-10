const express = require("express");
const { query } = require("../config/db");
const router = express.Router();

// Helper: get or create cart for user
async function getOrCreateCart(userId) {
  let carts = await query("SELECT id FROM carts WHERE user_id = ?", [userId]);
  if (carts.length === 0) {
    const result = await query("INSERT INTO carts (user_id) VALUES (?)", [userId]);
    return result.insertId;
  }
  return carts[0].id;
}

// GET /api/cart
router.get("/", async (req, res) => {
  try {
    const cart = await query("SELECT id FROM carts WHERE user_id = ?", [req.user.id]);
    if (cart.length === 0) {
      return res.json({ success: true, data: { cart: null, items: [] } });
    }

    const items = await query(`
      SELECT ci.id, ci.quantity, ci.added_at,
             p.id AS product_id, p.name, p.slug, p.price, p.stock_qty,
             (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) AS primary_image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
      ORDER BY ci.added_at DESC
    `, [cart[0].id]);

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    res.json({ success: true, data: { cart_id: cart[0].id, items, subtotal } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cart/items
router.post("/items", async (req, res) => {
  try {
    const product_id = req.body.product_id || req.body.productId;
    const quantity = parseInt(req.body.quantity) || 1;
    if (!product_id) return res.status(400).json({ success: false, error: "product_id is required" });

    const products = await query("SELECT id, stock_qty FROM products WHERE id = ? AND is_active = TRUE", [product_id]);
    if (products.length === 0) return res.status(404).json({ success: false, error: "Product not found" });

    const cartId = await getOrCreateCart(req.user.id);

    const existing = await query("SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?", [cartId, product_id]);
    if (existing.length > 0) {
      const newQty = existing[0].quantity + quantity;
      if (newQty > products[0].stock_qty) {
        return res.status(400).json({ success: false, error: `Only ${products[0].stock_qty} items available in stock` });
      }
      await query("UPDATE cart_items SET quantity = ? WHERE id = ?", [newQty, existing[0].id]);
    } else {
      if (quantity > products[0].stock_qty) {
        return res.status(400).json({ success: false, error: `Only ${products[0].stock_qty} items available in stock` });
      }
      await query("INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)", [cartId, product_id, quantity]);
    }

    // Return updated cart
    const items = await query(`
      SELECT ci.id, ci.quantity, ci.added_at,
             p.id AS product_id, p.name, p.slug, p.price, p.stock_qty,
             (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) AS primary_image
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ? ORDER BY ci.added_at DESC
    `, [cartId]);

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    res.json({ success: true, data: { cart_id: cartId, items, subtotal }, message: "Item added to cart" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/cart/items/:itemId
router.put("/items/:itemId", async (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity);
    if (!quantity || quantity < 1) {
      await query("DELETE FROM cart_items WHERE id = ? AND cart_id = (SELECT id FROM carts WHERE user_id = ?)", [req.params.itemId, req.user.id]);
    } else {
      const itemRows = await query(`
        SELECT ci.product_id, p.stock_qty
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN carts c ON ci.cart_id = c.id
        WHERE ci.id = ? AND c.user_id = ?
      `, [req.params.itemId, req.user.id]);
      if (itemRows.length === 0) {
        return res.status(404).json({ success: false, error: "Cart item not found" });
      }
      if (quantity > itemRows[0].stock_qty) {
        return res.status(400).json({ success: false, error: `Only ${itemRows[0].stock_qty} items available in stock` });
      }
      await query("UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = (SELECT id FROM carts WHERE user_id = ?)", [quantity, req.params.itemId, req.user.id]);
    }
    // Return updated cart
    const cart = await query("SELECT id FROM carts WHERE user_id = ?", [req.user.id]);
    if (cart.length === 0) return res.json({ success: true, data: { cart_id: null, items: [], subtotal: 0 } });

    const items = await query(`
      SELECT ci.id, ci.quantity, ci.added_at,
             p.id AS product_id, p.name, p.slug, p.price, p.stock_qty,
             (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) AS primary_image
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ? ORDER BY ci.added_at DESC
    `, [cart[0].id]);

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    res.json({ success: true, data: { cart_id: cart[0].id, items, subtotal } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/cart/items/:itemId
router.delete("/items/:itemId", async (req, res) => {
  try {
    const cart = await query("SELECT id FROM carts WHERE user_id = ?", [req.user.id]);
    if (cart.length > 0) {
      await query("DELETE FROM cart_items WHERE id = ? AND cart_id = ?", [req.params.itemId, cart[0].id]);
    }
    res.json({ success: true, message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/cart (clear cart)
router.delete("/", async (req, res) => {
  try {
    const cart = await query("SELECT id FROM carts WHERE user_id = ?", [req.user.id]);
    if (cart.length > 0) {
      await query("DELETE FROM cart_items WHERE cart_id = ?", [cart[0].id]);
    }
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
