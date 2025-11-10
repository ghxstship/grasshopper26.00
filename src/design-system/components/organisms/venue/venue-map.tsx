/**
 * Interactive Venue Map Component
 * Displays venue layout with stages, amenities, and navigation
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Button } from '@/design-system/components/atoms/button';
import { Card } from '@/design-system/components/atoms/card';
import { Badge } from '@/design-system/components/atoms/badge';
import styles from './venue-map.module.css';
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
  food: 'var(--color-warning)',
  restroom: 'var(--color-info)',
  medical: 'var(--color-error)',
  merchandise: 'var(--color-primary)',
  wifi: 'var(--color-success)',
  atm: 'var(--color-info)',
  info: 'var(--color-primary)',
  accessibility: 'var(--color-success)',
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
      color: 'var(--color-primary)',
    },
    {
      id: 'secondary',
      name: 'Secondary Stage',
      type: 'secondary',
      position: { x: 200, y: 400 },
      size: { width: 200, height: 100 },
      color: 'var(--color-primary-hover)',
    },
    {
      id: 'underground',
      name: 'Underground Stage',
      type: 'underground',
      position: { x: 700, y: 450 },
      size: { width: 200, height: 100 },
      color: 'var(--color-accent)',
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
      <div className={styles.row}>
        <div className={styles.card}>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className={styles.icon} />
            Zoom In
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className={styles.icon} />
            Zoom Out
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <Maximize className={styles.icon} />
            Reset
          </Button>
        </div>

        <div className={styles.card}>
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
        <div className={styles.card}>
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
      <Card className={styles.card}>
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
              className={styles.mapSvg}
            >
              {/* Background */}
              <rect
                x="0"
                y="0"
                width={venueData.layout.width}
                height={venueData.layout.height}
                fill="var(--color-bg-secondary)"
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
                    stroke="var(--color-border-default)"
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
                    fill={stage.color || 'var(--color-primary)'}
                    stroke={selectedItem === stage.id ? 'var(--color-text-primary)' : 'var(--color-text-inverse)'}
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
                        stroke={selectedItem === amenity.id ? 'var(--color-text-primary)' : 'var(--color-text-inverse)'}
                        strokeWidth={selectedItem === amenity.id ? 3 : 1}
                      />
                      <text
                        x={amenity.position.x}
                        y={amenity.position.y + 35}
                        textAnchor="middle"
                        fontSize="12"
                        fill="var(--color-text-primary)"
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
                      fill={entrance.type === 'vip' ? 'var(--color-warning)' : 'var(--color-success)'}
                      stroke={selectedItem === entrance.id ? 'var(--color-text-primary)' : 'var(--color-text-inverse)'}
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
                      fill="var(--color-error)"
                      stroke="var(--color-text-inverse)"
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
        <Card className={styles.card}>
          <div className={styles.container}>
            <div>
              <h3 className={styles.text}>
                {selectedInfo.type === 'stage' && selectedInfo.data.name}
                {selectedInfo.type === 'amenity' && selectedInfo.data.name}
                {selectedInfo.type === 'entrance' && selectedInfo.data.name}
              </h3>
              <Badge variant="outline" className={styles.marginTop1}>
                {selectedInfo.type}
              </Badge>
              {selectedInfo.type === 'amenity' && 'description' in selectedInfo.data && selectedInfo.data.description && (
                <p className={styles.text}>
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
      <Card className={styles.legendContainer}>
        <h3 className={styles.legendTitle}>Map Legend</h3>
        <div className={styles.legendGrid}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: 'var(--color-primary)' }} />
            <span className={styles.legendLabel}>Stages</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColorCircle} style={{ backgroundColor: 'var(--color-warning)' }} />
            <span className={styles.legendLabel}>Food</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColorCircle} style={{ backgroundColor: 'var(--color-info)' }} />
            <span className={styles.legendLabel}>Restrooms</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColorCircle} style={{ backgroundColor: 'var(--color-error)' }} />
            <span className={styles.legendLabel}>Medical</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: 'var(--color-success)' }} />
            <span className={styles.legendLabel}>Entrance</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: 'var(--color-warning)' }} />
            <span className={styles.legendLabel}>VIP</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColorCircle} style={{ backgroundColor: 'var(--color-error)' }} />
            <span className={styles.legendLabel}>Emergency Exit</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
