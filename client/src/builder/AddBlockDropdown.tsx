import { useState } from 'react';
import { blockRegistry } from '../blocks/registry';
import type { BlockType } from '../blocks/types';

interface AddBlockDropdownProps {
  onAdd: (type: BlockType) => void;
}

export function AddBlockDropdown({ onAdd }: AddBlockDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          background: '#fafafa',
          cursor: 'pointer',
          color: '#666',
          fontWeight: 600,
        }}
      >
        + Add Block
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            zIndex: 10,
            marginTop: '0.25rem',
            overflow: 'hidden',
          }}
        >
          {(Object.entries(blockRegistry) as [BlockType, typeof blockRegistry[BlockType]][]).map(([type, def]) => (
            <button
              key={type}
              onClick={() => {
                onAdd(type);
                setOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.6rem 1rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.9rem',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              {def.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
