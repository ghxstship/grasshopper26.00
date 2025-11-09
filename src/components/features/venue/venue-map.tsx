/**
 * Interactive Venue Map Component
 * Displays venue layout with stages, amenities, and navigation
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Navigation,
  MapPin,
  Utensils,
  Heart,
  ShoppingBag,
  Wifi,
  Accessibility,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VenueMapProps {
  eventId: string;
  venueData?: VenueData;
  className?: string;
}

interface VenueData {
  name: string;
  layout: {
    width: number;
    height: number;
    viewBox: string;
  };
  stages: Stage[];
  amenities: Amenity[];
  entrances: Entrance[];
  emergencyExits: EmergencyExit[];
}

interface Stage {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color?: string;
}

interface Amenity {
  id: string;
  type: 'food' | 'restroom' | 'medical' | 'merchandise' | 'wifi' | 'atm' | 'info' | 'accessibility';
  name: string;
  position: { x: number; y: number };
  description?: string;
}

interface Entrance {
  id: string;
  name: string;
  position: { x: number; y: number };
  type: 'main' | 'vip' | 'artist';
}

interface EmergencyExit {
  id: string;
  position: { x: number; y: number };
}

const AMENITY_ICONS = {
  food: Utensils,
  restroom: MapPin,
  medical: Heart,
  merchandise: ShoppingBag,
  wifi: Wifi,
  atm: MapPin,
  info: MapPin,
  accessibility: Accessibility,
};

const AMENITY_COLORS = {
  food: '#f59e0b',
  restroom: '#3b82f6',
  medical: '#ef4444',
  merchandise: '#8b5cf6',
  wifi: '#10b981',
  atm: '#06b6d4',
  info: '#6366f1',
  accessibility: '#14b8a6',
};

// Default venue data (example festival layout)
const DEFAULT_VENUE: VenueData = {
  name: 'Festival Grounds',
  layout: {
    width: 1000,
    height: 800,
    viewBox: '0 0 1000 800',
  },
  stages: [
    {
      id: 'main',
      name: 'Main Stage',
      type: 'main',
      position: { x: 500, y: 150 },
      size: { width: 300, height: 150 },
      color: '#667eea',
    },
    {
      id: 'secondary',
      name: 'Secondary Stage',
      type: 'secondary',
      position: { x: 200, y: 400 },
      size: { width: 200, height: 100 },
      color: '#764ba2',
    },
    {
      id: 'underground',
      name: 'Underground Stage',
      type: 'underground',
      position: { x: 700, y: 450 },
      size: { width: 200, height: 100 },
      color: '#f093fb',
    },
  ],
  amenities: [
    { id: 'food1', type: 'food', name: 'Food Court A', position: { x: 150, y: 600 } },
    { id: 'food2', type: 'food', name: 'Food Court B', position: { x: 850, y: 600 } },
    { id: 'restroom1', type: 'restroom', name: 'Restrooms', position: { x: 100, y: 300 } },
    { id: 'restroom2', type: 'restroom', name: 'Restrooms', position: { x: 900, y: 300 } },
    { id: 'medical1', type: 'medical', name: 'Medical Tent', position: { x: 500, y: 700 } },
    { id: 'merch1', type: 'merchandise', name: 'Merch Booth', position: { x: 500, y: 500 } },
    { id: 'wifi1', type: 'wifi', name: 'WiFi Zone', position: { x: 300, y: 250 } },
    { id: 'access1', type: 'accessibility', name: 'Accessible Area', position: { x: 700, y: 250 } },
  ],
  entrances: [
    { id: 'main-entrance', name: 'Main Entrance', position: { x: 500, y: 750 }, type: 'main' },
    { id: 'vip-entrance', name: 'VIP Entrance', position: { x: 100, y: 100 }, type: 'vip' },
  ],
  emergencyExits: [
    { id: 'exit1', position: { x: 50, y: 400 } },
    { id: 'exit2', position: { x: 950, y: 400 } },
    { id: 'exit3', position: { x: 500, y: 50 } },
  ],
};

export function VenueMap({ eventId, venueData = DEFAULT_VENUE, className }: VenueMapProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showAmenities, setShowAmenities] = useState(true);
  const [showEntrances, setShowEntrances] = useState(true);
  const [showExits, setShowExits] = useState(false);
  const [filterAmenity, setFilterAmenity] = useState<string | null>(null);
  const transformRef = useRef<any>(null);

  const handleReset = () => {
    transformRef.current?.resetTransform();
  };

  const handleZoomIn = () => {
    transformRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    transformRef.current?.zoomOut();
  };

  const handleItemClick = (id: string, type: 'stage' | 'amenity' | 'entrance') => {
    setSelectedItem(id);
  };

  const getSelectedItemInfo = () => {
    if (!selectedItem) return null;

    const stage = venueData.stages.find((s) => s.id === selectedItem);
    if (stage) return { type: 'stage', data: stage };

    const amenity = venueData.amenities.find((a) => a.id === selectedItem);
    if (amenity) return { type: 'amenity', data: amenity };

    const entrance = venueData.entrances.find((e) => e.id === selectedItem);
    if (entrance) return { type: 'entrance', data: entrance };

    return null;
  };

  const filteredAmenities = filterAmenity
    ? venueData.amenities.filter((a) => a.type === filterAmenity)
    : venueData.amenities;

  const selectedInfo = getSelectedItemInfo();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4 mr-1" />
            Zoom In
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4 mr-1" />
            Zoom Out
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <Maximize className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={showAmenities ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowAmenities(!showAmenities)}
          >
            Amenities
          </Button>
          <Button
            variant={showEntrances ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowEntrances(!showEntrances)}
          >
            Entrances
          </Button>
          <Button
            variant={showExits ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowExits(!showExits)}
          >
            Emergency Exits
          </Button>
        </div>
      </div>

      {/* Amenity Filters */}
      {showAmenities && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterAmenity === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterAmenity(null)}
          >
            All
          </Button>
          {Object.keys(AMENITY_ICONS).map((type) => (
            <Button
              key={type}
              variant={filterAmenity === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterAmenity(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      )}

      {/* Map Container */}
      <Card className="overflow-hidden bg-gray-50 dark:bg-gray-900">
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit
        >
          <TransformComponent
            wrapperClass="!w-full !h-[600px]"
            contentClass="!w-full !h-full"
          >
            <svg
              viewBox={venueData.layout.viewBox}
              className="w-full h-full"
              style={{ maxWidth: '100%', height: 'auto' }}
            >
              {/* Background */}
              <rect
                x="0"
                y="0"
                width={venueData.layout.width}
                height={venueData.layout.height}
                fill="#f9fafb"
                className="dark:fill-gray-800"
              />

              {/* Grid */}
              <defs>
                <pattern
                  id="grid"
                  width="50"
                  height="50"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 50 0 L 0 0 0 50"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                    className="dark:stroke-gray-700"
                  />
                </pattern>
              </defs>
              <rect
                x="0"
                y="0"
                width={venueData.layout.width}
                height={venueData.layout.height}
                fill="url(#grid)"
              />

              {/* Stages */}
              {venueData.stages.map((stage) => (
                <g
                  key={stage.id}
                  onClick={() => handleItemClick(stage.id, 'stage')}
                  className="cursor-pointer transition-all hover:opacity-80"
                >
                  <rect
                    x={stage.position.x - stage.size.width / 2}
                    y={stage.position.y - stage.size.height / 2}
                    width={stage.size.width}
                    height={stage.size.height}
                    fill={stage.color || '#667eea'}
                    stroke={selectedItem === stage.id ? '#000' : '#fff'}
                    strokeWidth={selectedItem === stage.id ? 4 : 2}
                    rx="8"
                  />
                  <text
                    x={stage.position.x}
                    y={stage.position.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="18"
                    fontWeight="bold"
                  >
                    {stage.name}
                  </text>
                </g>
              ))}

              {/* Amenities */}
              {showAmenities &&
                filteredAmenities.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity.type];
                  return (
                    <g
                      key={amenity.id}
                      onClick={() => handleItemClick(amenity.id, 'amenity')}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={amenity.position.x}
                        cy={amenity.position.y}
                        r="20"
                        fill={AMENITY_COLORS[amenity.type]}
                        stroke={selectedItem === amenity.id ? '#000' : '#fff'}
                        strokeWidth={selectedItem === amenity.id ? 3 : 1}
                      />
                      <text
                        x={amenity.position.x}
                        y={amenity.position.y + 35}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#374151"
                        className="dark:fill-gray-300"
                      >
                        {amenity.name}
                      </text>
                    </g>
                  );
                })}

              {/* Entrances */}
              {showEntrances &&
                venueData.entrances.map((entrance) => (
                  <g
                    key={entrance.id}
                    onClick={() => handleItemClick(entrance.id, 'entrance')}
                    className="cursor-pointer"
                  >
                    <rect
                      x={entrance.position.x - 25}
                      y={entrance.position.y - 15}
                      width="50"
                      height="30"
                      fill={entrance.type === 'vip' ? '#fbbf24' : '#10b981'}
                      stroke={selectedItem === entrance.id ? '#000' : '#fff'}
                      strokeWidth={selectedItem === entrance.id ? 3 : 1}
                      rx="4"
                    />
                    <text
                      x={entrance.position.x}
                      y={entrance.position.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {entrance.type.toUpperCase()}
                    </text>
                  </g>
                ))}

              {/* Emergency Exits */}
              {showExits &&
                venueData.emergencyExits.map((exit) => (
                  <g key={exit.id}>
                    <circle
                      cx={exit.position.x}
                      cy={exit.position.y}
                      r="15"
                      fill="#ef4444"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    <text
                      x={exit.position.x}
                      y={exit.position.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      EXIT
                    </text>
                  </g>
                ))}
            </svg>
          </TransformComponent>
        </TransformWrapper>
      </Card>

      {/* Selected Item Info */}
      {selectedInfo && (
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">
                {selectedInfo.type === 'stage' && selectedInfo.data.name}
                {selectedInfo.type === 'amenity' && selectedInfo.data.name}
                {selectedInfo.type === 'entrance' && selectedInfo.data.name}
              </h3>
              <Badge variant="outline" className="mt-1">
                {selectedInfo.type}
              </Badge>
              {selectedInfo.type === 'amenity' && 'description' in selectedInfo.data && selectedInfo.data.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedInfo.data.description}
                </p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
              Close
            </Button>
          </div>
        </Card>
      )}

      {/* Legend */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Map Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#667eea] rounded" />
            <span className="text-sm">Stages</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#f59e0b] rounded-full" />
            <span className="text-sm">Food</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#3b82f6] rounded-full" />
            <span className="text-sm">Restrooms</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#ef4444] rounded-full" />
            <span className="text-sm">Medical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#10b981] rounded" />
            <span className="text-sm">Entrance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#fbbf24] rounded" />
            <span className="text-sm">VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#ef4444] rounded-full" />
            <span className="text-sm">Emergency Exit</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
