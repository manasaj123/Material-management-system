import express from "express";
const router = express.Router();

let collections = [];

router.post("/data", (req, res) => {
  collections = req.body;
  res.json({ message: "Market data updated" });
});

router.get("/weekly", (req, res) => {
  const market = {};

  collections.forEach(c => {
    const key = `${c.farmerName}-${c.materialName}`;
    market[key] = (market[key] || 0) + Number(c.qty);
  });

  const result = Object.entries(market).map(([key, qty]) => {
    const [farmer, material] = key.split("-");
    return { farmer, material, qty };
  });

  res.json(result);
});

export default router;
