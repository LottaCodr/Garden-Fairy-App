export type Testimonial = {
    id: string;
    name: string;
    role: string;
    quote: string;
    avatar?: string;
};

export const testimonials: Testimonial[] = [
    {
        id: "t1",
        name: "Amaka Okoye",
        role: "Fashion Enthusiast",
        quote: "I stopped buying unnecessary clothes. This app showed me over 30 outfit combinations from what I already had.",
        avatar: "/images/avatars/amaka.jpg",
    },
    {
        id: "t2",
        name: "Daniel Adebayo",
        role: "Remote Software Engineer",
        quote: "My workspace feels completely different. Same desk, same items — just arranged smarter.",
        avatar: "/images/avatars/daniel.jpg",
    },
    {
        id: "t3",
        name: "Sarah Johnson",
        role: "Interior Decor Consultant",
        quote: "This tool feels like having a junior interior designer that never gets tired.",
        avatar: "/images/avatars/sarah.jpg",
    },
    {
        id: "t4",
        name: "Chinedu Obi",
        role: "Home Owner",
        quote: "I used it to reorganize my living room and garden. The AI suggestions were shockingly accurate.",
        avatar: "/images/avatars/chinedu.jpg",
    },
    {
        id: "t5",
        name: "Ngozi Eze",
        role: "Plant Parent, Lagos",
        quote: "My Monstera arrived so healthy I cried! The Soil + care card made propagation actually fun.",
        avatar: "/images/avatars/sarah.jpg",
    },
    {
        id: "t6",
        name: "Tunde Balogun",
        role: "Café Owner",
        quote: "The ceramic pots turned our balcony into a jungle. Customers keep asking where we got them.",
        avatar: "/images/avatars/chinedu.jpg",
    },
];
