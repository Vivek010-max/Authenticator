import React from "react";
import { cn } from "../lib/utils";

export default function GridBackground({
  children,
  className,
  containerClassName,
  height = "min-h-[40rem]",
}) {
  return (
    <section className={cn("relative w-full", height, className)}>
      {/* Gradient background with dark mode */}
  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_#f0f9ff,_#ffffff,_#e0f2fe)] dark:bg-[linear-gradient(to_bottom,_#0D111A,_#0D111A,_#0D111A)]" />

      {/* Grid lines with bluish dark mode */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none opacity-40",
          "[background-size:40px_40px]",
          // Light mode
          "[background-image:linear-gradient(to_right,rgba(56,189,248,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(29,78,216,0.3)_1px,transparent_1px)]",
          // Dark mode
          "dark:[background-image:linear-gradient(to_right,rgba(79,172,255,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,139,248,0.15)_1px,transparent_1px)]"
        )}
      />

      {/* Content wrapper */}
      <div
        className={cn(
          "relative z-20 mx-auto w-full px-6 md:px-12 lg:px-20 py-16 max-w-7xl",
          containerClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
