"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { FiSun, FiMoon } from "react-icons/fi";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? (
        <FiMoon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all active:rotate-45 dark:scale-100 dark:rotate-0" />
      ) : (
        <FiSun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all duration-300 ease-in-out active:rotate-45 dark:-rotate-90" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
