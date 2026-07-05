import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { blockRegistry } from '../blocks/registry';
import type { Block } from '../blocks/types';

interface SortableBlockProps {
  block: Block;
  expanded: boolean;
  isPaletteDragging: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onPropsChange: (props: Record<string, any>) => void;
}

export function SortableBlock({ block, expanded, isPaletteDragging, onToggle, onDelete, onPropsChange }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const def = blockRegistry[block.type];
  const EditForm = def.edit;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#fff',
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
    pointerEvents: isPaletteDragging ? 'none' as const : 'auto' as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: '#f8f9fa',
          borderBottom: expanded ? '1px solid #eee' : 'none',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
        }}
      >
        <button {...attributes} {...listeners} style={{ cursor: isPaletteDragging ? 'default' : 'grab', background: 'none', border: 'none', fontSize: '1.2rem', padding: '0 0.25rem' }}>
          ⠿
        </button>
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#555', flex: 1 }}>
          {def.label}
        </span>
        <button
          onClick={onToggle}
          style={{ background: 'none', border: '1px solid #ccc', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}
        >
          {expanded ? 'Collapse' : 'Edit'}
        </button>
        <button
          onClick={onDelete}
          style={{ background: 'none', border: '1px solid #e74c3c', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#e74c3c', cursor: 'pointer' }}
        >
          Delete
        </button>
      </div>
      {expanded && (
        <div style={{ padding: '0.75rem' }}>
          <EditForm props={block.props} onChange={onPropsChange} />
        </div>
      )}
    </div>
  );
}
