const express = require("express");
const { query } = require("../config/db");
const router = express.Router();

// GET /api/users/me
router.get("/me", async (req, res) => {
  try {
    const users = await query("SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = ?", [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, data: users[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/users/me
router.put("/me", async (req, res) => {
  try {
    const { first_name, last_name, phone } = req.body;
    await query(
      "UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?",
      [first_name || "", last_name || "", phone || null, req.user.id]
    );
    const users = await query("SELECT id, email, first_name, last_name, phone, role FROM users WHERE id = ?", [req.user.id]);
    res.json({ success: true, data: users[0], message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
