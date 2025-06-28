'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { usePathname } from "next/navigation";
import { useState } from 'react'; // Only needed for the mobile menu toggle

// The navigation links for the site structure
const links: { name: string; href: string }[] = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Country', href: '/country' },
    { name: 'Methodology', href: '/methodology' },
    { name: 'About', href: '/about' }
];

export default function Navbar() {
    // REMOVED: All useState and useEffect hooks for scrolling are gone.
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    // SIMPLIFIED: Style logic now only depends on the current page path.
    const isHomePage = pathname === '/';

    const navClasses = isHomePage ? 'bg-transparent' : 'bg-nav-dark shadow-md';
    const linkColor = 'text-white'; // Text is now always white.
    const hoverColor = 'hover:text-gray-300';
    const activeClass = 'underline font-semibold'; // Active state is always the same.

    return (
        <motion.nav
            className={`fixed top-0 w-full z-50 px-6 py-4 transition-colors duration-300 ${navClasses}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo / Site Title */}
                <Link href="/" className={`text-2xl font-bold tracking-tight font-logo ${linkColor}`}>
                    ESS Index 2025
                </Link>

                {/* Desktop Navigation Links */}
                <div className={`hidden md:flex items-baseline gap-8 text-md font-tagline ${linkColor}`}>
                    {links.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`transition-colors duration-200 ${hoverColor} ${pathname === link.href ? activeClass : ''}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Mobile Menu Toggle Button */}
                <div className="md:hidden">
                    <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                        {menuOpen ? (
                            <X className={`w-6 h-6 ${linkColor}`} />
                        ) : (
                            <Menu className={`w-6 h-6 ${linkColor}`} />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        className="md:hidden mt-4 origin-top"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        {/* The mobile menu also uses the same background logic */}
                        <div className={`flex flex-col space-y-4 rounded-lg p-4 font-tagline ${isHomePage ? 'bg-black/50 backdrop-blur-sm' : 'bg-nav-dark'}`}>
                            {links.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`transition-colors duration-200 ${linkColor} ${hoverColor} ${pathname === link.href ? activeClass : ''}`}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}