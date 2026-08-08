"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const FALLBACK = "/images/plants/1.jpg";

type SafeImageProps = Omit<ImageProps, "onError"> & {
    fallbackSrc?: string;
};

/**
 * next/image wrapper that gracefully falls back to a local placeholder
 * when a (possibly admin-entered) image URL fails to load.
 */
export function SafeImage({ src, fallbackSrc = FALLBACK, alt, ...rest }: SafeImageProps) {
    const [failed, setFailed] = useState(false);
    const resolved = failed ? fallbackSrc : src;

    return (
        <Image
            src={resolved}
            alt={alt}
            {...rest}
            onError={() => setFailed(true)}
        />
    );
}
