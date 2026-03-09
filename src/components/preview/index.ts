// Main layout and sidebar components
export { default as PreviewLayout, usePreviewLayout } from './PreviewLayout';
export { default as PreviewSidebar, getSectionIcon } from './PreviewSidebar';
export { default as CollapsibleSidebar } from './CollapsibleSidebar';
export type { ExportFormat } from './CollapsibleSidebar';

// Section components
export { default as SectionCard } from './SectionCard';
export { default as QuickNavPill } from './QuickNavPill';
export { default as PlanReadinessBar } from './PlanReadinessBar';
export { default as DocumentCanvas, DocumentSection, DocumentDivider } from './DocumentCanvas';
export { default as HoverActions } from './HoverActions';

// Navigation components
export { default as NavigationRail } from './NavigationRail';
export { default as BottomTabBar } from './BottomTabBar';

// Content components
export { default as PreviewContent } from './PreviewContent';

// Reading experience components
export { ReadingProgressBar, CircularProgress } from './ReadingProgressBar';
export { StickyTableOfContents, MiniTableOfContents, VerticalDotIndicator } from './StickyTableOfContents';
export { FloatingActions, SimpleFAB } from './FloatingActions';
export { SectionSkeleton, DocumentSkeleton, InlineSkeleton, CardSkeleton } from './SectionSkeleton';

// Legacy components (kept for backwards compatibility)
export { default as SectionPreview } from './SectionPreview';

// Mobile components
export { default as MobileHeader } from './MobileHeader';
export { default as MobileDrawer } from './MobileDrawer';
export { DrawerNavigationItem, DrawerSectionLabel, MobileTocItem } from './MobileDrawer';

// Shared components
export { default as SectionEditorModal } from './SectionEditorModal';
export { default as ExportDropdown } from './ExportDropdown';
export { default as ShareModal } from './ShareModal';
export { default as ExportSuccessModal } from './ExportSuccessModal';

// Inline editing components
export {
  EditableSection,
  SaveIndicator,
  FloatingToolbar,
  EditableVisualElement,
  EditableTable,
  EditableChart,
  EditableMetrics,
} from './inline-edit';
