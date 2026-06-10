const express = require("express");
const { query } = require("../config/db");
const router = express.Router();

// GET /api/admin/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const [productCount] = await query("SELECT COUNT(*) as count FROM products");
    const [orderCount] = await query("SELECT COUNT(*) as count FROM orders");
    const [userCount] = await query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");

    const ordersByStatus = await query(`
      SELECT status, COUNT(*) as count FROM orders GROUP BY status
    `);

    const recentOrders = await query(`
      SELECT o.id, o.total_amount, o.status, o.created_at,
             COALESCE(u.email, o.guest_email) AS customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    const topProducts = await query(`
      SELECT p.id, p.name, p.price, p.stock_qty, p.is_featured,
             c.name AS category_name,
             (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) AS primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = TRUE
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        totalProducts: productCount.count,
        totalOrders: orderCount.count,
        totalCustomers: userCount.count,
        ordersByStatus,
        recentOrders,
        featuredProducts: topProducts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/orders (all orders - admin)
router.get("/orders", async (req, res) => {
  try {
    const orders = await query(`
      SELECT o.*, COALESCE(u.email, o.guest_email) AS customer_email,
             COALESCE(CONCAT(u.first_name, ' ', u.last_name), o.guest_name) AS customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    for (const order of orders) {
      order.items = await query(`
        SELECT oi.*, p.name AS product_name
        FROM order_items oi JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
    }

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
