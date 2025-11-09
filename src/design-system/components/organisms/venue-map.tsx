/* eslint-disable no-magic-numbers */
// Zoom levels, pan calculations, and map coordinates are interactive values that cannot be tokenized
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/design-system/components/atoms/button';
import { Card } from '@/design-system/components/atoms/card';
import { Badge } from '@/design-system/components/atoms/badge';
import { primitiveColors } from '@/design-system/tokens/primitives/colors';

interface VenueMapPOI {
  id: string;
  poi_type: string;
  name: string;
  description?: string;
  coordinates: { x: number; y: number };
  stage_id?: string;
  icon?: string;
  color?: string;
  capacity?: number;
}

interface VenueMapData {
  id: string;
  name: string;
  map_type: string;
  map_data: any;
  dimensions?: { width: number; height: number; scale?: number };
  background_image_url?: string;
}

interface VenueMapProps {
  eventId: string;
  mapData: VenueMapData;
  pois: VenueMapPOI[];
  onPOIClick?: (poi: VenueMapPOI) => void;
  className?: string;
}

const POI_ICONS: Record<string, string> = {
  stage: '🎵',
  restroom: '🚻',
  food: '🍔',
  medical: '⚕️',
  entrance: '🚪',
  exit: '🚪',
  atm: '💳',
  merchandise: '🛍️',
  parking: '🅿️',
  info: 'ℹ️',
};

// Use design tokens for POI colors
const POI_COLORS: Record<string, string> = {
  stage: primitiveColors.brand[500],
  restroom: primitiveColors.info[500],
  food: primitiveColors.warning[500],
  medical: primitiveColors.error[500],
  entrance: primitiveColors.success[500],
  exit: primitiveColors.error[500],
  atm: primitiveColors.info[400],
  merchandise: primitiveColors.accent[500],
  parking: primitiveColors.brand[600],
  info: primitiveColors.brand[500],
};

export function VenueMap({ eventId, mapData, pois, onPOIClick, className }: VenueMapProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedPOI, setSelectedPOI] = useState<VenueMapPOI | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const minZoom = 0.5;
  const maxZoom = 3;

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, maxZoom));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, minZoom));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePOIClick = (poi: VenueMapPOI) => {
    setSelectedPOI(poi);
    onPOIClick?.(poi);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(minZoom, Math.min(maxZoom, prev + delta)));
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomIn}
          disabled={zoom >= maxZoom}
          className="bg-white/90 backdrop-blur-sm"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomOut}
          disabled={zoom <= minZoom}
          className="bg-white/90 backdrop-blur-sm"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleReset}
          className="bg-white/90 backdrop-blur-sm"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-4 max-w-xs">
        <h3 className="font-semibold mb-2 text-sm">Map Legend</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(POI_ICONS).map(([type, icon]) => (
            <div key={type} className="flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Container - Interactive application widget */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden bg-gray-100 rounded-lg cursor-move"
        role="application" // Declares this as an interactive application widget
        aria-label="Interactive venue map"
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onKeyDown={(e) => {
          // Keyboard support for accessibility
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          transition={{ type: 'tween', duration: 0.1 }}
        >
          {/* Background Image */}
          {mapData.background_image_url && (
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={mapData.background_image_url}
                alt={mapData.name}
                fill
                className="object-contain"
                draggable={false}
                priority
              />
            </div>
          )}

          {/* SVG Map Layer */}
          {mapData.map_type === 'svg' && mapData.map_data && (
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 ${mapData.dimensions?.width || 1000} ${mapData.dimensions?.height || 1000}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Render SVG paths from map_data */}
              {mapData.map_data.paths?.map((path: any, index: number) => (
                <path
                  key={index}
                  d={path.d}
                  fill={path.fill || 'none'}
                  stroke={path.stroke || primitiveColors.neutral[900]}
                  strokeWidth={path.strokeWidth || 1}
                />
              ))}
            </svg>
          )}

          {/* POI Markers */}
          {pois.map((poi) => (
            <motion.div
              key={poi.id}
              className="absolute cursor-pointer"
              style={{
                left: `${poi.coordinates.x}%`,
                top: `${poi.coordinates.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePOIClick(poi)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePOIClick(poi);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${poi.name} - ${poi.poi_type}`}
            >
              <div
                className="relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg"
                style={{
                  backgroundColor: poi.color || POI_COLORS[poi.poi_type] || primitiveColors.brand[500],
                }}
              >
                <span className="text-2xl">
                  {POI_ICONS[poi.poi_type] || '📍'}
                </span>
                {selectedPOI?.id === poi.id && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.2 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* POI Details Panel */}
      <AnimatePresence>
        {selectedPOI && (
          <motion.div
            className="absolute bottom-4 left-4 right-4 z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="p-4 bg-white/95 backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {POI_ICONS[selectedPOI.poi_type] || '📍'}
                    </span>
                    <h3 className="font-semibold text-lg">{selectedPOI.name}</h3>
                    <Badge variant="secondary" className="capitalize">
                      {selectedPOI.poi_type}
                    </Badge>
                  </div>
                  {selectedPOI.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedPOI.description}
                    </p>
                  )}
                  {selectedPOI.capacity && (
                    <p className="text-xs text-gray-500">
                      Capacity: {selectedPOI.capacity}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedPOI(null)}
                >
                  ✕
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
