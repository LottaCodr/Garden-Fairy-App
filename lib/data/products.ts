export type Product = {
    id: string;
    name: string;
    categoryId: string;
    description: string;
    image: string;
    tags: string[];
    isPremium: boolean;
    price: number;
};

export const products: Product[] = [
    {
        id: "p1",
        name: "Monstera Deliciosa",
        categoryId: "indoor",
        description:
            "A stunning tropical plant popular for its split leaves and air-purifying abilities. Thrives in bright, indirect light.",
        image: "/images/plants/5.jpg",
        tags: ["indoor", "tropical", "air-purifying"],
        isPremium: false,
        price: 7500,
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
    },
];
