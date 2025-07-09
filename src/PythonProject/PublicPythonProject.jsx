import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { get, ref } from 'firebase/database';
import { db } from '../firebase';
import CodeEditor from './CodeEditor';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { runPythonCode } from './pythonRunner';

const PublicPythonProject = () => {
  const { projectId, userId } = useParams();
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get('preview') === 'true';
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [outputLines, setOutputLines] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [showTerminal, setShowTerminal] = useState(false); // For preview mode toggle
  const [openPanel, setOpenPanel] = useState('code'); // 'code' or 'terminal'

  useEffect(() => {
    setShowTerminal(false); // Reset on project change
    setOpenPanel('code'); // Reset to code on project change
  }, [projectId, userId]);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const projectRef = ref(db, `users/${userId}/python/PythonCompletedProjects/${projectId}`);
        const snap = await get(projectRef);
        if (snap.exists()) {
          setProject(snap.val());
          setOutputLines(snap.val().terminalOutput || []);
        } else {
          setError('Project not found.');
        }
      } catch (e) {
        setError('Failed to load project.');
      }
      setLoading(false);
    };
    fetchProject();
  }, [projectId, userId]);

  // Run code using Pyodide (same as CodeEditor, but read-only)
  const handleRun = async (e) => {
    if (e) e.stopPropagation();
    if (!project) return;
    setRunning(true);
    setOutputLines([]);
    setError('');
    if (isPreview) setOpenPanel('terminal'); // Switch to terminal in preview mode
    try {
      await runPythonCode({
        code: project.code,
        onOutput: (lines) => setOutputLines(prev => [...prev, ...lines]),
        isPreview: true
      });
      setRunning(false);
    } catch (err) {
      setOutputLines(prev => [...prev, '❌ Error: ' + err.message]);
      setRunning(false);
    }
  };

  if (loading) return <div style={{ color: '#fff', background: '#1e1e1e', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', background: '#1e1e1e', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{error}</div>;
  if (!project) return null;

  return (
    <div style={{
      minHeight: '100vh',
      minWidth: '100vw',
      background: '#18181b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'JetBrains Mono', 'Fira Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace"
    }}>
      <div style={{
        width: '1600px',
        height: '800px',
        maxWidth: '95vw',
        maxHeight: '95vh',
        background: '#1e1e1e',
        borderRadius: '18px',
        boxShadow: '0 8px 40px #000a, 0 1.5px 0 #23272e',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1.5px solid #23272e',
      }}>
        {/* VS Code style header bar (removed in preview mode) */}
        {!isPreview && (
          <div style={{
            height: 44,
            background: '#23272e',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            padding: '0 32px',
            fontWeight: 600,
            fontSize: 17,
            borderBottom: '1px solid #222',
            letterSpacing: 0.2
          }}>
            <button
              onClick={() => window.history.back()}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 22,
                marginRight: 18,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0
              }}
              title="Back"
            >
              <span style={{ fontSize: 22, marginRight: 2, display: 'inline-block', transform: 'translateY(1px)' }}>&larr;</span>
            </button>
            <span style={{ color: '#6ee7b7', marginRight: 16 }}>🐍 Python Project</span>
            <span style={{ color: '#fff', fontWeight: 700 }}>{project.projectTitle || 'Untitled Project'}</span>
            <span style={{ marginLeft: 32, color: '#a1a1aa', fontSize: 14 }}>
              Concepts Used: <span style={{ color: '#facc15' }}>{project.conceptUsed || 'N/A'}</span>
            </span>
          </div>
        )}
        {/* Editor and terminal with dropdown in preview mode */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {isPreview ? (
            <>
              {/* Code Editor with dropdown in header */}
              <div style={{ height: openPanel === 'code' ? 'calc(100% - 60px)' : 60, minHeight: 0, transition: 'height 0.3s' }}>
                <div style={{
                  background: '#23272e',
                  color: '#fff',
                  padding: '6px 24px',
                  fontWeight: 600,
                  fontSize: 15,
                  borderBottom: '1px solid #222',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  userSelect: 'none',
                  cursor: 'pointer',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    Code Editor
                  </span>
                  <span
                    onClick={() => setOpenPanel(openPanel === 'code' ? 'terminal' : 'code')}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: 18, marginLeft: 8 }}
                    title={openPanel === 'code' ? 'Show Terminal' : 'Show Code Editor'}
                  >
                    {openPanel === 'code' ? <FaChevronDown /> : <FaChevronUp />}
                  </span>
                </div>
                <div style={{ height: openPanel === 'code' ? 'calc(100% - 44px)' : 0, overflow: 'hidden', transition: 'height 0.3s' }}>
                  <CodeEditor
                    value={project.code || ''}
                    language="python"
                    readOnly={true}
                    hideTerminal={true}
                    height="100%"
                  />
                </div>
              </div>
              {/* Terminal with dropup in header */}
              <div style={{
                background: '#18181b',
                color: '#d4d4d4',
                borderTop: '1.5px solid #222',
                height: openPanel === 'terminal' ? 'calc(100% - 60px)' : 60,
                minHeight: 60,
                maxHeight: 'calc(100% - 60px)',
                textAlign: "left",
                fontSize: 15,
                fontFamily: 'inherit',
                padding: '0 0 0 0',
                display: 'flex',
                flexDirection: 'column',
                transition: 'height 0.3s',
                overflow: 'hidden',
              }}>
                <div style={{
                  background: '#23272e',
                  color: '#fff',
                  padding: '6px 24px',
                  fontWeight: 600,
                  fontSize: 15,
                  borderBottom: '1px solid #222',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  userSelect: 'none',
                  cursor: 'pointer',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    Terminal
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      onClick={handleRun}
                      disabled={running}
                      style={{
                        background: '#007acc',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 18px',
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: running ? 'not-allowed' : 'pointer',
                        opacity: running ? 0.7 : 1
                      }}
                    >
                      {running ? 'Running...' : 'Run'}
                    </button>
                    <span
                      onClick={() => setOpenPanel(openPanel === 'terminal' ? 'code' : 'terminal')}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: 18, marginLeft: 8 }}
                      title={openPanel === 'terminal' ? 'Show Code Editor' : 'Show Terminal'}
                    >
                      {openPanel === 'terminal' ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>
                </div>
                <div style={{
                  height: openPanel === 'terminal' ? 'calc(100% - 44px)' : 0,
                  overflowY: 'auto',
                  overflowX: 'auto',
                  padding: '12px 24px',
                  fontFamily: 'inherit',
                  background: '#18181b',
                  transition: 'height 0.3s',
                }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {outputLines.map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            // Normal mode: original layout
            <>
              <div style={{ flex: 1, minHeight: 0 }}>
                <CodeEditor
                  value={project.code || ''}
                  language="python"
                  readOnly={true}
                  hideTerminal={true}
                  height="100%"
                />
              </div>
              <div style={{
                background: '#18181b',
                color: '#d4d4d4',
                borderTop: '1.5px solid #222',
                height: 300,
                textAlign: "left",
                fontSize: 15,
                fontFamily: 'inherit',
                padding: '0 0 0 0',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  background: '#23272e',
                  color: '#fff',
                  padding: '6px 24px',
                  fontWeight: 600,
                  fontSize: 15,
                  borderBottom: '1px solid #222',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>TERMINAL</span>
                  <button
                    onClick={handleRun}
                    disabled={running}
                    style={{
                      background: '#007acc',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      padding: '4px 18px',
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: running ? 'not-allowed' : 'pointer',
                      opacity: running ? 0.7 : 1
                    }}
                  >
                    {running ? 'Running...' : 'Run'}
                  </button>
                </div>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '12px 24px',
                  fontFamily: 'inherit',
                  background: '#18181b'
                }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {outputLines.map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicPythonProject; 