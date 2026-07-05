import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  type CollisionDetection,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Palette } from './Palette';
import { Canvas } from './Canvas';
import { blockRegistry } from '../blocks/registry';
import type { Block, BlockType } from '../blocks/types';

interface BuilderProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
}

let nextId = 100;

export function Builder({ blocks, onBlocksChange }: BuilderProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<{ type: BlockType; label: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const paletteCollision: CollisionDetection = useMemo(
    () =>
      (args) => {
        const isPalette = args.active.data.current?.type === 'palette-item';
        if (isPalette) {
          const zones = args.droppableContainers.filter(
            (c) => typeof c.id === 'string' && c.id.startsWith('drop-zone-')
          );
          if (zones.length === 0) return [];
          return closestCenter({ ...args, droppableContainers: zones });
        }
        return closestCenter(args);
      },
    []
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (event.active.data.current?.type === 'palette-item') {
      const bt: BlockType = event.active.data.current.blockType as BlockType;
      const def = blockRegistry[bt];
      setActiveDrag({ type: bt, label: def.label });
    } else {
      setActiveDrag(null);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDrag(null);
      const { active, over } = event;
      if (!over) return;

      if (active.data.current?.type === 'palette-item') {
        const blockType: BlockType = active.data.current.blockType as BlockType;
        const zoneId = over.id.toString();
        if (!zoneId.startsWith('drop-zone-')) return;

        const index = parseInt(zoneId.replace('drop-zone-', ''), 10);
        const def = blockRegistry[blockType];
        const newBlock: Block = {
          id: String(nextId++),
          type: blockType,
          props: { ...def.defaultProps },
        };
        const updated = [...blocks];
        updated.splice(index, 0, newBlock);
        onBlocksChange(updated);
        setExpandedId(newBlock.id);
      } else {
        if (active.id === over.id) return;
        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        const updated = [...blocks];
        const [moved] = updated.splice(oldIndex, 1);
        updated.splice(newIndex, 0, moved);
        onBlocksChange(updated);
      }
    },
    [blocks, onBlocksChange]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onBlocksChange(blocks.filter((b) => b.id !== id));
    },
    [blocks, onBlocksChange]
  );

  const handlePropsChange = useCallback(
    (id: string, props: Record<string, any>) => {
      onBlocksChange(blocks.map((b) => (b.id === id ? { ...b, props } : b)));
    },
    [blocks, onBlocksChange]
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
      <DndContext
        sensors={sensors}
        collisionDetection={paletteCollision}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Palette />
        <Canvas
          blocks={blocks}
          expandedId={expandedId}
          onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
          onDelete={handleDelete}
          onPropsChange={handlePropsChange}
        />
        <DragOverlay dropAnimation={null}>
          {activeDrag ? (
            <div
              style={{
                padding: '0.6rem 1.2rem',
                background: '#0066ff',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(0,102,255,0.3)',
              }}
            >
              {activeDrag.label}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
