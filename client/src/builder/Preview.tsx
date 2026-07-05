import { blockRegistry } from '../blocks/registry';
import type { Block } from '../blocks/types';

interface PreviewProps {
  blocks: Block[];
}

export function Preview({ blocks }: PreviewProps) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', background: '#fff', minHeight: '200px' }}>
      {blocks.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>No blocks yet</div>
      ) : (
        blocks.map((block) => {
          const Render = blockRegistry[block.type]?.render;
          return Render ? <Render key={block.id} props={block.props} /> : null;
        })
      )}
    </div>
  );
}
