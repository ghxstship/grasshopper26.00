/**
 * GVTEWAY Home Page
 * Fully compliant with GHXSTSHIP Design System
 */

import { Button } from "@/design-system/components/atoms/button"
import { ArrowRight, Calendar, Music, ShoppingBag, Ticket } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <>
      {/* Hero Section - GHXSTSHIP Style */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white border-b-3 border-black">
        {/* Halftone pattern background */}
        <div className="absolute inset-0 bg-halftone-pattern opacity-5" />
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto py-20">
          <h1 className="font-anton text-hero uppercase mb-6 text-black">
            EXPERIENCE LIVE
          </h1>
          <p className="font-share text-body text-grey-600 mb-12 max-w-2xl mx-auto">
            World-class festivals, concerts, and events. All in one place.
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link href="/events">
              <Button 
                size="lg" 
                className="font-bebas text-xl uppercase border-3 border-black bg-black text-white hover:bg-grey-900 transition-colors"
              >
                Explore Events <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/artists">
              <Button 
                size="lg" 
                variant="outline"
                className="font-bebas text-xl uppercase border-3 border-black bg-white text-black hover:bg-grey-100 transition-colors"
              >
                View Artists
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - GHXSTSHIP Grid */}
      <section className="py-20 px-4 bg-grey-100 border-b-3 border-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-anton text-h1 uppercase text-center mb-16 text-black">
            EVERYTHING YOU NEED
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Calendar className="h-16 w-16" />}
              title="EVENTS"
              description="Discover festivals, concerts, and club nights near you"
            />
            <FeatureCard
              icon={<Music className="h-16 w-16" />}
              title="ARTISTS"
              description="Follow your favorite artists and never miss a show"
            />
            <FeatureCard
              icon={<Ticket className="h-16 w-16" />}
              title="TICKETS"
              description="Secure ticketing with instant QR code delivery"
            />
            <FeatureCard
              icon={<ShoppingBag className="h-16 w-16" />}
              title="MERCH"
              description="Exclusive merchandise and collectibles"
            />
          </div>
        </div>
      </section>

      {/* CTA Section - GHXSTSHIP Bold */}
      <section className="py-20 px-4 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-anton text-h1 uppercase mb-6">
            READY TO EXPERIENCE THE BEST?
          </h2>
          <p className="font-share text-body text-grey-300 mb-12">
            Join thousands of fans and never miss a moment
          </p>
          <Link href="/signup">
            <Button 
              size="lg" 
              className="font-bebas text-xl uppercase border-3 border-white bg-white text-black hover:bg-grey-100 transition-colors"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white border-3 border-black p-8 transition-all hover:shadow-geometric">
      <div className="mb-6 text-black">{icon}</div>
      <h3 className="font-bebas text-h4 uppercase mb-3 text-black">{title}</h3>
      <p className="font-share text-meta text-grey-600">{description}</p>
    </div>
  )
}
