import express from "express";
import cors from "cors";
import productsRoutes from "./routes/products";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.json({ status: "API running" });
});

app.use("/products", productsRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

