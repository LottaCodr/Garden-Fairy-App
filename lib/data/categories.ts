export type Category = {
    id: string;
    name: string;
    description: string;
    icon: string;
};

export const categories: Category[] = [
    {
        id: "fashion",
        name: "Fashion & Style",
        description:
            "Outfit planning, wardrobe optimization, and personal styling using AI.",
        icon: "👕",
    },
    {
        id: "interior",
        name: "Interior Design",
        description:
            "Home and office space optimization without buying new items.",
        icon: "🏠",
    },
    {
        id: "workspace",
        name: "Workspace",
        description:
            "Desk setups and work environments optimized for productivity and comfort.",
        icon: "💻",
    },
    {
        id: "garden",
        name: "Garden & Outdoor",
        description:
            "Outdoor layouts, plant placement, and garden styling recommendations.",
        icon: "🌿",
    },
];
