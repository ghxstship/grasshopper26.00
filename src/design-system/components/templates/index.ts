/**
 * Template Components
 * GHXSTSHIP Monochromatic Design System
 * Full page layouts and templates
 */

export { DashboardLayout } from './DashboardLayout/DashboardLayout';
export type { DashboardLayoutProps } from './DashboardLayout/DashboardLayout';

export { AuthLayout } from './AuthLayout/AuthLayout';
export type { AuthLayoutProps } from './AuthLayout/AuthLayout';

export { EventLayout } from './EventLayout/EventLayout';
export type { EventLayoutProps } from './EventLayout/EventLayout';

export { PortalLayout } from './PortalLayout/PortalLayout';
export type { PortalLayoutProps } from './PortalLayout/PortalLayout';

export { CheckoutLayout } from './CheckoutLayout/CheckoutLayout';
export type { CheckoutLayoutProps } from './CheckoutLayout/CheckoutLayout';

export { ContentLayout } from './ContentLayout/ContentLayout';
export type { ContentLayoutProps } from './ContentLayout/ContentLayout';

export { AdminLayout } from './AdminLayout/AdminLayout';
export type { AdminLayoutProps } from './AdminLayout/AdminLayout';

export { LandingLayout } from './LandingLayout/LandingLayout';
export type { LandingLayoutProps } from './LandingLayout/LandingLayout';

export { ErrorLayout } from './ErrorLayout/ErrorLayout';
export type { ErrorLayoutProps } from './ErrorLayout/ErrorLayout';

export { GridLayout } from './GridLayout/GridLayout';
export type { GridLayoutProps } from './GridLayout/GridLayout';

export { MembershipLayout } from './MembershipLayout/MembershipLayout';
export type { MembershipLayoutProps } from './MembershipLayout/MembershipLayout';

export * from './SplitLayout/SplitLayout';
export * from './EventDashboardLayout';
export * from './AnalyticsDashboardLayout';
export * from './DayOfShowLayout';
export * from './VendorManagementLayout';
export * from './WorkspaceLayout';
export * from './AutomationLayout';

export { FullscreenLayout } from './FullscreenLayout/FullscreenLayout';
export type { FullscreenLayoutProps } from './FullscreenLayout/FullscreenLayout';

export * from './AdminFormTemplate';
export * from './AdminListTemplate';
export * from './AuthCardTemplate/AuthCardTemplate';

// Template aliases for compatibility
export { AdminFormTemplate as AdminDetailTemplate } from './AdminFormTemplate/AdminFormTemplate';
export { AdminListTemplate as PublicBrowseTemplate } from './AdminListTemplate/AdminListTemplate';
export { CheckoutLayout as CheckoutFlowTemplate } from './CheckoutLayout/CheckoutLayout';
export { DashboardLayout as AdminDashboardTemplate } from './DashboardLayout/DashboardLayout';
export { PortalLayout as PortalDashboardTemplate } from './PortalLayout/PortalLayout';
export { ContentLayout as DetailViewTemplate } from './ContentLayout/ContentLayout';
export { ContentLayout as ContextualPageTemplate } from './ContentLayout/ContentLayout';
export { ContentLayout as LegalPageTemplate } from './ContentLayout/ContentLayout';
