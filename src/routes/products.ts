import { Router } from "express";
import prisma from "../prisma";
import { z } from "zod";

const router = Router();

/**
 * GET /products
 * Optional: ?category=Apparel
 */
router.get("/", async (req, res) => {
    const category = req.query.category as string | undefined;

    const products = await prisma.product.findMany({
        where: category ? { category } : undefined,
        orderBy: { id: "asc" },
    });

    res.json(
        products.map((p) => ({
            ...p,
            variants: JSON.parse(p.variants),
        }))
    );
});

/**
 * GET /products/:id
 */
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: "Not found" });

    res.json({ ...product, variants: JSON.parse(product.variants) });
});

/**
 * POST /products (BONUS)
 */
const ProductSchema = z.object({
    name: z.string().min(2),
    price: z.number().positive(),
    imageUrl: z.string().url(),
    category: z.string(),
    inStock: z.boolean(),
    variants: z.array(z.string().min(1)),
});

router.post("/", async (req, res) => {
    const parsed = ProductSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(parsed.error.flatten());
    }

    const product = await prisma.product.create({
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

export default router;
