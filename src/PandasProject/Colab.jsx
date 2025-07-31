import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ref, update, get } from 'firebase/database';
import { db } from '../firebase';

function extractDriveIdFromColabUrl(url) {
  // Handles /drive/{id} pattern (Colab links)
  const driveMatch = url.match(/\/drive\/([\w-]+)/);
  if (driveMatch) return driveMatch[1];
  const dMatch = url.match(/\/d\/([\w-]+)/);
  if (dMatch) return dMatch[1];
  const idMatch = url.match(/[?&]id=([\w-]+)/);
  if (idMatch) return idMatch[1];
  const openIdMatch = url.match(/open\?id=([\w-]+)/);
  if (openIdMatch) return openIdMatch[1];
  const sharingMatch = url.match(/file\/d\/([\w-]+)/);
  if (sharingMatch) return sharingMatch[1];
  return null;
}

async function fetchColabNotebookJson(driveId) {
  // Call your FastAPI backend running locally
  const url = `http://localhost:8000/api/fetch_colab?file_id=${driveId}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Could not fetch notebook.');
  return { cells: data.cells };
}

function renderNotebookCells(cells) {
  return cells.map((cell, idx) => {
    if (cell.cell_type === 'code') {
      return (
        <div key={idx} className="mb-6 bg-[#23232a] p-3 rounded">
          <div className="text-xs text-gray-400 mb-1">Code cell:</div>
          <pre className="bg-[#18181b] text-green-200 p-2 rounded overflow-x-auto text-sm mb-2">
            {cell.source.join('')}
          </pre>
          {cell.outputs && cell.outputs.length > 0 && (
            <div className="bg-black text-white p-2 rounded text-xs">
              <div className="text-gray-400 mb-1">Output:</div>
              {cell.outputs.map((output, oidx) => {
                // Prioritize image and HTML outputs
                if (output.data) {
                  if (output.data['image/png']) {
                    const imgSrc = `data:image/png;base64,${output.data['image/png']}`;
                    return <img key={oidx} src={imgSrc} alt="output" style={{ maxWidth: '100%', background: '#222', margin: '8px 0', borderRadius: '4px' }} />;
                  }
                  if (output.data['image/jpeg']) {
                    const imgSrc = `data:image/jpeg;base64,${output.data['image/jpeg']}`;
                    return <img key={oidx} src={imgSrc} alt="output" style={{ maxWidth: '100%', background: '#222', margin: '8px 0', borderRadius: '4px' }} />;
                  }
                  if (output.data['image/gif']) {
                    const imgSrc = `data:image/gif;base64,${output.data['image/gif']}`;
                    return <img key={oidx} src={imgSrc} alt="output" style={{ maxWidth: '100%', background: '#222', margin: '8px 0', borderRadius: '4px' }} />;
                  }
                  if (output.data['image/svg+xml']) {
                    const svgContent = Array.isArray(output.data['image/svg+xml']) ? output.data['image/svg+xml'].join('') : output.data['image/svg+xml'];
                    return <div key={oidx} dangerouslySetInnerHTML={{ __html: svgContent }} style={{ background: '#222', margin: '8px 0', borderRadius: '4px' }} />;
                  }
                  if (output.data['text/html']) {
                    const htmlContent = Array.isArray(output.data['text/html']) ? output.data['text/html'].join('') : output.data['text/html'];
                    return <div key={oidx} dangerouslySetInnerHTML={{ __html: htmlContent }} style={{ background: '#222', margin: '8px 0', borderRadius: '4px' }} />;
                  }
                  // Only show text if no image/html output
                  if (output.data['text/plain']) {
                    return <pre key={oidx} className="text-white whitespace-pre-wrap">{Array.isArray(output.data['text/plain']) ? output.data['text/plain'].join('') : output.data['text/plain']}</pre>;
                  }
                }
                if (output.text) {
                  return <pre key={oidx} className="text-white whitespace-pre-wrap">{output.text.join('')}</pre>;
                }
                if (output.ename && output.evalue) {
                  return <div key={oidx} className="text-red-400">{output.ename}: {output.evalue}</div>;
                }
                return <div key={oidx} className="text-gray-400">[Non-text output not shown]</div>;
              })}
            </div>
          )}
        </div>
      );
    }
    if (cell.cell_type === 'markdown') {
      return (
        <div key={idx} className="mb-4 bg-[#23232a] p-3 rounded">
          <div className="text-xs text-gray-400 mb-1">Markdown cell:</div>
          <div className="prose prose-invert text-white" style={{ whiteSpace: 'pre-wrap' }}>{cell.source.join('')}</div>
        </div>
      );
    }
    return null;
  });
}

function Colab() {
  const { user } = useUser();
  const [colabLink, setColabLink] = useState('');
  const [savedLink, setSavedLink] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notebookCells, setNotebookCells] = useState(null);
  const [loadingNotebook, setLoadingNotebook] = useState(false);

  // Fetch saved link on mount
  useEffect(() => {
    async function fetchSavedLink() {
      if (!user) return;
      try {
        const userId = user.id;
        const projectRef = ref(db, `users/${userId}/pandas/Project1`);
        const snap = await get(projectRef);
        if (snap.exists() && snap.val().colabLink) {
          setSavedLink(snap.val().colabLink);
          setColabLink(snap.val().colabLink);
          setShowSaved(true);
        }
      } catch (err) {
        // ignore
      }
    }
    fetchSavedLink();
    // eslint-disable-next-line
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      setError('You must be signed in to save your Colab link.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const userId = user.id;
      const projectRef = ref(db, `users/${userId}/pandas/Project1`);
      await update(projectRef, { colabLink });
      setSavedLink(colabLink);
      setShowSaved(true);
      // Fetch and show the latest notebook after saving
      setError('');
      setNotebookCells(null);
      setLoadingNotebook(true);
      try {
        const driveId = extractDriveIdFromColabUrl(colabLink);
        if (!driveId) throw new Error('Invalid Colab link.');
        const notebook = await fetchColabNotebookJson(driveId);
        if (!notebook.cells) throw new Error('No code cells found in notebook.');
        setNotebookCells(notebook.cells);
      } catch (err) {
        setError('Could not fetch notebook: ' + err.message);
      } finally {
        setLoadingNotebook(false);
      }
    } catch (err) {
      setError('Failed to save link.');
    } finally {
      setSaving(false);
    }
  };

  const handleShow = async () => {
    setError('');
    setNotebookCells(null);
    setLoadingNotebook(true);
    // Add a delay to allow Google Drive to sync changes
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds
    try {
      const driveId = extractDriveIdFromColabUrl(savedLink);
      if (!driveId) throw new Error('Invalid Colab link.');
      const notebook = await fetchColabNotebookJson(driveId);
      if (!notebook.cells) throw new Error('No code cells found in notebook.');
      setNotebookCells(notebook.cells);
    } catch (err) {
      setError('Could not fetch notebook: ' + err.message);
    } finally {
      setLoadingNotebook(false);
    }
  };

  return (
    <div
      className="h-full border border-white text-white flex flex-col p-4 bg-[#18181b]"
      style={{ width: '350px', minWidth: '350px', maxWidth: '350px', borderRadius: 0, flexShrink: 0 }}
    >
      <h2 className="text-xl font-bold mb-4 text-purple-300">Colab</h2>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2 text-sm font-semibold">Enter your Google Colab link:</label>
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            className="flex-1 px-2 py-1 rounded bg-[#23232a] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="https://colab.research.google.com/..."
            value={colabLink}
            onChange={e => setColabLink(e.target.value)}
            disabled={saving}
          />
          <button
            className="px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold text-sm"
            onClick={handleSave}
            disabled={!colabLink || saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-semibold text-sm"
            onClick={handleShow}
            disabled={!savedLink || loadingNotebook}
          >
            {loadingNotebook ? 'Loading...' : 'Show'}
          </button>
        </div>
        {error && <div className="mt-2 text-red-400 text-sm">{error}</div>}
        {showSaved && savedLink && (
          <div className="mt-3 text-green-400 text-sm break-all">
            Saved! <a href={savedLink} target="_blank" rel="noopener noreferrer" className="underline text-purple-300">Open Colab</a>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {notebookCells ? (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-purple-200">Notebook Preview</h3>
            {renderNotebookCells(notebookCells)}
          </div>
        ) : (
          <div className="text-gray-400 text-base">This is your Colab area. Add notes, links, or anything you want here!</div>
        )}
      </div>
    </div>
  );
}

export default Colab;
