import express from "express";
import cors from "cors";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);

const PORT = 5008;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
