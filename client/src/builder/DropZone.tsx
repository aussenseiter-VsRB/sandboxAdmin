import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface DropZoneProps {
  id: string;
  index: number;
  isPaletteDragging: boolean;
  children?: ReactNode | ((props: { setNodeRef: (node: HTMLElement | null) => void; isOver: boolean }) => ReactNode);
}

export function DropZone({ id, index, isPaletteDragging, children }: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const active = isOver && isPaletteDragging;

  if (typeof children === 'function') {
    return children({ setNodeRef, isOver });
  }

  return (
    <div
      ref={setNodeRef}
      data-drop-zone={index}
      style={{
        height: active ? '32px' : '8px',
        minHeight: active ? '32px' : '8px',
        transition: 'all 0.15s ease',
        background: active ? 'rgba(0,102,255,0.08)' : 'transparent',
        borderRadius: '4px',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '8px',
          right: '8px',
          top: '50%',
          height: active ? '3px' : '0',
          transform: 'translateY(-50%)',
          background: active ? '#0066ff' : 'transparent',
          borderRadius: '2px',
          transition: 'all 0.15s ease',
        }}
      />
    </div>
  );
}