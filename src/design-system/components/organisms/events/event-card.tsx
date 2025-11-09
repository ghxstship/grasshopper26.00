'use client'

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface EventCardProps {
  event: {
    id: string
    name: string
    date: string
    venue: string
    imageUrl: string
    status: 'on-sale' | 'sold-out' | 'coming-soon'
    slug: string
  }
  className?: string
}

export function EventCard({ event, className }: EventCardProps) {
  return (
    <Link href={`/events/${event.slug}`}>
      <div className={cn(
        "relative overflow-hidden",
        "border-3 border-black",
        "bg-white",
        "hover:bg-black hover:border-white",
        "hover:scale-105",
        "transition-all duration-300",
        "group cursor-pointer",
        className
      )}>
        {/* B&W Image with halftone overlay */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={event.imageUrl}
            alt={event.name}
            fill
            className={cn(
              "object-cover",
              "grayscale",
              "group-hover:scale-110",
              "transition-transform duration-500"
            )}
          />
          <div className={cn(
            "absolute inset-0",
            "bg-halftone-pattern",
            "opacity-0 group-hover:opacity-30",
            "transition-opacity duration-300"
          )} />
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className={cn(
            "font-bebas text-h3 uppercase",
            "text-black group-hover:text-white",
            "transition-colors duration-300"
          )}>
            {event.name}
          </h3>
          
          <p className={cn(
            "font-share-mono text-meta uppercase",
            "text-grey-600 group-hover:text-grey-400",
            "mt-2 tracking-widest"
          )}>
            {event.date} {/* {event.venue} */}
          </p>

          {/* Status badge */}
          {event.status === 'sold-out' && (
            <div className={cn(
              "mt-4 inline-block",
              "px-4 py-2",
              "border-2 border-black group-hover:border-white",
              "bg-black group-hover:bg-white"
            )}>
              <span className={cn(
                "font-bebas text-h6 uppercase",
                "text-white group-hover:text-black"
              )}>
                SOLD OUT
              </span>
            </div>
          )}

          {event.status === 'on-sale' && (
            <div className={cn(
              "mt-4 inline-block",
              "px-4 py-2",
              "border-2 border-black group-hover:border-white",
              "bg-white group-hover:bg-black"
            )}>
              <span className={cn(
                "font-bebas text-h6 uppercase",
                "text-black group-hover:text-white"
              )}>
                ON SALE
              </span>
            </div>
          )}

          {event.status === 'coming-soon' && (
            <div className={cn(
              "mt-4 inline-block",
              "px-4 py-2",
              "border-2 border-grey-500 group-hover:border-grey-400",
              "bg-grey-100 group-hover:bg-grey-800"
            )}>
              <span className={cn(
                "font-bebas text-h6 uppercase",
                "text-grey-700 group-hover:text-grey-200"
              )}>
                COMING SOON
              </span>
            </div>
          )}
        </div>

        {/* Geometric accent */}
        <div className={cn(
          "absolute top-4 right-4",
          "w-12 h-12",
          "border-2 border-black group-hover:border-white",
          "rotate-45",
          "transition-colors duration-300"
        )} />
      </div>
    </Link>
  )
}
