/**
 * shadcn/ui Component Library
 *
 * This directory contains reusable UI components based on shadcn/ui patterns.
 * Components are built with Radix UI primitives and styled with Tailwind CSS.
 *
 * Usage:
 *   import { Button, Card, Dialog } from '@/components/ui';
 *
 * @see https://ui.shadcn.com for component documentation
 */

// Core components
export { Button, buttonVariants } from './button';
export { Badge, badgeVariants } from './badge';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card';
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu';
export { Input } from './input';
export { Label } from './label';
export { Separator } from './separator';
export { Textarea } from './textarea';

// Accordion
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './accordion';

// Form components
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from './form';
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select';
export { RadioGroup, RadioGroupItem } from './radio-group';
export { Switch } from './switch';
export { Slider } from './slider';
export {
  Stepper,
  StepperItem,
  StepperConnector,
  StepperDots,
  StepperProgress,
  useStepper,
} from './stepper';
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './sheet';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './tooltip';

// Navigation components
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './breadcrumb';
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './sidebar';

// Scroll components
export { ScrollArea, ScrollBar } from './scroll-area';

// Loading & Progress components
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonInput,
  SkeletonTable,
  SkeletonStatsCard,
  SkeletonPlanCard,
  SkeletonSection,
  SkeletonPage,
} from './skeleton';
export {
  Progress,
  ProgressWithLabel,
  CircularProgress,
  IndeterminateProgress,
  StepProgress,
} from './progress';
export {
  Spinner,
  spinnerVariants,
  DotsLoader,
  PulseLoader,
  LoadingOverlay,
  ButtonLoader,
  PageLoader,
  InlineLoader,
} from './spinner';

// Alert & Confirmation dialogs
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog';

// Accessibility components
export { SkipLink, SkipLinks, VisuallyHidden, Announce } from './skip-link';

// Animation components
export {
  PageTransition,
  FadeIn,
  SlideIn,
  StaggerContainer,
  StaggerItem,
  Collapse,
  ScaleOnHover,
} from './page-transition';
