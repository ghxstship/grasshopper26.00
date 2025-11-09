/**
 * Component Barrel Exports
 * Centralized exports for cleaner component imports
 */

// UI Components (Design System)
export { Button } from '@/design-system/components/atoms/button'
export { Input } from '@/design-system/components/atoms/input'
export { Textarea } from '@/design-system/components/atoms/textarea'
export { Label } from '@/design-system/components/atoms/label'
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/design-system/components/atoms/card'
export { Tabs, TabsList, TabsTrigger, TabsContent } from '@/design-system/components/atoms/tabs'
export { Badge } from '@/design-system/components/atoms/badge'
export { Avatar, AvatarImage, AvatarFallback } from '@/design-system/components/atoms/avatar'
export { Checkbox } from '@/design-system/components/atoms/checkbox'
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/design-system/components/atoms/select'
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/design-system/components/atoms/table'
export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/design-system/components/atoms/alert-dialog'
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/design-system/components/atoms/dropdown-menu'
export { Toaster } from '@/design-system/components/atoms/sonner'
export { LoadingSpinner, LoadingOverlay, PageLoader, Skeleton, TableSkeleton, CardSkeleton, LoadingButton } from '@/design-system/components/atoms/loading'
export { EmptyState } from '@/design-system/components/atoms/empty-state'
export { ConfirmationDialog } from '@/design-system/components/atoms/confirmation-dialog'
export { ImageUpload } from '@/design-system/components/atoms/image-upload'

// Feature Components (Molecules)
export { AddToCartButton } from '@/design-system/components/molecules/add-to-cart-button'
export { CartButton } from '@/design-system/components/molecules/cart-button'
export { SearchBar } from '@/design-system/components/molecules/search-bar'
export { TicketDisplay } from '@/design-system/components/molecules/ticket-display'
export { TicketSelector } from '@/design-system/components/molecules/ticket-selector'

// Layout & Core
export { ErrorBoundary } from './error-boundary'
export { ThemeProvider } from './theme-provider'

// Privacy
export { CookieConsent } from './privacy/cookie-consent'

// Navigation
export { Breadcrumb } from './ui/breadcrumb'
