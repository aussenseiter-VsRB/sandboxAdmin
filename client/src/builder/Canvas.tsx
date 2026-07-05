import { Fragment } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDndContext } from '@dnd-kit/core';
import { SortableBlock } from './SortableBlock';
import { DropZone } from './DropZone';
import type { Block } from '../blocks/types';

interface CanvasProps {
  blocks: Block[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPropsChange: (id: string, props: Record<string, any>) => void;
}

export function Canvas({ blocks, expandedId, onToggle, onDelete, onPropsChange }: CanvasProps) {
  const { active } = useDndContext();
  const isPaletteDragging = active?.data.current?.type === 'palette-item';
  const isEmpty = blocks.length === 0;

  return (
    <div
      style={{
        flex: 1,
        padding: '1.5rem',
        background: isEmpty ? '#f9f9fb' : '#f3f4f6',
        minHeight: '100%',
        overflowY: 'auto',
      }}
    >
      {isEmpty ? (
        <DropZone id="drop-zone-top" index={0} isPaletteDragging={isPaletteDragging}>
          {({ setNodeRef }) => (
            <div
              ref={setNodeRef}
              style={{
                border: '2px dashed #ccc',
                borderRadius: '12px',
                padding: '3rem',
                textAlign: 'center',
                color: '#999',
                background: '#fff',
                transition: 'all 0.15s ease',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...(isPaletteDragging
                  ? { borderColor: '#0066ff', background: '#eef2ff', color: '#0066ff' }
                  : {}),
              }}
            >
              {isPaletteDragging
                ? 'Drop a block here to get started'
                : 'Drag blocks from the palette to start building'}
            </div>
          )}
        </DropZone>
      ) : (
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <DropZone id="drop-zone-top" index={0} isPaletteDragging={isPaletteDragging} />

          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block, i) => (
              <Fragment key={block.id}>
                <SortableBlock
                  block={block}
                  expanded={expandedId === block.id}
                  isPaletteDragging={isPaletteDragging}
                  onToggle={() => onToggle(block.id)}
                  onDelete={() => onDelete(block.id)}
                  onPropsChange={(props) => onPropsChange(block.id, props)}
                />
                <DropZone
                  id={`drop-zone-${i + 1}`}
                  index={i + 1}
                  isPaletteDragging={isPaletteDragging}
                />
              </Fragment>
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}
