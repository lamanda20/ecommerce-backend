import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.product.deleteMany();

    await prisma.product.createMany({
        data: [
            {
                name: "Classic T-Shirt",
                price: 19.99,
                imageUrl: "https://picsum.photos/seed/tshirt/600/400",
                category: "Apparel",
                inStock: true,
                variants: JSON.stringify(["S", "M", "L", "XL"]),
            },
            {
                name: "Running Shoes",
                price: 79.5,
                imageUrl: "https://picsum.photos/seed/shoes/600/400",
                category: "Footwear",
                inStock: false,
                variants: JSON.stringify(["40", "41", "42", "43"]),
            },
            {
                name: "Hoodie",
                price: 49.0,
                imageUrl: "https://picsum.photos/seed/hoodie/600/400",
                category: "Apparel",
                inStock: true,
                variants: JSON.stringify(["Black", "Gray"]),
            },
        ],
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
