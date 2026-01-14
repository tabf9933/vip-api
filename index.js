const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// Create Postgres connection pool (Railway variables)
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false }
});

// TEMP VIP DATA (later we connect database)
const vipLevels = [
  { level: 0, name: "Normal", points: 0 },
  { level: 1, name: "Bronze", points: 1000 },
  { level: 2, name: "Silver", points: 5000 },
  { level: 3, name: "Gold", points: 20000 },
  { level: 4, name: "Platinum", points: 50000 },
  { level: 5, name: "Diamond", points: 100000 }
];

// Test endpoint
app.get("/", (req, res) => {
  res.json({ status: "VIP API is running 🚀" });
});
// EASY browser test (no Postman needed)
app.get("/vip/test", (req, res) => {
  const user_id = req.query.user_id || "test_user";
  const points = Number(req.query.points || 0);

  const vipLevels = [
    { level: 0, name: "Normal", points: 0 },
    { level: 1, name: "Bronze", points: 1000 },
    { level: 2, name: "Silver", points: 5000 },
    { level: 3, name: "Gold", points: 20000 },
    { level: 4, name: "Platinum", points: 50000 },
    { level: 5, name: "Diamond", points: 100000 }
  ];

  let currentLevel = vipLevels[0];
  for (const level of vipLevels) {
    if (points >= level.points) currentLevel = level;
  }

  const nextLevel =
    vipLevels.find(l => l.level === currentLevel.level + 1) || null;

  res.json({
    user_id,
    vip_level: currentLevel.name,
    vip_level_number: currentLevel.level,
    points,
    next_level: nextLevel ? nextLevel.name : "MAX",
    points_to_next: nextLevel ? nextLevel.points - points : 0
  });
});
// VIP status endpoint
app.post("/vip/status", async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id required" });
  }

  try {
    // Find or create user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );

    let user;

    if (userResult.rows.length === 0) {
      const insertResult = await pool.query(
        "INSERT INTO users (user_id) VALUES ($1) RETURNING *",
        [user_id]
      );
      user = insertResult.rows[0];
    } else {
      user = userResult.rows[0];
    }

    const vipLevels = [
      { level: 0, name: "Normal", points: 0 },
      { level: 1, name: "Bronze", points: 1000 },
      { level: 2, name: "Silver", points: 5000 },
      { level: 3, name: "Gold", points: 20000 },
      { level: 4, name: "Platinum", points: 50000 },
      { level: 5, name: "Diamond", points: 100000 }
    ];

    let currentLevel = vipLevels[0];
    for (const lvl of vipLevels) {
      if (user.vip_points >= lvl.points) currentLevel = lvl;
    }

    const nextLevel =
      vipLevels.find(l => l.level === currentLevel.level + 1) || null;

    res.json({
      user_id: user.user_id,
      vip_level: currentLevel.name,
      vip_level_number: currentLevel.level,
      points: user.vip_points,
      next_level: nextLevel ? nextLevel.name : "MAX",
      points_to_next: nextLevel
        ? nextLevel.points - user.vip_points
        : 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Railway uses this port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`VIP API running on port ${PORT}`);
});
