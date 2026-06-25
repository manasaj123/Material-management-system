import express from "express";
const router = express.Router();

const users = [
  { id: 1, username: "admin", password: "admin123", role: "ADMIN" },
  { id: 2, username: "fro", password: "fro123", role: "FRO" }
];

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    id: user.id,
    username: user.username,
    role: user.role
  });
});

export default router;
