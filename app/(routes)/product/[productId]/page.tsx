import ProductDetailPage from "@/components/sections/product/product.detail";
import { products } from "@/lib/data/products";
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

    const product = products.find((p) => p.id === params.productId);

    // if (!product) {
    //     return <div>Product not found</div>;
    // }

    return (
        <ProductDetailPage product={product} />
    );
}

export default ProductPage