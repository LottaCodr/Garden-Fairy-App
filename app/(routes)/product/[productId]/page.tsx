import ProductDetailPage from "@/components/sections/product/product.detail";
import { products } from "@/lib/data/products";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ productId: string }>;
}): Promise<Metadata> {
    const { productId } = await params;
    const product = products.find((p) => p.id === productId);

    if (!product) {
        return {
            title: "Product not found · The Garden Fairy",
            description: "Discover beautiful plants and AI-powered planners at The Garden Fairy.",
        };
    }

    return {
        title: `${product.name} · The Garden Fairy`,
        description: product.description,
    };
}

const ProductPage = async ({
    params,
}: {
    params: Promise<{ productId: string }>;
}) => {
    const { productId } = await params;
    const product = products.find((p) => p.id === productId);

    if (!product) {
        notFound();
    }

    return <ProductDetailPage product={product} />;
};

export default ProductPage;
