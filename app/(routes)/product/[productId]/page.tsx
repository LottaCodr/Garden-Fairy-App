import ProductDetailPage from "@/components/sections/product/product.detail";
import { type Metadata } from "next";


export async function generateMetadata({ params }: { params: { productId: string } }): Promise<Metadata> {

    const getPlants = ''


    if (!getPlants)
        return {
            title: "The Garden Fairy",
            description: "Discover beautiful indoor plants to enhance your space. Browse our collection of vibrant, easy-to-care-for plants perfect for every home."
        };

    return {
        title: "The Garden Fairy",
        description: "Discover beautiful indoor plants to enhance your space. Browse our collection of vibrant, easy-to-care-for plants perfect for every home."

    }


}


const ProductPage = ({ params }: {
    params: {
        productId: string
    }
}) => {

    return (
        <ProductDetailPage />
    )
}

export default ProductPage