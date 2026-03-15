"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { useEffect, useState } from "react";

interface ThemedImageProps {
  lightSrc: string;
  darkSrc: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  inverted?: boolean;
}

export function ThemedImage({
  lightSrc,
  darkSrc,
  alt,
  width = 800,
  height = 600,
  className = "",
  inverted = false,
}: ThemedImageProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg ${className}`}
        style={{ width, height: height * 0.6 }}
      />
    );
  }

  // When inverted=true, show opposite theme image (dark users see light, light users see dark)
  const isDark = resolvedTheme === "dark";
  const src = inverted ? (isDark ? lightSrc : darkSrc) : isDark ? darkSrc : lightSrc;

  return (
    <ImageZoom>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`rounded-lg ${className}`}
        priority
      />
    </ImageZoom>
  );
}
