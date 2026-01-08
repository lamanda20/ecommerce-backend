import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productsRouter from "./routes/products";
import cartRouter from "./routes/cart";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// health check (OBLIGATOIRE pour le cloud)
app.get("/", (_req, res) => {
    res.send("Backend is running 🚀");
});

// routes
app.use("/products", productsRouter);
app.use("/cart", cartRouter);

// PORT dynamique (Railway / Render / Fly)
const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
