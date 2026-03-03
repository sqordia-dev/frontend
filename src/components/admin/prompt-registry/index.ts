/**
 * Prompt Registry Components
 * Modular components for the redesigned prompt management system
 */

// Phase 1: Monaco Editor
export { MonacoPromptEditor } from './MonacoPromptEditor';

// Phase 2: Deployment Labels
export { DeploymentLabelPicker } from './DeploymentLabelPicker';
export { DeploymentBadge, type PromptAlias } from './DeploymentBadge';

// Phase 3: Diff View
export { VersionDiffViewer } from './VersionDiffViewer';
export { VersionHistorySidebar, type VersionHistoryItem } from './VersionHistorySidebar';

// Phase 4: AI Improver
export { PromptImprover } from './PromptImprover';
export { ImprovementPreview } from './ImprovementPreview';

// Phase 5: Command Palette
export { CommandPalette, useCommandPalette, createPromptRegistryActions, type CommandPaletteAction } from './CommandPalette';

// Phase 6: Analytics
export { PerformanceDashboard } from './PerformanceDashboard';
export { PromptMetricsCard, PromptMetricsMini } from './PromptMetricsCard';
export { UsageTrendChart, AcceptanceRateGauge } from './UsageTrendChart';

// Phase 7: A/B Testing
export { ABTestingPanel } from './ABTestingPanel';
export { PromptComparisonCard } from './PromptComparisonCard';

// Question Prompts Viewer
export { QuestionPromptViewer } from './QuestionPromptViewer';
