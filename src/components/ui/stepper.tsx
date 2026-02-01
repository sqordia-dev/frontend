import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperContextValue {
  currentStep: number;
  totalSteps: number;
  orientation: "horizontal" | "vertical";
  onStepClick?: (index: number) => void;
}

const StepperContext = React.createContext<StepperContextValue | undefined>(
  undefined
);

function useStepper() {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error("Stepper components must be used within a Stepper");
  }
  return context;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
  children?: React.ReactNode;
}

function Stepper({
  steps,
  currentStep,
  onStepClick,
  orientation = "horizontal",
  className,
}: StepperProps) {
  return (
    <StepperContext.Provider
      value={{
        currentStep,
        totalSteps: steps.length,
        orientation,
        onStepClick,
      }}
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal"
            ? "flex-row items-center justify-between"
            : "flex-col",
          className
        )}
        role="navigation"
        aria-label="Progress"
      >
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <StepperItem
              step={step}
              index={index}
              isFirst={index === 0}
              isLast={index === steps.length - 1}
            />
            {index < steps.length - 1 && (
              <StepperConnector index={index} />
            )}
          </React.Fragment>
        ))}
      </div>
    </StepperContext.Provider>
  );
}

interface StepperItemProps {
  step: Step;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}

function StepperItem({ step, index }: StepperItemProps) {
  const { currentStep, onStepClick } = useStepper();

  const isCompleted = index < currentStep;
  const isCurrent = index === currentStep;
  const isClickable = onStepClick && index <= currentStep;

  const handleClick = () => {
    if (isClickable && onStepClick) {
      onStepClick(index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && isClickable) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        isClickable && "cursor-pointer",
        !isClickable && index > currentStep && "opacity-50"
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-current={isCurrent ? "step" : undefined}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
          isCompleted &&
            "border-primary bg-primary text-primary-foreground",
          isCurrent && "border-primary text-primary",
          !isCompleted && !isCurrent && "border-muted text-muted-foreground"
        )}
      >
        {isCompleted ? (
          <Check className="h-5 w-5" />
        ) : (
          <span>{index + 1}</span>
        )}
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            "text-sm font-medium",
            isCurrent && "text-primary",
            isCompleted && "text-foreground",
            !isCompleted && !isCurrent && "text-muted-foreground"
          )}
        >
          {step.title}
        </span>
        {step.description && (
          <span className="text-xs text-muted-foreground">
            {step.description}
          </span>
        )}
      </div>
    </div>
  );
}

interface StepperConnectorProps {
  index: number;
}

function StepperConnector({ index }: StepperConnectorProps) {
  const { currentStep, orientation } = useStepper();

  const isCompleted = index < currentStep;

  return (
    <div
      className={cn(
        "transition-colors",
        orientation === "horizontal" ? "mx-4 h-[2px] flex-1" : "ml-5 my-2 w-[2px] h-8",
        isCompleted ? "bg-primary" : "bg-muted"
      )}
      aria-hidden="true"
    />
  );
}

// Simplified stepper for compact displays
interface StepperDotsProps {
  steps: number;
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

function StepperDots({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepperDotsProps) {
  return (
    <div
      className={cn("flex items-center justify-center gap-2", className)}
      role="navigation"
      aria-label="Progress"
    >
      {Array.from({ length: steps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && index <= currentStep;

        return (
          <button
            key={index}
            type="button"
            onClick={() => isClickable && onStepClick?.(index)}
            disabled={!isClickable}
            className={cn(
              "h-2 rounded-full transition-all",
              isCurrent
                ? "w-8 bg-primary"
                : isCompleted
                ? "w-2 bg-primary/60"
                : "w-2 bg-muted",
              isClickable && "cursor-pointer hover:opacity-80",
              !isClickable && "cursor-default"
            )}
            aria-label={`Step ${index + 1}`}
            aria-current={isCurrent ? "step" : undefined}
          />
        );
      })}
    </div>
  );
}

// Progress bar variant
interface StepperProgressProps {
  steps: number;
  currentStep: number;
  className?: string;
}

function StepperProgress({ steps, currentStep, className }: StepperProgressProps) {
  const progress = ((currentStep) / (steps - 1)) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Step {currentStep + 1} of {steps}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export {
  Stepper,
  StepperItem,
  StepperConnector,
  StepperDots,
  StepperProgress,
  useStepper,
};
