import { useDraggable } from '@dnd-kit/core';
import { blockRegistry } from '../blocks/registry';
import type { BlockType } from '../blocks/types';

const items = (Object.entries(blockRegistry) as [BlockType, typeof blockRegistry[BlockType]][]).map(
  ([type, def]) => ({ type, label: def.label, icon: def.label[0] })
);

export function Palette() {
  return (
    <div
      style={{
        width: '220px',
        minWidth: '220px',
        background: '#fff',
        borderRight: '1px solid #ddd',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        overflowY: 'auto',
      }}
    >
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Blocks
      </h3>
      {items.map(({ type, label, icon }) => (
        <PaletteItem key={type} type={type} label={label} icon={icon} />
      ))}
    </div>
  );
}

function PaletteItem({ type, label, icon }: { type: BlockType; label: string; icon: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type: 'palette-item', blockType: type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.6rem 0.75rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        background: isDragging ? '#e8f0fe' : '#fafafa',
        cursor: 'grab',
        opacity: isDragging ? 0.4 : 1,
        userSelect: 'none',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.background = '#f0f4ff'; }}
      onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.background = '#fafafa'; }}
    >
      <span
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: '#eef2ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          color: '#0066ff',
          fontSize: '1rem',
        }}
      >
        {icon}
      </span>
      <span style={{ fontWeight: 500, fontSize: '0.9rem', color: '#333' }}>{label}</span>
    </div>
  );
}
