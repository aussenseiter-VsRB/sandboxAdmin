import type { BlockDefinition, BlockType } from './types';

export const HeroBlock: React.FC<{ props: Record<string, any> }> = ({ props }) => (
  <div style={{ background: props.bgColor || '#1a1a2e', color: '#fff', padding: '4rem 2rem', textAlign: 'center' }}>
    <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>{props.heading}</h1>
    <p style={{ fontSize: '1.2rem', opacity: 0.8, margin: 0 }}>{props.subheading}</p>
  </div>
);

export const HeroEditor: React.FC<{
  props: Record<string, any>;
  onChange: (props: Record<string, any>) => void;
}> = ({ props, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <input placeholder="Heading" value={props.heading || ''} onChange={e => onChange({ ...props, heading: e.target.value })} />
    <input placeholder="Subheading" value={props.subheading || ''} onChange={e => onChange({ ...props, subheading: e.target.value })} />
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <label style={{ fontSize: '0.85rem' }}>BG Color:</label>
      <input type="color" value={props.bgColor || '#1a1a2e'} onChange={e => onChange({ ...props, bgColor: e.target.value })} />
    </div>
  </div>
);

export const TextBlock: React.FC<{ props: Record<string, any> }> = ({ props }) => (
  <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
    <p style={{ fontSize: '1.1rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{props.content}</p>
  </div>
);

export const TextEditor: React.FC<{
  props: Record<string, any>;
  onChange: (props: Record<string, any>) => void;
}> = ({ props, onChange }) => (
  <textarea
    placeholder="Enter text content..."
    value={props.content || ''}
    onChange={e => onChange({ ...props, content: e.target.value })}
    rows={4}
    style={{ width: '100%', resize: 'vertical' }}
  />
);

export const ImageBlock: React.FC<{ props: Record<string, any> }> = ({ props }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    {props.src ? (
      <img src={props.src} alt={props.alt || ''} style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }} />
    ) : (
      <div style={{ padding: '3rem', background: '#eee', borderRadius: '8px', color: '#999' }}>No image URL set</div>
    )}
  </div>
);

export const ImageEditor: React.FC<{
  props: Record<string, any>;
  onChange: (props: Record<string, any>) => void;
}> = ({ props, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <input placeholder="Image URL" value={props.src || ''} onChange={e => onChange({ ...props, src: e.target.value })} />
    <input placeholder="Alt text" value={props.alt || ''} onChange={e => onChange({ ...props, alt: e.target.value })} />
  </div>
);

export const CtaBlock: React.FC<{ props: Record<string, any> }> = ({ props }) => (
  <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
    <a
      href={props.link || '#'}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'inline-block',
        padding: '0.9rem 2rem',
        background: '#0066ff',
        color: '#fff',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '1.1rem',
      }}
    >
      {props.text || 'Button'}
    </a>
  </div>
);

export const CtaEditor: React.FC<{
  props: Record<string, any>;
  onChange: (props: Record<string, any>) => void;
}> = ({ props, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <input placeholder="Button text" value={props.text || ''} onChange={e => onChange({ ...props, text: e.target.value })} />
    <input placeholder="Link URL" value={props.link || ''} onChange={e => onChange({ ...props, link: e.target.value })} />
  </div>
);
