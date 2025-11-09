import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Music, ShoppingBag, Ticket } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070')] bg-cover bg-center opacity-30" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-brand-primary)' }}>
            Experience Live
          </h1>
          <p className="text-xl md:text-2xl text-secondary-foreground mb-8 max-w-2xl mx-auto">
            World-class festivals, concerts, and events. All in one place.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="text-lg" asChild>
              <Link href="/events">
                Explore Events <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg" asChild>
              <Link href="/artists">View Artists</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Everything You Need
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Calendar className="h-12 w-12" />}
              title="Events"
              description="Discover festivals, concerts, and club nights near you"
            />
            <FeatureCard
              icon={<Music className="h-12 w-12" />}
              title="Artists"
              description="Follow your favorite artists and never miss a show"
            />
            <FeatureCard
              icon={<Ticket className="h-12 w-12" />}
              title="Tickets"
              description="Secure ticketing with instant QR code delivery"
            />
            <FeatureCard
              icon={<ShoppingBag className="h-12 w-12" />}
              title="Merch"
              description="Exclusive merchandise and collectibles"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience the Best?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Join thousands of fans and never miss a moment
          </p>
          <Button size="lg" variant="secondary" className="text-lg" asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">GVTEWAY</h3>
              <p className="text-gray-400 text-sm">
                World-class entertainment experiences
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Discover</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/events" className="hover:text-white">Events</Link></li>
                <li><Link href="/artists" className="hover:text-white">Artists</Link></li>
                <li><Link href="/shop" className="hover:text-white">Shop</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 GVTEWAY. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
      <div className="text-purple-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
