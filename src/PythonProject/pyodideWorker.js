// src/PythonProject/pyodideWorker.js

let pyodide = null;
let isLoading = false;
let isLoaded = false;
let inputPromise = null;
let inputPromiseResolve = null;

function getInputFromMainThread(prompt) {
  self.postMessage({ type: 'input_request', prompt });
  return new Promise((resolve) => {
    inputPromiseResolve = resolve;
  });
}

self.get_input_from_main_thread = getInputFromMainThread;

self.onmessage = async (event) => {
  const { type, code, isPreview, timeoutMs, inputValue } = event.data;
  if (type === 'init') {
    if (isLoaded || isLoading) return;
    isLoading = true;
    self.postMessage({ type: 'status', status: 'loading' });
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
    pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
    isLoaded = true;
    self.postMessage({ type: 'status', status: 'ready' });
  }
  if (type === 'input_response' && inputPromiseResolve) {
    inputPromiseResolve(inputValue || '');
    inputPromiseResolve = null;
  }
  if (type === 'run' && isLoaded) {
    let outputLines = [];
    const appendOutput = (text) => {
      outputLines.push(...text.split(/\r?\n/));
      self.postMessage({ type: 'output', lines: outputLines });
    };
    self.send_to_terminal = appendOutput;
    pyodide.setStdout({ batched: appendOutput });
    pyodide.setStderr({ batched: appendOutput });
    self.get_input_from_main_thread = getInputFromMainThread;
    try {
      await pyodide.runPythonAsync(`
import builtins
import js
async def input_async(prompt=""):
    return await js.get_input_from_main_thread(prompt)
builtins.input = input_async
`);
      await pyodide.runPythonAsync(`
import sys
class StdoutCatcher:
    def write(self, s): from js import send_to_terminal; send_to_terminal(s)
    def flush(self): pass
sys.stdout = StdoutCatcher()
sys.stderr = StdoutCatcher()
`);
      let didTimeout = false;
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => {
        didTimeout = true;
        reject(new Error('Execution timed out'));
      }, timeoutMs || 5000));
      await Promise.race([
        pyodide.runPythonAsync(code),
        timeoutPromise
      ]);
      if (didTimeout) {
        appendOutput('❌ Error: Execution timed out');
      } else {
        appendOutput('[DEBUG] User code finished running.');
      }
      self.postMessage({ type: 'done' });
    } catch (err) {
      appendOutput('❌ Error: ' + err.message);
      self.postMessage({ type: 'done' });
    }
  }
}; 