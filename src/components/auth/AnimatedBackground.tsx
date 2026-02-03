/**
 * Subtle ambient background for centered auth pages.
 * Uses a clean dot grid pattern instead of animated gradient blobs.
 */
export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Faint top-right warm glow */}
      <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-momentum-orange/[0.04] blur-[100px]" />
      {/* Faint bottom-left cool glow */}
      <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-strategy-blue/[0.06] blur-[100px] dark:bg-strategy-blue/[0.12]" />
    </div>
  );
}
