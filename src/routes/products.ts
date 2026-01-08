
import { Router } from "express";

const router = Router();


const products = [
    {
        id: 1,
        name: "T-shirt Demo",
        price: 29.99,
        imageUrl: "https://via.placeholder.com/300",
        category: "Apparel",
        inStock: true,
        variants: ["S", "M", "L"]
    },
    {
        id: 2,
        name: "Hoodie Demo",
        price: 59.99,
        imageUrl: "https://via.placeholder.com/300",
        category: "Apparel",
        inStock: true,
        variants: ["M", "L", "XL"]
    }
];


router.get("/", (_req, res) => {
    res.json(products);
});


router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const product = products.find(p => p.id === id);
    if (!product) {
        return res.status(404).json({ error: "Not found" });
    }
    res.json(product);
});

export default router;
