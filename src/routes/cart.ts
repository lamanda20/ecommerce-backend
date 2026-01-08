import { Router } from "express";
import prisma from "../prisma";
import { z } from "zod";

const router = Router();

type CartItem = {
    productId: number;
    variant?: string;
    quantity: number;
};

const carts = new Map<string, CartItem[]>();

function getCartId(req: any) {

    return (req.header("x-cart-id") || req.query.cartId || "default") as string;
}

function getOrCreateCart(cartId: string) {
    if (!carts.has(cartId)) carts.set(cartId, []);
    return carts.get(cartId)!;
}

const AddSchema = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1).optional(),
    variant: z.string().optional(),
});

const RemoveSchema = z.object({
    productId: z.number().int().positive(),
    variant: z.string().optional(),
    quantity: z.number().int().min(1).optional(),
});


router.get("/", async (req, res) => {
    const cartId = getCartId(req);
    const cart = getOrCreateCart(cartId);

    // Enrich items with product data
    const items = await Promise.all(
        cart.map(async (item) => {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            return {
                ...item,
                product: product
                    ? { id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl }
                    : null,
            };
        })
    );

    res.json({ cartId, items });
});


router.post("/add", async (req, res) => {
    const parsed = AddSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { productId, variant } = parsed.data;
    const quantity = parsed.data.quantity ?? 1;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Optionally check variant exists
    if (variant) {
        try {
            const variants: string[] = JSON.parse(product.variants);
            if (!variants.includes(variant)) {
                return res.status(400).json({ error: "Invalid variant" });
            }
        } catch (e) {

        }
    }

    const cartId = getCartId(req);
    const cart = getOrCreateCart(cartId);

    const existing = cart.find((i) => i.productId === productId && i.variant === variant);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ productId, variant, quantity });
    }

    res.status(200).json({ cartId, items: cart });
});


router.post("/remove", async (req, res) => {
    const parsed = RemoveSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { productId, variant } = parsed.data;
    const quantity = parsed.data.quantity ?? null; // null means remove fully

    const cartId = getCartId(req);
    const cart = getOrCreateCart(cartId);

    const idx = cart.findIndex((i) => i.productId === productId && i.variant === variant);
    if (idx === -1) return res.status(404).json({ error: "Item not in cart" });

    if (quantity === null || cart[idx].quantity <= quantity) {
        // remove
        cart.splice(idx, 1);
    } else {
        cart[idx].quantity -= quantity;
    }

    res.json({ cartId, items: cart });
});

router.post("/clear", (req, res) => {
    const cartId = getCartId(req);
    carts.set(cartId, []);
    res.json({ cartId, items: [] });
});

export default router;

