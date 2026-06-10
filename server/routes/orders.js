const express = require("express");
const { query, getConnection } = require("../config/db");
const { verify } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const router = express.Router();

// POST /api/orders/guest (public - guest checkout, no account required)
router.post("/guest", async (req, res) => {
  const conn = await getConnection();
  try {
    const { email, first_name, last_name, phone, items } = req.body;
    if (!email || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        error: "Email, first name, and last name are required",
      });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "Cart is empty" });
    }

    await conn.beginTransaction();

    const orderItems = [];
    for (const item of items) {
      const productId = item.product_id || item.productId;
      const quantity = parseInt(item.quantity) || 0;
      if (!productId || quantity < 1) {
        await conn.rollback();
        return res.status(400).json({ success: false, error: "Invalid cart item" });
      }

      const [products] = await conn.execute(
        "SELECT id, name, price, stock_qty FROM products WHERE id = ? AND is_active = TRUE",
        [productId]
      );
      if (products.length === 0) {
        await conn.rollback();
        return res.status(404).json({ success: false, error: `Product #${productId} not found` });
      }

      const product = products[0];
      if (product.stock_qty < quantity) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.stock_qty}`,
        });
      }

      orderItems.push({ product, quantity });
    }

    const totalAmount = orderItems.reduce(
      (sum, { product, quantity }) => sum + parseFloat(product.price) * quantity,
      0
    );
    const orderNumber = `LL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const guestName = `${first_name} ${last_name}`.trim();

    const [orderResult] = await conn.execute(
      `INSERT INTO orders (user_id, guest_email, guest_name, guest_phone, total_amount, status, order_number)
       VALUES (NULL, ?, ?, ?, ?, 'pending', ?)`,
      [email, guestName, phone || null, totalAmount, orderNumber]
    );
    const orderId = orderResult.insertId;

    for (const { product, quantity } of orderItems) {
      await conn.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [orderId, product.id, quantity, product.price]
      );
      await conn.execute(
        "UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?",
        [quantity, product.id]
      );
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      data: { order_number: orderNumber, total_amount: totalAmount },
      message: `Order ${orderNumber} placed successfully`,
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, error: err.message });
  } finally {
    conn.release();
  }
});

// GET /api/orders (auth - user's orders)
router.get("/", verify, async (req, res) => {
  try {
    const orders = await query(`
      SELECT o.*, u.email AS customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    for (const order of orders) {
      order.items = await query(`
        SELECT oi.*, p.name AS product_name, p.slug AS product_slug
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
    }

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/orders/:id/status (admin - update order status)
router.put("/:id/status", verify, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }
    await query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/:id (auth - single order)
router.get("/:id", verify, async (req, res) => {
  try {
    const orders = await query(`
      SELECT o.*, u.email AS customer_email
      FROM orders o LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ? AND o.user_id = ?
    `, [req.params.id, req.user.id]);

    if (orders.length === 0) return res.status(404).json({ success: false, error: "Order not found" });

    const items = await query(`
      SELECT oi.*, p.name AS product_name, p.slug AS product_slug
      FROM order_items oi JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({ success: true, data: { ...orders[0], items } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/orders (auth - create from cart)
router.post("/", verify, async (req, res) => {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const [cartRows] = await conn.execute("SELECT id FROM carts WHERE user_id = ?", [req.user.id]);
    if (cartRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, error: "No cart found" });
    }
    const cartId = cartRows[0].id;

    const [items] = await conn.execute(`
      SELECT ci.*, p.price, p.name AS product_name, p.stock_qty
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cartId]);

    if (items.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, error: "Cart is empty" });
    }

    for (const item of items) {
      if (item.stock_qty < item.quantity) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${item.product_name}. Available: ${item.stock_qty}`,
        });
      }
    }

    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    const orderNumber = `LL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const [orderResult] = await conn.execute(
      "INSERT INTO orders (user_id, total_amount, status, order_number) VALUES (?, ?, 'pending', ?)",
      [req.user.id, totalAmount, orderNumber]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );
      await conn.execute(
        "UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    await conn.execute("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);

    await conn.commit();

    const orders = await query(`
      SELECT o.*, u.email AS customer_email
      FROM orders o LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);
    const orderItems = await query("SELECT * FROM order_items WHERE order_id = ?", [orderId]);

    res.status(201).json({
      success: true,
      data: { ...orders[0], items: orderItems, order_number: orderNumber },
      message: `Order ${orderNumber} placed successfully`,
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
