"use client";

import { useEffect, useState } from "react";

export function useScrollHeader(threshold = 120) {
    const [compact, setCompact] = useState(false);

    useEffect(() => {
        const onScroll = () => setCompact(window.scrollY > threshold);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [threshold]);

    return compact;
}
