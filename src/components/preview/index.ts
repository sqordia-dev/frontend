// Main layout and sidebar components (redesigned)
export { default as PreviewLayout, usePreviewLayout } from './PreviewLayout';
export { default as PreviewSidebar, getSectionIcon } from './PreviewSidebar';
export type { ExportFormat } from './PreviewSidebar';

// Navigation components
export { default as NavigationRail } from './NavigationRail';
export { default as BottomTabBar } from './BottomTabBar';

// Content components
export { default as SectionCard } from './SectionCard';
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
