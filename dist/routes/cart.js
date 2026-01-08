"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const carts = new Map();
function getCartId(req) {
    // Accept cart id from header or query; fall back to 'default'
    return (req.header("x-cart-id") || req.query.cartId || "default");
}
function getOrCreateCart(cartId) {
    if (!carts.has(cartId))
        carts.set(cartId, []);
    return carts.get(cartId);
}
const AddSchema = zod_1.z.object({
    productId: zod_1.z.number().int().positive(),
    quantity: zod_1.z.number().int().min(1).optional(),
    variant: zod_1.z.string().optional(),
});
const RemoveSchema = zod_1.z.object({
    productId: zod_1.z.number().int().positive(),
    variant: zod_1.z.string().optional(),
    quantity: zod_1.z.number().int().min(1).optional(),
});
// GET /cart - returns the cart for the provided cart id
router.get("/", async (req, res) => {
    const cartId = getCartId(req);
    const cart = getOrCreateCart(cartId);
    // Enrich items with product data
    const items = await Promise.all(cart.map(async (item) => {
        const product = await prisma_1.default.product.findUnique({ where: { id: item.productId } });
        return {
            ...item,
            product: product
                ? { id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl }
                : null,
        };
    }));
    res.json({ cartId, items });
});
// POST /cart/add - add item to cart
router.post("/add", async (req, res) => {
    const parsed = AddSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { productId, variant } = parsed.data;
    const quantity = parsed.data.quantity ?? 1;
    const product = await prisma_1.default.product.findUnique({ where: { id: productId } });
    if (!product)
        return res.status(404).json({ error: "Product not found" });
    // Optionally check variant exists
    if (variant) {
        try {
            const variants = JSON.parse(product.variants);
            if (!variants.includes(variant)) {
                return res.status(400).json({ error: "Invalid variant" });
            }
        }
        catch (e) {
            // ignore parsing errors and allow
        }
    }
    const cartId = getCartId(req);
    const cart = getOrCreateCart(cartId);
    const existing = cart.find((i) => i.productId === productId && i.variant === variant);
    if (existing) {
        existing.quantity += quantity;
    }
    else {
        cart.push({ productId, variant, quantity });
    }
    res.status(200).json({ cartId, items: cart });
});
// POST /cart/remove - remove or decrease quantity
router.post("/remove", async (req, res) => {
    const parsed = RemoveSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { productId, variant } = parsed.data;
    const quantity = parsed.data.quantity ?? null; // null means remove fully
    const cartId = getCartId(req);
    const cart = getOrCreateCart(cartId);
    const idx = cart.findIndex((i) => i.productId === productId && i.variant === variant);
    if (idx === -1)
        return res.status(404).json({ error: "Item not in cart" });
    if (quantity === null || cart[idx].quantity <= quantity) {
        // remove
        cart.splice(idx, 1);
    }
    else {
        cart[idx].quantity -= quantity;
    }
    res.json({ cartId, items: cart });
});
// POST /cart/clear - clear the cart
router.post("/clear", (req, res) => {
    const cartId = getCartId(req);
    carts.set(cartId, []);
    res.json({ cartId, items: [] });
});
exports.default = router;
