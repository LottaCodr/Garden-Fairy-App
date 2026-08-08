import type { Product } from "@/types/api";

export function getProductImage(product?: Partial<Product> | null): string {
  if (!product) return "/images/plants/1.jpg";
  if (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
    return product.images[0];
  }
  if (Array.isArray(product.imageUrl) && product.imageUrl.length > 0 && product.imageUrl[0]?.url) {
    return product.imageUrl[0].url;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legacyImage = (product as any).image;
  if (typeof legacyImage === "string" && legacyImage) {
    return legacyImage;
  }
  return "/images/plants/1.jpg";
}

export function getProductImages(product?: Partial<Product> | null): string[] {
  if (!product) return ["/images/plants/1.jpg"];
  const list: string[] = [];
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (img && typeof img === "string") list.push(img);
    }
  }
  if (list.length === 0 && Array.isArray(product.imageUrl)) {
    for (const item of product.imageUrl) {
      if (item?.url) list.push(item.url);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legacyImage = (product as any).image;
  if (list.length === 0 && typeof legacyImage === "string" && legacyImage) {
    list.push(legacyImage);
  }
  return list.length > 0 ? list : ["/images/plants/1.jpg"];
}
