'use client';

import { motion } from 'framer-motion';
import { PieceSVG } from '../pieces/PieceSVG';
import { SQUARE_SIZE, type AnimState } from './usePieceMoveAnimation';

interface PieceMoveOverlayProps {
  animation: AnimState;
  reduceMotion: boolean;
}

/** A distance-aware, non-bouncy piece slide shared by local and online play. */
export function PieceMoveOverlay({ animation, reduceMotion }: PieceMoveOverlayProps) {
  const distance = Math.hypot(
    animation.toX - animation.fromX,
    animation.toY - animation.fromY,
  ) / SQUARE_SIZE;
  const duration = reduceMotion ? 0 : Math.min(0.24, 0.135 + distance * 0.018);

  return (
    <>
      {animation.capturedPiece !== undefined &&
       animation.capturedX !== undefined &&
       animation.capturedY !== undefined && (
        <motion.g
          className="captured-piece-exit"
          key={`cap-${animation.moveId}`}
          initial={{ x: animation.capturedX, y: animation.capturedY, opacity: 1, scale: 1 }}
          animate={{
            x: animation.capturedX,
            y: animation.capturedY,
            opacity: 0,
            scale: reduceMotion ? 1 : 0.86,
          }}
          transition={{ duration: reduceMotion ? 0 : 0.14, ease: [0.4, 0, 1, 1] }}
          pointerEvents="none"
        >
          <PieceSVG piece={animation.capturedPiece} size={SQUARE_SIZE - 4} />
        </motion.g>
      )}

      <motion.g
        className="moving-piece"
        key={`mv-${animation.moveId}`}
        initial={{
          x: animation.fromX,
          y: animation.fromY,
          scale: reduceMotion ? 1 : 0.97,
        }}
        animate={{ x: animation.toX, y: animation.toY, scale: 1 }}
        transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
        pointerEvents="none"
      >
        <PieceSVG piece={animation.landingPiece} size={SQUARE_SIZE - 4} />
      </motion.g>
    </>
  );
}
