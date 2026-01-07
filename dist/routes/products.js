"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const zod_1 = require("zod");
const router = (0, express_1.Router)();
/**
 * GET /products
 * Optional: ?category=Apparel
 */
router.get("/", async (req, res) => {
    const category = req.query.category;
    const products = await prisma_1.default.product.findMany({
        where: category ? { category } : undefined,
        orderBy: { id: "asc" },
    });
    res.json(products.map((p) => ({
        ...p,
        variants: JSON.parse(p.variants),
    })));
});
/**
 * GET /products/:id
 */
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id))
        return res.status(400).json({ error: "Invalid ID" });
    const product = await prisma_1.default.product.findUnique({ where: { id } });
    if (!product)
        return res.status(404).json({ error: "Not found" });
    res.json({ ...product, variants: JSON.parse(product.variants) });
});
/**
 * POST /products (BONUS)
 */
const ProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    price: zod_1.z.number().positive(),
    imageUrl: zod_1.z.string().url(),
    category: zod_1.z.string(),
    inStock: zod_1.z.boolean(),
    variants: zod_1.z.array(zod_1.z.string().min(1)),
});
router.post("/", async (req, res) => {
    const parsed = ProductSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(parsed.error.flatten());
    }
    const product = await prisma_1.default.product.create({
        data: {
            ...parsed.data,
            variants: JSON.stringify(parsed.data.variants),
        },
    });
    res.status(201).json({
        ...product,
        variants: parsed.data.variants,
    });
});
exports.default = router;
