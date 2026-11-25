import { useMemo } from 'react';

import { motion } from 'motion/react';

const CONFETTI_COLORS = ['#0284c7', '#16a34a', '#eab308', '#db2777', '#7c3aed'];

const PIECES_PER_COLOR = 9;

/**
 * How far a piece falls, in pixels. The overlay clips at its own box, so a piece stops being drawn
 * at the bottom of the screen this is laid over, whether or not it has fallen this far.
 */
const FALL_DISTANCE = 900;

/** A burst of falling paper over whatever it is laid across. Purely decorative. */
export const CompletionConfetti = () => {
  const pieces = useMemo(() => {
    return CONFETTI_COLORS.flatMap((color) => {
      return Array.from({ length: PIECES_PER_COLOR }, (_, index) => ({
        color,
        delay: Math.random() * 0.6,
        drift: (Math.random() - 0.5) * 240,
        duration: 2.4 + Math.random() * 1.4,
        id: `${color}-${index}`,
        left: `${Math.random() * 100}%`,
        spin: (Math.random() - 0.5) * 720
      }));
    });
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" data-testid="completion-confetti">
      {pieces.map((piece) => (
        <motion.span
          animate={{ opacity: [1, 1, 0], rotate: piece.spin, x: piece.drift, y: FALL_DISTANCE }}
          className="absolute top-0 block h-3 w-1.5 rounded-sm"
          initial={{ opacity: 1, rotate: 0, x: 0, y: -24 }}
          key={piece.id}
          style={{ backgroundColor: piece.color, left: piece.left }}
          transition={{ delay: piece.delay, duration: piece.duration, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
};
