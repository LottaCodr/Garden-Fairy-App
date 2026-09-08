export type Category = {
    id: string;
    name: string;
    description: string;
    icon: string;
    image: string;
    count?: number;
    color?: string;
};

export const categories: Category[] = [
    {
        id: "garden",
        name: "Garden & Outdoor",
        description: "Indoor plants, succulents, and gardening essentials — curated for every light level.",
        icon: "🌿",
        image: "/images/categories/garden.jpg",
        count: 9,
        color: "#2d6a4f",
    },
    {
        id: "interior",
        name: "Interior Design",
        description: "Pots, stands and hangers — elevate your green corner without buying new furniture.",
        icon: "🏠",
        image: "/images/categories/interior.jpg",
        count: 3,
        color: "#8a7a5b",
    },
    {
        id: "workspace",
        name: "Workspace",
        description: "Desk terrariums, mini bonsai and focus plants — calm, productive energy.",
        icon: "💻",
        image: "/images/categories/workspace.jpg",
        count: 2,
        color: "#5c6b6b",
    },
    {
        id: "fashion",
        name: "Garden Wear",
        description: "Linen aprons and garden wear — durable, beautiful, made to get a little dirty.",
        icon: "👕",
        image: "/images/categories/fashion.jpg",
        count: 2,
        color: "#d4a373",
    },
];

// Helper maps for UI
export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));
export const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name, icon: c.icon }));
