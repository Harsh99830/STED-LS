import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { get, ref } from 'firebase/database';
import { db } from '../firebase';
import CodeEditor from './CodeEditor';

const PublicPythonProject = () => {
  const { projectId, userId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [outputLines, setOutputLines] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

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
  const handleRun = async () => {
    if (!project) return;
    setRunning(true);
    setOutputLines([]);
    setError('');
    try {
      if (!window.loadPyodide) {
        setOutputLines(["❌ Pyodide is not loaded."]);
        setRunning(false);
        return;
      }
      const pyodide = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
      });
      let outputBuffer = '';
      const appendOutput = (text) => {
        outputBuffer += text;
        setOutputLines(prev => [...prev, ...text.split(/\r?\n/)]);
      };
      window.send_to_terminal = (text) => appendOutput(text);
      pyodide.setStdout({ batched: (s) => appendOutput(s) });
      pyodide.setStderr({ batched: (s) => appendOutput(s) });
      await pyodide.runPythonAsync(`
import sys
class StdoutCatcher:
    def write(self, s): from js import send_to_terminal; send_to_terminal(s)
    def flush(self): pass
sys.stdout = StdoutCatcher()
sys.stderr = StdoutCatcher()
`);
      await pyodide.runPythonAsync(project.code);
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
        {/* VS Code style header bar */}
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
        {/* Editor and terminal */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <CodeEditor
              value={project.code || ''}
              language="python"
              readOnly={true}
              hideTerminal={true}
              height="100%"
            />
          </div>
          {/* Terminal panel */}
          <div style={{
            background: '#18181b',
            color: '#d4d4d4',
            borderTop: '1.5px solid #222',
            height: 300,
            textAlign:"left",  
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
        </div>
      </div>
    </div>
  );
};

export default PublicPythonProject; 