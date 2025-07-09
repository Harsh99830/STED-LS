// src/PythonProject/pythonRunner.js

/**
 * Shared Python runner for both Project and PublicProject.
 * Handles Pyodide setup, input_async, builtins.input, and terminal output.
 *
 * Usage:
 *   runPythonCode({ code, onOutput, onInput, isPreview })
 */
export async function runPythonCode({ code, onOutput, onInput, isPreview }) {
  if (!window.loadPyodide) {
    onOutput && onOutput(["❌ Pyodide is not loaded."]);
    return;
  }
  const pyodide = await window.loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
  });

  // Output handler
  const appendOutput = (text) => {
    if (onOutput) onOutput(text.split(/\r?\n/));
  };
  window.send_to_terminal = (text) => appendOutput(text);
  pyodide.setStdout({ batched: (s) => appendOutput(s) });
  pyodide.setStderr({ batched: (s) => appendOutput(s) });

  // Input handler
  if (isPreview) {
    // Dummy input_async for preview mode
    await pyodide.runPythonAsync(`
try:
    input_async
except NameError:
    _input_async_count = 0
    async def input_async(prompt=''):
        global _input_async_count
        _input_async_count += 1
        if _input_async_count > 2:
            return 'exit'
        from js import send_to_terminal
        send_to_terminal('⚠️ Input is not supported in preview mode. Returning empty string.\\n')
        return ''
    import builtins
    builtins.input = input_async
`);
  } else {
    // Interactive input for main project
    pyodide.globals.set("__new_input__", (prompt) => {
      return new Promise((resolve) => {
        if (onInput) onInput(prompt, resolve);
      });
    });
    await pyodide.runPythonAsync(`
import builtins
async def input_async(prompt=""):
    raw = await __new_input__(prompt)
    return raw.strip()
builtins.input = input_async
`);
  }

  // Run the code
  try {
    await pyodide.runPythonAsync(`
import sys
class StdoutCatcher:
    def write(self, s): from js import send_to_terminal; send_to_terminal(s)
    def flush(self): pass
sys.stdout = StdoutCatcher()
sys.stderr = StdoutCatcher()
`);
    await pyodide.runPythonAsync(code);
  } catch (err) {
    appendOutput('❌ Error: ' + err.message);
  }
} 