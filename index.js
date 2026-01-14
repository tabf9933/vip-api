const express = require("express");
const app = express();

app.use(express.json());

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

// VIP status endpoint
app.post("/vip/status", (req, res) => {
  const { user_id, points } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id required" });
  }

  const userPoints = points || 0;

  let currentLevel = vipLevels[0];
  for (const level of vipLevels) {
    if (userPoints >= level.points) {
      currentLevel = level;
    }
  }

  const nextLevel =
    vipLevels.find(l => l.level === currentLevel.level + 1) || null;

  res.json({
    user_id,
    vip_level: currentLevel.name,
    vip_level_number: currentLevel.level,
    points: userPoints,
    next_level: nextLevel ? nextLevel.name : "MAX",
    points_to_next: nextLevel
      ? nextLevel.points - userPoints
      : 0
  });
});

// Railway uses this port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`VIP API running on port ${PORT}`);
});
