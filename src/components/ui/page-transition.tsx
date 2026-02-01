import * as React from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// Check if user prefers reduced motion
const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// Page transition variants
const fadeVariants: Variants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -10 },
};

const slideRightVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 },
};

const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 1.02 },
};

const variantMap = {
  fade: fadeVariants,
  slideUp: slideUpVariants,
  slideRight: slideRightVariants,
  scale: scaleVariants,
};

type TransitionVariant = keyof typeof variantMap;

interface PageTransitionProps {
  children: React.ReactNode;
  /** Animation variant to use */
  variant?: TransitionVariant;
  /** Duration of the animation in seconds */
  duration?: number;
  /** Delay before animation starts */
  delay?: number;
  /** Custom class name */
  className?: string;
  /** Unique key for AnimatePresence (usually the route path) */
  pageKey?: string;
}

/**
 * Page Transition Component
 *
 * Wraps page content to provide smooth page transitions.
 * Respects user's reduced motion preferences.
 *
 * @example
 * ```tsx
 * <PageTransition pageKey={location.pathname}>
 *   <YourPageContent />
 * </PageTransition>
 * ```
 */
export function PageTransition({
  children,
  variant = "slideUp",
  duration = 0.3,
  delay = 0,
  className,
  pageKey,
}: PageTransitionProps) {
  const variants = prefersReducedMotion ? fadeVariants : variantMap[variant];
  const actualDuration = prefersReducedMotion ? 0.15 : duration;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial="initial"
        animate="in"
        exit="out"
        variants={variants}
        transition={{
          type: "tween",
          ease: "easeOut",
          duration: actualDuration,
          delay,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Fade In Animation Component
 *
 * Simple fade-in animation for elements.
 */
interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

export function FadeIn({
  children,
  duration = 0.3,
  delay = 0,
  className,
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: prefersReducedMotion ? 0.1 : duration,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide In Animation Component
 *
 * Slides content in from a specified direction.
 */
interface SlideInProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export function SlideIn({
  children,
  direction = "up",
  distance = 20,
  duration = 0.3,
  delay = 0,
  className,
}: SlideInProps) {
  const directionMap = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  const initial = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, ...directionMap[direction] };

  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0.1 : duration,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger Container Component
 *
 * Animates children with a staggered delay.
 */
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger Item Component
 *
 * Use inside StaggerContainer for staggered animations.
 */
interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Collapse Animation Component
 *
 * Smoothly expand/collapse content.
 */
interface CollapseProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
}

export function Collapse({ children, isOpen, className }: CollapseProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            height: { duration: prefersReducedMotion ? 0 : 0.2 },
            opacity: { duration: 0.15 },
          }}
          className={cn("overflow-hidden", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Scale On Hover Component
 *
 * Adds a subtle scale animation on hover.
 */
interface ScaleOnHoverProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}

export function ScaleOnHover({
  children,
  scale = 1.02,
  className,
}: ScaleOnHoverProps) {
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
