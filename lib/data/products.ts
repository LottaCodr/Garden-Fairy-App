export type Product = {
    id: string;
    name: string;
    categoryId: string;
    description: string;
    image: string;
    tags: string[];
    isPremium: boolean;
    price: number;
    stock: number;
};

export const products: Product[] = [
    {
        id: "p1",
        name: "Monstera Deliciosa",
        categoryId: "garden",
        description:
            "A stunning tropical plant popular for its split leaves and air-purifying abilities. Thrives in bright, indirect light.",
        image: "/images/plants/5.jpg",
        tags: ["garden", "tropical", "air-purifying"],
        isPremium: false,
        price: 7500,
        stock: 25,
    },
    {
        id: "p2",
        name: "Home Space Optimizer",
        categoryId: "interior",
        description:
            "Transform your home or office using what you already own. Get layout and decor recommendations powered by AI.",
        image: "/images/plants/2.jpg",
        tags: ["home", "interior", "design"],
        isPremium: true,
        price: 11900,
        stock: 8,
    },
    {
        id: "p3",
        name: "Workspace Productivity Designer",
        categoryId: "workspace",
        description:
            "Optimize your desk and workspace for productivity, comfort, and aesthetics based on your profession.",
        image: "/images/plants/3.jpg",
        tags: ["workspace", "productivity", "design"],
        isPremium: true,
        price: 9500,
        stock: 15,
    },
    {
        id: "p4",
        name: "Garden & Outdoor Planner",
        categoryId: "garden",
        description:
            "Design and reorganize your garden or outdoor space using AI suggestions adapted to climate and space.",
        image: "/images/plants/4.jpg",
        tags: ["garden", "outdoor", "planning"],
        isPremium: false,
        price: 8500,
        stock: 12,
    },
    {
        id: "p5",
        name: "Snake Plant",
        categoryId: "garden",
        description:
            "A nearly indestructible indoor plant that filters air and tolerates low light. Perfect for first-time plant owners.",
        image: "/images/plants/1.jpg",
        tags: ["garden", "low-light", "air-purifying"],
        isPremium: false,
        price: 4500,
        stock: 45,
    },
    {
        id: "p6",
        name: "Personal Wardrobe Stylist",
        categoryId: "fashion",
        description:
            "Get endless outfit combinations from the clothes you already own, with AI-powered styling tailored to your vibe.",
        image: "/images/plants/6.jpg",
        tags: ["fashion", "styling", "ai"],
        isPremium: true,
        price: 6800,
        stock: 5,
    },
];
