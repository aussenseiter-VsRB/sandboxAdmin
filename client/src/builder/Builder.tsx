import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableBlock } from './SortableBlock';
import { AddBlockDropdown } from './AddBlockDropdown';
import { blockRegistry } from '../blocks/registry';
import type { Block, BlockType } from '../blocks/types';

interface BuilderProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
}

let nextId = 100;

export function Builder({ blocks, onBlocksChange }: BuilderProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const updated = [...blocks];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      onBlocksChange(updated);
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

  const handleAdd = useCallback(
    (type: BlockType) => {
      const def = blockRegistry[type];
      const newBlock: Block = {
        id: String(nextId++),
        type,
        props: { ...def.defaultProps },
      };
      onBlocksChange([...blocks, newBlock]);
      setExpandedId(newBlock.id);
    },
    [blocks, onBlocksChange]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              expanded={expandedId === block.id}
              onToggle={() => setExpandedId(expandedId === block.id ? null : block.id)}
              onDelete={() => handleDelete(block.id)}
              onPropsChange={(props) => handlePropsChange(block.id, props)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <AddBlockDropdown onAdd={handleAdd} />
    </div>
  );
}
