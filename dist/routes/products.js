"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// 🔥 PRODUITS MOCKÉS (pas de DB)
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
// GET /products
router.get("/", (_req, res) => {
    res.json(products);
});
// GET /products/:id
router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const product = products.find(p => p.id === id);
    if (!product) {
        return res.status(404).json({ error: "Not found" });
    }
    res.json(product);
});
exports.default = router;
