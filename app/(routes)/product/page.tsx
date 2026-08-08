import { redirect } from "next/navigation";

// Listing lives at /shop; this is here to keep /product as a valid route.
export default function ProductIndex() {
    redirect("/shop");
}
