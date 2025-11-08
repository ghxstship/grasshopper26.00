/**
 * Component Barrel Exports
 * Centralized exports for cleaner component imports
 */

// UI Components (shadcn/ui)
export { Button } from './ui/button'
export { Input } from './ui/input'
export { Textarea } from './ui/textarea'
export { Label } from './ui/label'
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
export { Badge } from './ui/badge'
export { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
export { Checkbox } from './ui/checkbox'
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from './ui/alert-dialog'
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu'
export { Toaster } from './ui/sonner'
export { LoadingSpinner, LoadingOverlay, PageLoader, Skeleton, TableSkeleton, CardSkeleton, LoadingButton } from './ui/loading'
export { EmptyState } from './ui/empty-state'
export { ConfirmationDialog } from './ui/confirmation-dialog'
export { ImageUpload } from './ui/image-upload'

// Feature Components
export { AddToCartButton } from './features/add-to-cart-button'
export { CartButton } from './features/cart-button'
export { SearchBar } from './features/search-bar'
export { TicketDisplay } from './features/ticket-display'
export { TicketSelector } from './features/ticket-selector'

// Layout & Core
export { ErrorBoundary } from './error-boundary'
export { ThemeProvider } from './theme-provider'

// Privacy
export { CookieConsent } from './privacy/cookie-consent'
