import express from "express";
import cors from "cors";
import productsRouter from "./routes/products";
import cartRouter from "./routes/cart";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

// routes
app.use("/products", productsRouter);
app.use("/cart", cartRouter);

// 🚨 PORT FIX
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
