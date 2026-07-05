import { useState, useEffect, useCallback } from 'react';
import { Builder } from './builder/Builder';
import { Preview } from './builder/Preview';
import type { Block } from './blocks/types';

const API = 'http://localhost:3001';

interface PageInfo {
  id: string;
  name: string;
}

function App() {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [view, setView] = useState<'builder' | 'preview'>('builder');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${API}/pages`)
      .then((r) => r.json())
      .then((data: PageInfo[]) => {
        setPages(data);
        if (data.length > 0) {
          setCurrentPageId(data[0].id);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!currentPageId) return;
    fetch(`${API}/page/${currentPageId}`)
      .then((r) => r.json())
      .then((data) => {
        setBlocks(data.blocks);
        setDirty(false);
      })
      .catch(() => {});
  }, [currentPageId]);

  const handleBlocksChange = useCallback((updated: Block[]) => {
    setBlocks(updated);
    setDirty(true);
  }, []);

  const handleSave = async () => {
    if (!currentPageId) return;
    setSaving(true);
    try {
      await fetch(`${API}/page/${currentPageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePage = async () => {
    const id = `page-${Date.now()}`;
    const name = `Page ${pages.length + 1}`;
    try {
      const res = await fetch(`${API}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name }),
      });
      const page = await res.json();
      setPages((prev) => [...prev, { id: page.id, name: page.name }]);
      setCurrentPageId(page.id);
      setBlocks([]);
      setDirty(false);
    } catch {}
  };

  const handleSwitchPage = (id: string) => {
    if (dirty) {
      handleSave().then(() => setCurrentPageId(id));
    } else {
      setCurrentPageId(id);
    }
  };

  if (!loaded) return <div style={{ padding: '2rem' }}>Loading...</div>;

  const currentPage = pages.find((p) => p.id === currentPageId);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.3rem' }}>Landing Page CMS</h1>
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

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', flex: 1 }}>
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSwitchPage(p.id)}
              style={{
                padding: '0.35rem 1rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.85rem',
                background: p.id === currentPageId ? '#0066ff' : '#e8e8e8',
                color: p.id === currentPageId ? '#fff' : '#555',
              }}
            >
              {p.name}
            </button>
          ))}
          <button
            onClick={handleCreatePage}
            style={{
              padding: '0.35rem 1rem',
              border: '1px dashed #ccc',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.85rem',
              background: 'transparent',
              color: '#888',
            }}
          >
            + New Page
          </button>
        </div>
        {currentPage && (
          <span style={{ fontSize: '0.8rem', color: '#999' }}>
            {currentPage.name}
          </span>
        )}
      </div>

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
