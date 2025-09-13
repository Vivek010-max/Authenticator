"use client";
import React, { useState, useEffect } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "../ui/navbar-menu";
import { cn } from "../lib/utils";
import ToggelSwitch from "../ui/ToggelSwitch";

const handleThemeChange = () => {
  const currentTheme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", currentTheme === "dark" ? "light" : "dark");
};

const NAV_ITEMS = [
  {
    name: "Services",
    links: [
      { label: "Web Development", href: "/web-dev" },
      { label: "Interface Design", href: "/interface-design" },
      { label: "SEO", href: "/seo" },
      { label: "Branding", href: "/branding" },
    ],
  },
  {
    name: "Products",
    custom: true, // will render ProductItems
  },
  {
    name: "Pricing",
    links: [
      { label: "Hobby", href: "/hobby" },
      { label: "Individual", href: "/individual" },
      { label: "Team", href: "/team" },
      { label: "verify", href: "/upload-certificate" },
    ],
  },
];

const PRODUCTS = [
  {
    title: "Algochurn",
    href: "https://algochurn.com",
    src: "https://assets.aceternity.com/demos/algochurn.webp",
    description: "Prepare for tech interviews like never before.",
  },
  {
    title: "Tailwind Master Kit",
    href: "https://tailwindmasterkit.com",
    src: "https://assets.aceternity.com/demos/tailwindmasterkit.webp",
    description: "Production ready Tailwind CSS components.",
  },
  {
    title: "Moonbeam",
    href: "https://gomoonbeam.com",
    src: "https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.51.31%E2%80%AFPM.png",
    description: "Go from idea to blog in minutes.",
  },
  {
    title: "Rogue",
    href: "https://userogue.com",
    src: "https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.47.07%E2%80%AFPM.png",
    description: "Respond to RFPs, RFIs and RFQs 10x faster.",
  },
];

export default function Navbar({ className }) {
  const [active, setActive] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // On mount, set theme based on localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
  <header className={cn("fixed top-3 left-0 right-0 z-[999]", className)}>
      <nav
        className="
          max-w-5xl mx-auto px-5 flex items-center justify-between
          bg-neutral-300/40 dark:bg-neutral-900/40
          shadow-2xl
          backdrop-blur-md
          rounded-3xl
          border border-neutral-400/60 dark:border-neutral-700/60
          transition-all duration-300
        "
        aria-label="Main navigation"
      >
        {/* Logo with white background container */}
        <a href="/" className="flex items-center space-x-4">
          <div className="bg-white rounded-full p-1 shadow-md flex items-center justify-center">
            <img
              src="/logo.ico"
              alt=" Logo"
              className="h-10 w-10 rounded-full object-cover"
            />
          </div>
          <span className="font-bold text-2xl tracking-wide text-neutral-900 dark:text-neutral-200 drop-shadow">
            Trustra
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          <Menu setActive={setActive} className="flex items-center space-x-6">
            {NAV_ITEMS.map((item) => (
              <MenuItem
                key={item.name}
                setActive={setActive}
                active={active}
                item={item.name}
              >
                {!item.custom ? (
                  <div className="flex flex-col space-y-3 py-1 px-1 text-base min-w-[170px]">
                    {item.links.map((link) => (
                      <HoveredLink
                        key={link.href}
                        href={link.href}
                        className="text-neutral-600 dark:text-neutral-300 hover:text-primary transition"
                      >
                        {link.label}
                      </HoveredLink>
                    ))}
                  </div>
                ) : (
                  // Products Mega Menu
                  <div className="grid grid-cols-2 gap-5 p-4">
                    {PRODUCTS.map((p) => (
                      <ProductItem key={p.href} {...p} />
                    ))}
                  </div>
                )}
              </MenuItem>
            ))}
          </Menu>
          {/* CTA */}
          <a
            href="/upload-verification"
            className="ml-3 px-6 py-2 rounded-full font-semibold bg-neutral-900/20 hover:bg-neutral-900/60 dark:bg-neutral-300/40 text-neutral-200 dark:text-neutral-900  shadow-md transition-all duration-200 focus:ring-2 focus:ring-primary"
          >
            Get Started
          </a>
        </div>

        {/* Theme Toggle */}
        <button>
        <ToggelSwitch onChange={handleThemeChange} />
        </button>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-xl focus:ring-2 focus:ring-primary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <span className="text-2xl text-white">&#10005;</span>
          ) : (
            <span className="text-2xl text-white">&#9776;</span>
          )}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
      ></div>

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 w-4/5 max-w-xs bg-neutral-900/95 backdrop-blur-2xl shadow-2xl z-50 p-5 pt-8 transition-transform duration-400 rounded-r-2xl border-r border-neutral-800/80",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col gap-7">
          <a href="/" className="flex items-center gap-3 mb-2">
            <div className="bg-white rounded-full p-1 shadow-md flex items-center justify-center">
              <img
                src="/logo.png"
                alt="MyBrand Logo"
                className="h-8 w-8 rounded-full object-cover"
              />
            </div>
            <span className="font-extrabold text-lg text-white">MyBrand</span>
          </a>
          {NAV_ITEMS.map((item) =>
            !item.custom ? (
              <div key={item.name}>
                <h4 className="font-semibold mb-1 text-neutral-200">
                  {item.name}
                </h4>
                <div className="flex flex-col gap-2 pl-1">
                  {item.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="hover:underline text-neutral-400 hover:text-primary text-base py-1 transition"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div key={item.name}>
                <h4 className="font-semibold mb-1 text-neutral-200">
                  Products
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {PRODUCTS.map((p) => (
                    <ProductItem key={p.href} {...p} />
                  ))}
                </div>
              </div>
            )
          )}
          <a
            href="/upload-verification"
            className="mt-4 w-fit text-center px-6 py-2 rounded-full font-semibold bg-primary hover:bg-primary-dark text-white shadow-xl transition"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}
