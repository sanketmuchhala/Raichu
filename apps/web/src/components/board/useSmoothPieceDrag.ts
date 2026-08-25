'use client';

import { animate, useMotionValue } from 'framer-motion';
import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { COORD_SIZE, SQUARE_SIZE } from './usePieceMoveAnimation';

interface BoardPoint {
  x: number;
  y: number;
}

interface BoardMetrics {
  left: number;
  top: number;
  scale: number;
}

const PIECE_INSET = 2;

/**
 * Keeps live drag motion out of React and Zustand. Motion values write the
 * overlay transform directly on animation frames, so the board's 64 squares
 * and static pieces only render once when dragging starts and once when it
 * ends.
 */
export function useSmoothPieceDrag(
  boardRef: RefObject<SVGSVGElement | null>,
  totalWidth: number,
  reduceMotion: boolean,
) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const opacity = useMotionValue(1);
  const metricsRef = useRef<BoardMetrics | null>(null);
  const animationsRef = useRef<Array<ReturnType<typeof animate>>>([]);
  const settleIdRef = useRef(0);

  const stopAnimations = useCallback(() => {
    settleIdRef.current += 1;
    for (const animation of animationsRef.current) animation.stop();
    animationsRef.current = [];
  }, []);

  useEffect(() => stopAnimations, [stopAnimations]);

  const measureBoard = useCallback((): BoardMetrics | null => {
    const board = boardRef.current;
    if (!board) return null;

    const rect = board.getBoundingClientRect();
    const metrics = {
      left: rect.left,
      top: rect.top,
      scale: rect.width / totalWidth,
    };
    metricsRef.current = metrics;
    return metrics;
  }, [boardRef, totalWidth]);

  const pointFromPointer = useCallback((event: React.PointerEvent): BoardPoint | null => {
    const metrics = metricsRef.current ?? measureBoard();
    if (!metrics) return null;

    // High-refresh-rate pointers may deliver several samples together. The
    // newest coalesced point keeps the piece closest to the user's finger.
    const samples = event.nativeEvent.getCoalescedEvents?.() ?? [];
    const pointer = samples.length > 0 ? samples[samples.length - 1] : event.nativeEvent;

    return {
      x: (pointer.clientX - metrics.left) / metrics.scale - COORD_SIZE,
      y: (pointer.clientY - metrics.top) / metrics.scale - COORD_SIZE,
    };
  }, [measureBoard]);

  const positionAtPointer = useCallback((point: BoardPoint) => {
    x.set(point.x - SQUARE_SIZE / 2 + PIECE_INSET);
    y.set(point.y - SQUARE_SIZE / 2 + PIECE_INSET);
  }, [x, y]);

  const begin = useCallback((event: React.PointerEvent): BoardPoint | null => {
    stopAnimations();
    metricsRef.current = null;
    const point = pointFromPointer(event);
    if (!point) return null;

    positionAtPointer(point);
    scale.set(reduceMotion ? 1 : 0.98);
    opacity.set(reduceMotion ? 1 : 0.94);

    const board = boardRef.current;
    if (board) {
      event.preventDefault();
      board.setPointerCapture(event.pointerId);
    }

    if (!reduceMotion) {
      animationsRef.current = [
        animate(scale, 1.06, { duration: 0.11, ease: [0.16, 1, 0.3, 1] }),
        animate(opacity, 0.98, { duration: 0.08, ease: 'easeOut' }),
      ];
    }

    return point;
  }, [boardRef, opacity, pointFromPointer, positionAtPointer, reduceMotion, scale, stopAnimations]);

  const update = useCallback((event: React.PointerEvent): BoardPoint | null => {
    const point = pointFromPointer(event);
    if (point) positionAtPointer(point);
    return point;
  }, [pointFromPointer, positionAtPointer]);

  const releasePointer = useCallback((event: React.PointerEvent) => {
    const board = boardRef.current;
    if (board?.hasPointerCapture(event.pointerId)) {
      board.releasePointerCapture(event.pointerId);
    }
  }, [boardRef]);

  const settleTo = useCallback((
    target: BoardPoint,
    duration: number,
    onComplete: () => void,
  ) => {
    stopAnimations();
    const settleId = settleIdRef.current;

    if (reduceMotion) {
      x.set(target.x);
      y.set(target.y);
      scale.set(1);
      opacity.set(1);
      onComplete();
      return;
    }

    const options = { duration, ease: [0.16, 1, 0.3, 1] as const };
    const animations = [
      animate(x, target.x, options),
      animate(y, target.y, options),
      animate(scale, 1, options),
      animate(opacity, 1, { duration: Math.min(duration, 0.1), ease: 'easeOut' }),
    ];
    animationsRef.current = animations;

    void Promise.all(animations).then(() => {
      if (settleIdRef.current !== settleId) return;
      animationsRef.current = [];
      onComplete();
    });
  }, [opacity, reduceMotion, scale, stopAnimations, x, y]);

  const squareOrigin = useCallback((displayRow: number, displayCol: number): BoardPoint => ({
    x: COORD_SIZE + displayCol * SQUARE_SIZE + PIECE_INSET,
    y: COORD_SIZE + displayRow * SQUARE_SIZE + PIECE_INSET,
  }), []);

  return {
    x,
    y,
    scale,
    opacity,
    begin,
    update,
    pointFromPointer,
    releasePointer,
    settleTo,
    squareOrigin,
    stopAnimations,
  };
}
