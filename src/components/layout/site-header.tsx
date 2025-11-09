'use client';

/**
 * Site Header Component
 * Main navigation header for public-facing pages
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ShoppingCart, User, Search } from 'lucide-react';
import { Button } from '@/design-system/components/atoms/button';

const navigation = [
  { name: 'Events', href: '/events' },
  { name: 'Artists', href: '/artists' },
  { name: 'Shop', href: '/shop' },
  { name: 'News', href: '/news' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b-3 border-black bg-white">
      <nav className="container mx-auto px-4" aria-label="Main navigation">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-anton text-3xl uppercase tracking-tight">
                GVTEWAY
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`font-bebas text-xl uppercase transition-colors hover:text-primary ${
                    isActive ? 'text-primary' : 'text-black'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Shopping cart">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>

            {/* User Menu */}
            <Link href="/portal/dashboard">
              <Button variant="ghost" size="icon" aria-label="User account">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t-3 border-black py-4 md:hidden">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`font-bebas text-2xl uppercase transition-colors ${
                      isActive ? 'text-primary' : 'text-black hover:text-primary'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile Search */}
              <button className="flex items-center space-x-2 font-bebas text-2xl uppercase text-black hover:text-primary">
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
