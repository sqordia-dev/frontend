import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Only animate once (default: true) */
  once?: boolean;
  /** How much of the element should be visible before triggering (0-1) */
  amount?: number;
  /** Animation direction */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** Animation duration in seconds */
  duration?: number;
  /** Animation delay in seconds */
  delay?: number;
  /** Distance to travel in pixels */
  distance?: number;
}

/**
 * ScrollReveal - Animate elements when they enter the viewport
 *
 * Uses Framer Motion's whileInView for performant scroll-triggered animations
 *
 * @example
 * <ScrollReveal direction="up" delay={0.2}>
 *   <SectionCard>Content here</SectionCard>
 * </ScrollReveal>
 */
export function ScrollReveal({
  children,
  className = '',
  once = true,
  amount = 0.2,
  direction = 'up',
  duration = 0.6,
  delay = 0,
  distance = 30
}: ScrollRevealProps) {
  // Calculate initial position based on direction
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      case 'none':
      default:
        return {};
    }
  };

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...getInitialPosition()
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1] // Custom ease-out curve
      }
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer - Container for staggered child animations
 */
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  /** Delay between each child animation */
  staggerDelay?: number;
  /** Initial delay before first child animates */
  delayChildren?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.08,
  delayChildren = 0.1
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={{
        ...containerVariants,
        visible: {
          ...containerVariants.visible,
          transition: { staggerChildren: staggerDelay, delayChildren }
        }
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem - Individual item within a StaggerContainer
 */
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * FadeIn - Simple fade in animation on mount
 */
interface FadeInProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}

export function FadeIn({
  children,
  className = '',
  duration = 0.5,
  delay = 0
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default ScrollReveal;
