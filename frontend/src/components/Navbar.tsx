'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, LayoutDashboard, Table2, FileText, Info } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react'; // Import useEffect

const links = [
  { name: 'Home', href: '/', icon: <Globe className="w-4 h-4 text-white" /> },
  { name: 'Data', href: '/data', icon: <Table2 className="w-4 h-4 text-white" /> },
  { name: 'Methods', href: '/methodology', icon: <FileText className="w-4 h-4 text-white" /> },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false); // New state for scroll
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Effect to handle scroll behavior
  useEffect(() => {
    // If not on the home page, the navbar should always have the scrolled style.
    // This assumes non-home pages have a consistent background where the blurred nav is desired.
    if (!isHomePage) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      // Set scrolled to true if window.scrollY is greater than a threshold (e.g., 20px)
      setScrolled(window.scrollY > 20);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage]); // Re-run effect if isHomePage changes

  // Dynamically apply classes based on `scrolled` state and `isHomePage`
  const navClasses = scrolled || !isHomePage
    ? 'bg-black/70 backdrop-blur-md shadow-md' // Changed to bg-black/90 for 90% opaque
    : 'bg-transparent'; // Transparent background when not scrolled and on home page

  const linkColor = 'text-white';
  const hoverColor = 'hover:text-gray-300';
  const activeClass = 'underline font-semibold';

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 px-6 py-4 transition-all duration-300 ${navClasses}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo / Site Title */}
        <Link href="/" className={`flex items-center gap-2 text-2xl font-bold tracking-tight font-logo ${linkColor}`}>
          <Globe className="w-6 h-6 text-white" />
          <span>Climate Analytics – Case Study</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className={`hidden md:flex items-baseline gap-8 text-md font-tagline ${linkColor}`}>
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-1 transition-colors duration-200 ${hoverColor} ${
                pathname === link.href ? activeClass : ''
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
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
            <div
              className={`flex flex-col space-y-4 rounded-lg p-4 font-tagline ${
                scrolled || !isHomePage ? 'bg-black/70 backdrop-blur-md' : 'bg-black/90 backdrop-blur-sm' // Changed to bg-black/90 for 90% opaque
              }`}
            >
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 transition-colors duration-200 ${linkColor} ${hoverColor} ${
                    pathname === link.href ? activeClass : ''
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}