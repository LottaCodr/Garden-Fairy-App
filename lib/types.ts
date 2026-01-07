export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
}


export interface Category {
    id: string;
    name: string;
    image: string;
}


export interface Testimonial {
    id: string;
    quote: string;
    author: string;
}