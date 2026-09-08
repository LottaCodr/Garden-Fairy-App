export type Product = {
    id: string;
    name: string;
    categoryId: string;
    description: string;
    image: string;
    images?: string[];
    gallery?: string[];
    tags: string[];
    isPremium: boolean;
    price: number;
    compareAtPrice?: number;
    stock: number;
    rating?: number;
    ratingCount?: number;
    care?: {
        sunlight: string;
        watering: string;
        temperature: string;
    };
};

// Expanded mock catalog — 16 products across 4 Garden Fairy collections
// All images are locally generated mock assets under /public/images/products/
// Optimized for e-commerce card layout (square, 1:1, warm off-white bg, studio light)

export const products: Product[] = [
    {
        id: "p01",
        name: "Monstera Deliciosa",
        categoryId: "garden",
        description:
            "Statement tropical plant with iconic fenestrated leaves. Air-purifying, pet-friendly care guide included. Thrives in bright indirect light.",
        image: "/images/products/monstera-deliciosa.jpg",
        images: ["/images/products/monstera-deliciosa.jpg"],
        tags: ["garden", "tropical", "air-purifying", "statement"],
        isPremium: false,
        price: 7500,
        compareAtPrice: 9500,
        stock: 28,
        rating: 4.8,
        ratingCount: 214,
        care: { sunlight: "Bright indirect", watering: "Weekly", temperature: "18-27°C" },
    },
    {
        id: "p02",
        name: "Snake Plant Laurentii",
        categoryId: "garden",
        description:
            "Nearly indestructible. Upright variegated leaves filter air and tolerate low light — perfect for beginners and offices.",
        image: "/images/products/snake-plant.jpg",
        images: ["/images/products/snake-plant.jpg"],
        tags: ["garden", "low-light", "air-purifying", "beginner"],
        isPremium: false,
        price: 4500,
        stock: 42,
        rating: 4.9,
        ratingCount: 332,
        care: { sunlight: "Low to bright", watering: "Every 2 weeks", temperature: "15-28°C" },
    },
    {
        id: "p03",
        name: "Fiddle Leaf Fig",
        categoryId: "garden",
        description:
            "Sculptural favorite with large glossy violin leaves. Makes any corner feel designed. Comes in 21cm beige ceramic pot.",
        image: "/images/products/fiddle-leaf-fig.jpg",
        images: ["/images/products/fiddle-leaf-fig.jpg"],
        tags: ["garden", "sculptural", "bright-light", "premium"],
        isPremium: true,
        price: 12500,
        compareAtPrice: 14800,
        stock: 9,
        rating: 4.7,
        ratingCount: 127,
        care: { sunlight: "Bright indirect", watering: "Weekly", temperature: "16-26°C" },
    },
    {
        id: "p04",
        name: "Golden Pothos - Trailing",
        categoryId: "garden",
        description:
            "Fast-growing trailing vine with heart-shaped gold-variegated leaves. Ideal for shelves, hangers, and desks. Low maintenance.",
        image: "/images/products/golden-pothos.jpg",
        images: ["/images/products/golden-pothos.jpg"],
        tags: ["garden", "trailing", "variegated", "hanging"],
        isPremium: false,
        price: 3800,
        stock: 36,
        rating: 4.8,
        ratingCount: 189,
        care: { sunlight: "Medium to low", watering: "Weekly", temperature: "17-30°C" },
    },
    {
        id: "p05",
        name: "Spider Plant Vittatum",
        categoryId: "garden",
        description:
            "Cheerful arching striped foliage with baby spiderettes. Non-toxic, air-purifying and incredibly easy to propagate.",
        image: "/images/products/spider-plant.jpg",
        images: ["/images/products/spider-plant.jpg"],
        tags: ["garden", "pet-friendly", "air-purifying", "propagate"],
        isPremium: false,
        price: 3200,
        stock: 51,
        rating: 4.6,
        ratingCount: 203,
        care: { sunlight: "Bright indirect", watering: "Weekly", temperature: "15-25°C" },
    },
    {
        id: "p06",
        name: "Calathea Orbifolia",
        categoryId: "garden",
        description:
            "Stunning oversized silver-striped leaves. Loves humidity — perfect for bathrooms and shaded corners. Premium sage pot.",
        image: "/images/products/calathea-orbifolia.jpg",
        images: ["/images/products/calathea-orbifolia.jpg"],
        tags: ["garden", "patterned", "humidity-loving", "premium"],
        isPremium: true,
        price: 8900,
        stock: 11,
        rating: 4.7,
        ratingCount: 98,
        care: { sunlight: "Shade to indirect", watering: "Keep moist", temperature: "18-24°C" },
    },
    {
        id: "p07",
        name: "Peace Lily",
        categoryId: "garden",
        description:
            "Elegant dark foliage with serene white spathes. Blooms indoors, purifies air, and signals when it needs water.",
        image: "/images/products/peace-lily.jpg",
        images: ["/images/products/peace-lily.jpg"],
        tags: ["garden", "flowering", "air-purifying", "elegant"],
        isPremium: false,
        price: 6200,
        stock: 24,
        rating: 4.8,
        ratingCount: 156,
        care: { sunlight: "Low to medium", watering: "Weekly", temperature: "18-27°C" },
    },
    {
        id: "p08",
        name: "Echeveria Succulent Trio",
        categoryId: "garden",
        description:
            "Rosette succulents in pastel mint and rose. Geometric concrete pot. Drought-tolerant, perfect for windowsills.",
        image: "/images/products/succulent-echeveria.jpg",
        images: ["/images/products/succulent-echeveria.jpg"],
        tags: ["garden", "succulent", "drought-tolerant", "mini"],
        isPremium: false,
        price: 3500,
        compareAtPrice: 4200,
        stock: 63,
        rating: 4.9,
        ratingCount: 278,
        care: { sunlight: "Bright direct", watering: "Every 2 weeks", temperature: "12-28°C" },
    },
    {
        id: "p09",
        name: "Ceramic Pots Set — Nordic (3 pcs)",
        categoryId: "interior",
        description:
            "Minimal matte ceramic in white, beige and sage. Textured glaze, drainage hole + bamboo saucer. Three sizes (12/16/20cm).",
        image: "/images/products/ceramic-pots-set.jpg",
        images: ["/images/products/ceramic-pots-set.jpg"],
        tags: ["interior", "pots", "minimal", "scandinavian"],
        isPremium: false,
        price: 9800,
        stock: 18,
        rating: 4.8,
        ratingCount: 112,
    },
    {
        id: "p10",
        name: "Macramé Plant Hanger — Natural",
        categoryId: "interior",
        description:
            "Hand-knotted cotton cord with wooden beads. 85cm drop, holds up to 5kg. Instant boho lift for any corner.",
        image: "/images/products/macrame-hanger.jpg",
        images: ["/images/products/macrame-hanger.jpg"],
        tags: ["interior", "boho", "handmade", "hanger"],
        isPremium: false,
        price: 4200,
        stock: 34,
        rating: 4.7,
        ratingCount: 87,
    },
    {
        id: "p11",
        name: "Oak Tripod Plant Stand",
        categoryId: "interior",
        description:
            "Mid-century light oak stand, 55cm height. Elevates pots off the floor, improves airflow and light. Holds up to 30cm pot.",
        image: "/images/products/wooden-plant-stand.jpg",
        // fallback until dedicated generation completes — uses ceramic set as placeholder
        images: ["/images/products/wooden-plant-stand.jpg", "/images/products/ceramic-pots-set.jpg"],
        tags: ["interior", "stand", "oak", "mid-century"],
        isPremium: false,
        price: 11200,
        compareAtPrice: 13500,
        stock: 14,
        rating: 4.8,
        ratingCount: 64,
    },
    {
        id: "p12",
        name: "Glass Desk Terrarium — Closed",
        categoryId: "workspace",
        description:
            "Geometric glass terrarium with cork base. Create a self-sustaining moss + fern micro-jungle for your desk. 18cm tall.",
        image: "/images/products/desk-terrarium.jpg",
        images: ["/images/products/desk-terrarium.jpg"],
        tags: ["workspace", "terrarium", "glass", "desk"],
        isPremium: false,
        price: 6800,
        stock: 22,
        rating: 4.6,
        ratingCount: 73,
        care: { sunlight: "Bright indirect", watering: "Mist weekly", temperature: "18-26°C" },
    },
    {
        id: "p13",
        name: "Mini Bonsai — Chinese Elm",
        categoryId: "workspace",
        description:
            "3-year trained Chinese Elm bonsai in shallow matte black pot. Includes care card and pruning shears. Calm, focused energy for desks.",
        image: "/images/products/mini-bonsai.jpg",
        images: ["/images/products/mini-bonsai.jpg"],
        tags: ["workspace", "bonsai", "zen", "premium"],
        isPremium: true,
        price: 15500,
        stock: 6,
        rating: 4.9,
        ratingCount: 45,
        care: { sunlight: "Bright", watering: "Every 2 days", temperature: "15-25°C" },
    },
    {
        id: "p14",
        name: "Copper Watering Can — 1L",
        categoryId: "garden",
        description:
            "Brushed copper watering can with long spout for precise watering. 1 litre, anti-drip. Ages beautifully to patina.",
        image: "/images/products/watering-can.jpg",
        images: ["/images/products/watering-can.jpg"],
        tags: ["garden", "tools", "copper", "accessory"],
        isPremium: false,
        price: 5400,
        stock: 27,
        rating: 4.7,
        ratingCount: 92,
    },
    {
        id: "p15",
        name: "Botanist Tool Kit — 5 Piece",
        categoryId: "garden",
        description:
            "Canvas roll with hand fork, trowel, pruners, weeder and brush — stainless steel + beech handles. For indoor & balcony gardeners.",
        image: "/images/products/gardening-tools.jpg",
        images: ["/images/products/gardening-tools.jpg"],
        tags: ["garden", "tools", "kit", "gift"],
        isPremium: false,
        price: 7200,
        stock: 31,
        rating: 4.8,
        ratingCount: 105,
    },
    {
        id: "p16",
        name: "Linen Garden Apron — Sage",
        categoryId: "fashion",
        description:
            "Heavyweight washed linen apron with leather straps and deep pockets. For potting, pruning and weekend markets. One size.",
        image: "/images/products/linen-apron.jpg",
        images: ["/images/products/linen-apron.jpg"],
        tags: ["fashion", "apron", "linen", "gardenwear"],
        isPremium: true,
        price: 8900,
        stock: 19,
        rating: 4.6,
        ratingCount: 58,
    },
];

// Back-compat: default shape used by some admin previews.
// Also export a BestSeller helper sorted by ratingCount
export const bestSellers = [...products].sort((a, b) => (b.ratingCount ?? 0) - (a.ratingCount ?? 0)).slice(0, 8);

// API-compatible mock array (maps legacy shape to types/api Product)
export const mockApiProducts = products.map((p) => ({
    _id: p.id,
    id: p.id,
    name: p.name,
    slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    category: p.categoryId,
    image: p.image,
    imageUrl: [{ url: p.image, publicId: p.id }],
    images: p.images ?? [p.image],
    stock: p.stock,
    sold: Math.floor((p.ratingCount ?? 50) * 0.7),
    rating: p.rating ?? 4.7,
    ratingCount: p.ratingCount ?? 80,
    isPremium: p.isPremium,
    tags: p.tags,
    status: "active" as const,
    care: p.care ?? { sunlight: "Bright indirect", watering: "Weekly", temperature: "18-26°C" },
    createdAt: new Date().toISOString(),
}));

// Helper to resolve image for product helpers
export const productImagesManifest = products.reduce(
    (acc, p) => {
        acc[p.id] = p.image;
        return acc;
    },
    {} as Record<string, string>,
);
