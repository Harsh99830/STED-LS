import React, { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

const defaultCode = `async def __main__():
    # Write code here

await __main__()`;

function CodeEditor({ onCodeChange, onStuckClick, onOutputChange, value, readOnly, hideTerminal }) {
  const [code, setCode] = useState(defaultCode);
  const [outputLines, setOutputLines] = useState([]);
  const [pyodide, setPyodide] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [waitingInput, setWaitingInput] = useState(false);
  const [promptText, setPromptText] = useState('');
  const stdinHandler = useRef(null);
  const outputBuffer = useRef('');

  useEffect(() => {
    if (onCodeChange) {
      onCodeChange(code);
    }
  }, [code, onCodeChange]);

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(outputLines);
    }
  }, [outputLines, onOutputChange]);

  useEffect(() => {
    (async () => {
      try {
        const py = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
        });

        py.setStdout({ batched: (s) => appendOutput(s) });
        py.setStderr({ batched: (s) => appendOutput(s) });
        py.setStdin({
          readline: () =>
            new Promise((resolve) => {
              stdinHandler.current = resolve;
              setWaitingInput(true);
            }),
        });

        setPyodide(py);
      } catch (err) {
        setOutputLines(["❌ Failed to load Pyodide: " + err.message]);
      }
    })();
  }, []);

  const appendOutput = (text) => {
    const lines = (outputBuffer.current + text).split(/\r?\n/);
    const completeLines = lines.slice(0, -1);
    const remainder = lines[lines.length - 1];
    setOutputLines(prev => [...prev, ...completeLines]);
    outputBuffer.current = remainder;
  };

  const flushOutput = () => {
    if (outputBuffer.current.trim()) {
      setOutputLines(prev => [...prev, outputBuffer.current]);
      outputBuffer.current = '';
    }
  };

  const runPython = async () => {
    if (!pyodide) {
      setOutputLines(["⏳ Pyodide is still loading. Please wait..."]);
      return;
    }

    setOutputLines([]);
    setWaitingInput(false);
    outputBuffer.current = '';

    try {
      window.send_to_terminal = (text) => appendOutput(text);

      await pyodide.runPythonAsync(`
import sys
class StdoutCatcher:
    def write(self, s): from js import send_to_terminal; send_to_terminal(s)
    def flush(self): pass
sys.stdout = StdoutCatcher()
sys.stderr = StdoutCatcher()
`);

      pyodide.globals.set("__new_input__", (prompt) => {
        return new Promise((resolve) => {
          flushOutput();
          setPromptText(prompt);
          stdinHandler.current = resolve;
          setWaitingInput(true);
        });
      });

      await pyodide.runPythonAsync(`
import builtins
async def input_async(prompt=""):
    raw = await __new_input__(prompt)
    return raw.strip()
builtins.input = input_async
`);

      // Always use the latest value prop for code execution
      await pyodide.runPythonAsync(value !== undefined ? value : code);
      flushOutput();
    } catch (err) {
      flushOutput();
      setOutputLines(prev => [...prev, '❌ Error: ' + err.message]);
    }
  };

  const handleInputSubmit = () => {
    if (stdinHandler.current) {
      setOutputLines(prev => [...prev.slice(0, -1), promptText + inputValue]);
      stdinHandler.current(inputValue + '\n');
      stdinHandler.current = null;
      setInputValue('');
      setWaitingInput(false);
      flushOutput();
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={value !== undefined ? value : code}
          onChange={readOnly ? undefined : (val) => setCode(val || '')}
          options={{
            readOnly: !!readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
          loading={<div style={{height:'100%',width:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:15,color:'white'}}>Loading...</div>}
        />
      </div>
      {!hideTerminal && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#1e1e1e', borderTop: '1px solid #555' }}>
            <button
              onClick={runPython}
              style={{
                background: '#007acc',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '5px'
              }}
              // Run button is always enabled
            >
              Run
            </button>
            {onStuckClick && (
              <button
                onClick={onStuckClick}
                style={{
                  background: '#222',
                  color: '#fff',
                  padding: '8px 16px',
                  cursor: readOnly ? 'not-allowed' : 'pointer',
                  borderRadius: '5px',
                  border: '2px solid #007acc'
                }}
                disabled={!!readOnly}
              >
                Stuck?
              </button>
            )}
          </div>
          <div className='text-left' style={{ background: 'black', color: '#dcdcdc', padding: '10px', height: '250px', overflowY: 'auto', borderTop: '1px solid #555' }}>
            <strong>Terminal:</strong>
            <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
              {outputLines.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </pre>
            {waitingInput && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <span style={{ color: 'white' }}>{promptText}</span>
                <input
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                  placeholder="Enter input..."
                  style={{
                    background: '#333',
                    color: 'white',
                    border: '1px solid #555',
                    padding: '5px',
                  }}
                />
                <button
                  onClick={handleInputSubmit}
                  style={{
                    background: '#007acc',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: 'pointer'
                  }}
                >
                  Enter
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CodeEditor;
