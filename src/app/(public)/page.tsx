import { Button } from "@/design-system/components/atoms/button"
import { ArrowRight, Calendar, Music, ShoppingBag, Ticket } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070')] bg-cover bg-center opacity-30" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-brand-primary)' }}>
            Experience Live
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
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
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--color-bg-overlay)' }}>
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
      <section className="py-20 px-4" style={{ background: 'var(--gradient-brand-dark)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience the Best?
          </h2>
          <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Join thousands of fans and never miss a moment
          </p>
          <Button size="lg" variant="secondary" className="text-lg" asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div 
      className="p-6 rounded-lg backdrop-blur-sm border transition-all"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="mb-4" style={{ color: 'var(--color-primary)' }}>{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p style={{ color: 'var(--color-text-tertiary)' }}>{description}</p>
    </div>
  )
}
