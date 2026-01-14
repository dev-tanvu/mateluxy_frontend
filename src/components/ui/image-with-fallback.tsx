'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

export function ImageWithFallback(props: ImageProps) {
    const [isError, setIsError] = useState(false);

    return (
        <Image
            {...props}
            onError={(e) => {
                setIsError(true);
                props.onError?.(e);
            }}
            unoptimized={isError || props.unoptimized}
        />
    );
}
