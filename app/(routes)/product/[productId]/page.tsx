import ProductDetailPage from "@/components/sections/product/product.detail";
import { products } from "@/lib/data/products";
import { type Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ productId: string }>;
}): Promise<Metadata> {
    const { productId } = await params;
    const product = products.find((p) => p.id === productId);

    if (!product) {
        return {
            title: "Product · The Garden Fairy",
            description: "Discover beautiful plants and AI-powered planners at The Garden Fairy.",
        };
    }

    return {
        title: product.name,
        description: product.description,
    };
}

const ProductPage = async ({
    params,
}: {
    params: Promise<{ productId: string }>;
}) => {
    const { productId } = await params;
    // The client component resolves the product from the live store
    // (which also includes products created in the admin panel).
    return <ProductDetailPage productId={productId} />;
};

export default ProductPage;
