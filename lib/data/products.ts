export type Product = {
    id: string;
    name: string;
    categoryId: string;
    description: string;
    image: string;
    tags: string[];
    isPremium: boolean;
};

export const products: Product[] = [
    {
        id: "p1",
        name: "Smart Wardrobe Stylist",
        categoryId: "fashion",
        description:
            "Upload photos of your wardrobe and get AI-generated outfit combinations tailored to your lifestyle, weather, and culture.",
        image: "/images/products/wardrobe-ai.png",
        tags: ["fashion", "ai", "wardrobe"],
        isPremium: false,
    },
    {
        id: "p2",
        name: "Home Space Optimizer",
        categoryId: "interior",
        description:
            "Transform your home or office using what you already own. Get layout and decor recommendations powered by AI.",
        image: "/images/products/home-space.png",
        tags: ["home", "interior", "design"],
        isPremium: true,
    },
    {
        id: "p3",
        name: "Workspace Productivity Designer",
        categoryId: "workspace",
        description:
            "Optimize your desk and workspace for productivity, comfort, and aesthetics based on your profession.",
        image: "/images/products/workspace.png",
        tags: ["workspace", "productivity", "design"],
        isPremium: true,
    },
    {
        id: "p4",
        name: "Garden & Outdoor Planner",
        categoryId: "garden",
        description:
            "Design and reorganize your garden or outdoor space using AI suggestions adapted to climate and space.",
        image: "/images/products/garden.png",
        tags: ["garden", "outdoor", "planning"],
        isPremium: false,
    },
];
