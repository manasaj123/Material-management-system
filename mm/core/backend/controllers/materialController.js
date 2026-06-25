export const getStockFIFO = (req, res) => {
  const { materialId } = req.params;

  const sql = `
    SELECT c.*, f.name AS farmerName
    FROM collections c
    JOIN farmers f ON c.farmer_id = f.id
    WHERE c.material_id = ?
    ORDER BY c.mfg_date ASC
  `;

  db.query(sql, [materialId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};
export const getStockLIFO = (req, res) => {
  const { materialId } = req.params;

  const sql = `
    SELECT c.*, f.name AS farmerName
    FROM collections c
    JOIN farmers f ON c.farmer_id = f.id
    WHERE c.material_id = ?
    ORDER BY c.mfg_date DESC
  `;

  db.query(sql, [materialId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};
export const getExpiryStatus = (req, res) => {
  const sql = `
    SELECT *,
    CASE
      WHEN expiry_date < CURDATE() THEN 'Expired'
      WHEN DATEDIFF(expiry_date, CURDATE()) <= 2 THEN 'Near Expiry'
      ELSE 'Fresh'
    END AS expiry_status
    FROM collections
  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};
export const weeklyMarket = (req, res) => {
  const sql = `
    SELECT f.name AS farmerName,
           m.name AS materialName,
           SUM(c.qty) totalQty
    FROM collections c
    JOIN farmers f ON c.farmer_id = f.id
    JOIN materials m ON c.material_id = m.id
    GROUP BY c.farmer_id, c.material_id
  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};
