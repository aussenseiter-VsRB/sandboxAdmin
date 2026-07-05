import { useState, useEffect } from 'react';
import { Builder } from './builder/Builder';
import { Preview } from './builder/Preview';
import type { Block } from './blocks/types';

const API = 'http://localhost:3001/page';

function App() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [view, setView] = useState<'builder' | 'preview'>('builder');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((data) => {
        setBlocks(data.blocks);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const handleBlocksChange = (updated: Block[]) => {
    setBlocks(updated);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Landing Page CMS</h1>
        <div style={{ flex: 1 }} />
        <nav style={{ display: 'flex', gap: '0.25rem', background: '#f0f0f0', borderRadius: '8px', padding: '0.2rem' }}>
          <button
            onClick={() => setView('builder')}
            style={{
              padding: '0.4rem 1rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              background: view === 'builder' ? '#fff' : 'transparent',
              boxShadow: view === 'builder' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            Builder
          </button>
          <button
            onClick={() => setView('preview')}
            style={{
              padding: '0.4rem 1rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              background: view === 'preview' ? '#fff' : 'transparent',
              boxShadow: view === 'preview' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            Preview
          </button>
        </nav>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          style={{
            padding: '0.5rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: dirty ? 'pointer' : 'default',
            fontWeight: 600,
            background: dirty ? '#0066ff' : '#ccc',
            color: '#fff',
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </header>

      <main>
        {view === 'builder' ? (
          <Builder blocks={blocks} onBlocksChange={handleBlocksChange} />
        ) : (
          <Preview blocks={blocks} />
        )}
      </main>
    </div>
  );
}

export default App;
