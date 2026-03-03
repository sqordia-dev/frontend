/**
 * Hooks Index
 * Exports all custom hooks
 */

export { useAICoach } from './useAICoach';
export { useAutoSave } from './useAutoSave';
export { useGenerationStatus } from './useGenerationStatus';
export { useInlineEdit, type UseInlineEditOptions, type UseInlineEditReturn, type InlineEditSaveState } from './useInlineEdit';
export { useOnboarding } from './useOnboarding';
export { useQuestionnaireProgress } from './useQuestionnaireProgress';
export { useSectionObserver, useSectionRef } from './useSectionObserver';
export type { Section } from './useSectionObserver';
export { useReadingProgress } from './useReadingProgress';
export { useScrollSpy } from './useScrollSpy';
export { useCmsUndoRedo } from './useCmsUndoRedo';
export { useCmsVersionComparison } from './useCmsVersionComparison';
export type { DiffType, BlockDiff, SectionDiff, VersionComparisonResult } from './useCmsVersionComparison';
export { useFeatureFlag, useFeatureFlags, useFeatureFlagsAdmin } from './useFeatureFlag';

// Responsive hooks
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeDesktop,
  usePrefersReducedMotion,
  useIsPortrait,
  useIsTouchDevice
} from './useMediaQuery';
export {
  useBreakpoint,
  useBreakpointValue,
  useResponsiveValue,
  BREAKPOINTS
} from './useBreakpoint';
export type { Breakpoint } from './useBreakpoint';
