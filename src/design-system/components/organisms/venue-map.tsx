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
import styles from './venue-map.module.css';

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
    <div className={`${styles.container} ${className || ''}`}>
      {/* Controls */}
      <div className={styles.controls}>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomIn}
          disabled={zoom >= maxZoom}
          className={styles.controlButton}
        >
          <ZoomIn className={styles.controlIcon} />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomOut}
          disabled={zoom <= minZoom}
          className={styles.controlButton}
        >
          <ZoomOut className={styles.controlIcon} />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleReset}
          className={styles.controlButton}
        >
          <Maximize2 className={styles.controlIcon} />
        </Button>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <h3 className={styles.legendTitle}>Map Legend</h3>
        <div className={styles.legendGrid}>
          {Object.entries(POI_ICONS).map(([type, icon]) => (
            <div key={type} className={styles.legendItem}>
              <span className={styles.legendIcon}>{icon}</span>
              <span className={styles.legendLabel}>{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Container - Interactive application widget */}
      <div
        ref={containerRef}
        className={styles.mapContainer}
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
          className={styles.mapContent}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          transition={{ type: 'tween', duration: 0.1 }}
        >
          {/* Background Image */}
          {mapData.background_image_url && (
            <div className={styles.backgroundImage}>
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
              className={styles.svgLayer}
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
              className={styles.poiMarker}
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
                className={styles.poiIcon}
                style={{
                  backgroundColor: poi.color || POI_COLORS[poi.poi_type] || primitiveColors.brand[500],
                }}
              >
                <span className={styles.poiIconEmoji}>
                  {POI_ICONS[poi.poi_type] || '📍'}
                </span>
                {selectedPOI?.id === poi.id && (
                  <motion.div
                    className={styles.poiHighlight}
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
            className={styles.detailsPanel}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className={styles.detailsCard}>
              <div className={styles.detailsContent}>
                <div className={styles.detailsMain}>
                  <div className={styles.detailsHeader}>
                    <span className={styles.detailsIcon}>
                      {POI_ICONS[selectedPOI.poi_type] || '📍'}
                    </span>
                    <h3 className={styles.detailsTitle}>{selectedPOI.name}</h3>
                    <Badge variant="secondary" className={styles.detailsBadge}>
                      {selectedPOI.poi_type}
                    </Badge>
                  </div>
                  {selectedPOI.description && (
                    <p className={styles.detailsDescription}>
                      {selectedPOI.description}
                    </p>
                  )}
                  {selectedPOI.capacity && (
                    <p className={styles.detailsCapacity}>
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
