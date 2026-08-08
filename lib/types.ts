export type Product = {
    id: string;
    name: string;
    description: string;
    image: string;
    price: number;
};

export type Category = {
    id: string;
    name: string;
    image?: string;
    description?: string;
    icon?: string;
};

export type Testimonial = {
    id: string;
    quote: string;
    author?: string;
    name?: string;
    role?: string;
    avatar?: string;
};
