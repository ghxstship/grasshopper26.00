import { usePathname } from "next/navigation"
import { useMemo } from "react"
import type { BreadcrumbItem } from "@/design-system/components/molecules/breadcrumb"

interface RouteConfig {
  pattern: RegExp
  generator: (pathname: string, matches: RegExpMatchArray) => BreadcrumbItem[]
}

// Route configuration for dynamic breadcrumb generation
const routeConfigs: RouteConfig[] = [
  // Admin routes
  {
    pattern: /^\/admin$/,
    generator: () => [{ label: "Admin", href: "/admin" }],
  },
  {
    pattern: /^\/admin\/dashboard$/,
    generator: () => [
      { label: "Admin", href: "/admin" },
      { label: "Dashboard" },
    ],
  },
  {
    pattern: /^\/admin\/events$/,
    generator: () => [
      { label: "Admin", href: "/admin" },
      { label: "Events" },
    ],
  },
  {
    pattern: /^\/admin\/events\/create$/,
    generator: () => [
      { label: "Admin", href: "/admin" },
      { label: "Events", href: "/admin/events" },
      { label: "Create Event" },
    ],
  },
  {
    pattern: /^\/admin\/events\/([^/]+)\/edit$/,
    generator: (_, matches) => [
      { label: "Admin", href: "/admin" },
      { label: "Events", href: "/admin/events" },
      { label: "Edit Event" },
    ],
  },
  {
    pattern: /^\/admin\/events\/([^/]+)\/tickets$/,
    generator: (_, matches) => [
      { label: "Admin", href: "/admin" },
      { label: "Events", href: "/admin/events" },
      { label: "Manage Tickets" },
    ],
  },
  {
    pattern: /^\/admin\/orders$/,
    generator: () => [
      { label: "Admin", href: "/admin" },
      { label: "Orders" },
    ],
  },
  {
    pattern: /^\/admin\/orders\/([^/]+)$/,
    generator: (_, matches) => [
      { label: "Admin", href: "/admin" },
      { label: "Orders", href: "/admin/orders" },
      { label: "Order Details" },
    ],
  },
  {
    pattern: /^\/admin\/orders\/([^/]+)\/refund$/,
    generator: (_, matches) => [
      { label: "Admin", href: "/admin" },
      { label: "Orders", href: "/admin/orders" },
      { label: "Order Details", href: `/admin/orders/${matches[1]}` },
      { label: "Process Refund" },
    ],
  },
  {
    pattern: /^\/admin\/products$/,
    generator: () => [
      { label: "Admin", href: "/admin" },
      { label: "Products" },
    ],
  },
  {
    pattern: /^\/admin\/products\/new$/,
    generator: () => [
      { label: "Admin", href: "/admin" },
      { label: "Products", href: "/admin/products" },
      { label: "New Product" },
    ],
  },
  {
    pattern: /^\/admin\/artists$/,
    generator: () => [
      { label: "Admin", href: "/admin" },
      { label: "Artists" },
    ],
  },
  {
    pattern: /^\/admin\/users$/,
    generator: () => [
      { label: "Admin", href: "/admin" },
      { label: "Users" },
    ],
  },
  {
    pattern: /^\/admin\/analytics$/,
    generator: () => [
      { label: "Admin", href: "/admin" },
      { label: "Analytics" },
    ],
  },
  // Portal routes
  {
    pattern: /^\/portal$/,
    generator: () => [{ label: "Portal" }],
  },
  // Public routes
  {
    pattern: /^\/artists$/,
    generator: () => [{ label: "Artists" }],
  },
  {
    pattern: /^\/artists\/([^/]+)$/,
    generator: (pathname, matches) => {
      const slug = matches[1]
      const label = slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
      return [
        { label: "Artists", href: "/artists" },
        { label },
      ]
    },
  },
  {
    pattern: /^\/shop$/,
    generator: () => [{ label: "Shop" }],
  },
  {
    pattern: /^\/shop\/([^/]+)$/,
    generator: (pathname, matches) => {
      const slug = matches[1]
      const label = slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
      return [
        { label: "Shop", href: "/shop" },
        { label },
      ]
    },
  },
  {
    pattern: /^\/news$/,
    generator: () => [{ label: "News" }],
  },
  {
    pattern: /^\/news\/([^/]+)$/,
    generator: (pathname, matches) => {
      const slug = matches[1]
      const label = slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
      return [
        { label: "News", href: "/news" },
        { label },
      ]
    },
  },
  // User routes
  {
    pattern: /^\/profile$/,
    generator: () => [{ label: "Profile" }],
  },
  {
    pattern: /^\/profile\/orders$/,
    generator: () => [
      { label: "Profile", href: "/profile" },
      { label: "Orders" },
    ],
  },
  {
    pattern: /^\/orders$/,
    generator: () => [{ label: "Orders" }],
  },
  {
    pattern: /^\/orders\/([^/]+)$/,
    generator: () => [
      { label: "Orders", href: "/orders" },
      { label: "Order Details" },
    ],
  },
  {
    pattern: /^\/favorites$/,
    generator: () => [{ label: "Favorites" }],
  },
  {
    pattern: /^\/schedule$/,
    generator: () => [{ label: "Schedule" }],
  },
  {
    pattern: /^\/cart$/,
    generator: () => [{ label: "Cart" }],
  },
  {
    pattern: /^\/checkout$/,
    generator: () => [{ label: "Checkout" }],
  },
  {
    pattern: /^\/checkout\/success$/,
    generator: () => [
      { label: "Checkout", href: "/checkout" },
      { label: "Success" },
    ],
  },
  {
    pattern: /^\/membership$/,
    generator: () => [{ label: "Membership" }],
  },
  {
    pattern: /^\/membership\/checkout$/,
    generator: () => [
      { label: "Membership", href: "/membership" },
      { label: "Checkout" },
    ],
  },
  // Legal routes
  {
    pattern: /^\/legal\/privacy$/,
    generator: () => [
      { label: "Legal", href: "/legal" },
      { label: "Privacy Policy" },
    ],
  },
  {
    pattern: /^\/legal\/terms$/,
    generator: () => [
      { label: "Legal", href: "/legal" },
      { label: "Terms of Service" },
    ],
  },
  {
    pattern: /^\/privacy$/,
    generator: () => [{ label: "Privacy Policy" }],
  },
  {
    pattern: /^\/terms$/,
    generator: () => [{ label: "Terms of Service" }],
  },
  {
    pattern: /^\/cookies$/,
    generator: () => [{ label: "Cookie Policy" }],
  },
]

/**
 * Hook to generate breadcrumb items based on the current pathname
 * @returns Array of breadcrumb items
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()

  return useMemo(() => {
    if (!pathname || pathname === "/") {
      return []
    }

    // Try to match against configured routes
    for (const config of routeConfigs) {
      const matches = pathname.match(config.pattern)
      if (matches) {
        return config.generator(pathname, matches)
      }
    }

    // Fallback: Generate breadcrumbs from path segments
    const segments = pathname.split("/").filter(Boolean)
    return segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/")
      const label = segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
      
      return {
        label,
        href: index < segments.length - 1 ? href : undefined,
      }
    })
  }, [pathname])
}
