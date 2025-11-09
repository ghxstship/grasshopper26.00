/**
 * Site Footer Component
 * Main footer for public-facing pages
 */

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, Mail } from 'lucide-react';

const footerLinks = {
  events: [
    { name: 'Browse Events', href: '/events' },
    { name: 'Artists', href: '/artists' },
    { name: 'Venues', href: '/venues' },
    { name: 'Calendar', href: '/schedule' },
  ],
  shop: [
    { name: 'Merchandise', href: '/shop' },
    { name: 'Gift Cards', href: '/shop/gift-cards' },
    { name: 'Shipping Info', href: '/legal/shipping' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'News', href: '/news' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/legal/privacy' },
    { name: 'Terms of Service', href: '/legal/terms' },
    { name: 'Cookie Policy', href: '/legal/cookies' },
    { name: 'Accessibility', href: '/legal/accessibility' },
  ],
};

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/gvteway', icon: Facebook },
  { name: 'Instagram', href: 'https://instagram.com/gvteway', icon: Instagram },
  { name: 'Twitter', href: 'https://twitter.com/gvteway', icon: Twitter },
  { name: 'YouTube', href: 'https://youtube.com/gvteway', icon: Youtube },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-3 border-black bg-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-anton text-4xl uppercase tracking-tight">
                GVTEWAY
              </span>
            </Link>
            <p className="mt-4 font-share text-sm text-grey-600">
              Experience live music and entertainment like never before.
            </p>
            
            {/* Social Links */}
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black transition-colors hover:text-primary"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Events Column */}
          <div>
            <h3 className="font-bebas text-xl uppercase mb-4">Events</h3>
            <ul className="space-y-2">
              {footerLinks.events.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-share text-sm text-grey-600 transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="font-bebas text-xl uppercase mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-share text-sm text-grey-600 transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-bebas text-xl uppercase mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-share text-sm text-grey-600 transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-bebas text-xl uppercase mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-share text-sm text-grey-600 transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 border-t-3 border-black pt-8">
          <div className="flex flex-col items-center space-y-4 md:flex-row md:justify-between md:space-y-0">
            <div className="text-center md:text-left">
              <h3 className="font-bebas text-2xl uppercase mb-2">
                Stay in the Loop
              </h3>
              <p className="font-share text-sm text-grey-600">
                Get the latest events, news, and exclusive offers.
              </p>
            </div>
            <div className="flex w-full max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 border-3 border-black px-4 py-3 font-share text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Email address"
              />
              <button className="border-3 border-l-0 border-black bg-primary px-6 py-3 font-bebas text-lg uppercase text-white transition-colors hover:bg-primary-dark">
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-3 border-black bg-grey-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between space-y-4 text-center md:flex-row md:space-y-0 md:text-left">
            <p className="font-share text-sm text-grey-600">
              © {currentYear} GVTEWAY. All rights reserved.
            </p>
            <p className="font-share text-sm text-grey-600">
              Made with ❤️ for live music fans everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
