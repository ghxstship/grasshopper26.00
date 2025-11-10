/**
 * Organisms - Complex UI Components
 * Composed of molecules and atoms following atomic design principles
 */

// Artist organisms
export { ArtistFilters } from './artists/artist-filters';
export { ArtistGrid } from './artists/artist-grid';
export { FollowArtistButton } from './artists/follow-artist-button';

// Content organisms
export { PostGrid } from './content/post-grid';

// Event organisms
export { EventCard } from './events/event-card';

// Shop organisms
export { ProductGrid } from './shop/product-grid';
export { ProductDetailView } from './shop/product-detail-view';
export { ShopFilters } from './shop/shop-filters';

// Schedule organisms
export { ScheduleGrid } from './schedule/schedule-grid';

// Venue organisms
export { VenueMap as VenueMapOrganism } from './venue/venue-map';

// Messaging organisms
export { MessageThread } from './messaging/message-thread';

// Chat organisms
export { ChatRoom } from './chat/chat-room';

// Production advances organisms
export { CartSidebar } from './production-advances/CartSidebar';
export { FloatingCartButton } from './production-advances/FloatingCartButton';

// Standalone organisms (complex components not in molecules)
export { ImageUploadBW } from './image-upload-bw';
export { MusicPlayer } from './music-player';
export { VideoGallery } from './video-gallery';

// Admin organisms
export { default as AdminSidebar } from './admin/AdminSidebar';
export { default as AdminHeader } from './admin/AdminHeader';
export { AdminBreadcrumbs } from './admin/AdminBreadcrumbs';
export { default as AdminImageUpload } from './admin/ImageUpload';
export { RoleBadge } from './admin/RoleBadge';
export { CredentialBadge } from './admin/CredentialBadge';

// Event role organisms
export { QRScanner } from './event-roles/QRScanner';

// Layout organisms
export { SiteHeader } from './layout/site-header';
export { SiteFooter } from './layout/site-footer';

// Membership organisms
export { MembershipCard } from './membership/membership-card';
export { QuickStats } from './membership/quick-stats';
export { UpcomingEvents } from './membership/upcoming-events';
export { AvailableBenefits } from './membership/available-benefits';
export { MemberEvents } from './membership/member-events';
export { TierComparison } from './membership/tier-comparison';

// KPI Analytics organisms
export { KPIMetricCard } from './KPIMetricCard';
export { InsightsPanel } from './InsightsPanel';
