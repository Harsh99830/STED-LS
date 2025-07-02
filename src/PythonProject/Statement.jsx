import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import { getProjectConfig, checkTasksAndSubtasks, checkTasksAndSubtasksGemini } from './projectConfig';

function Statement({ userCode, projectConfig }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [projectKey, setProjectKey] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState({});
  const [taskCheckStatus, setTaskCheckStatus] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalSubtasks, setModalSubtasks] = useState([]);
  const [modalTaskTitle, setModalTaskTitle] = useState('');
  const [loadingTaskKey, setLoadingTaskKey] = useState(null);
  const [modalReasons, setModalReasons] = useState({});
  const [subtaskCheckResults, setSubtaskCheckResults] = useState({});
  const [hoveredReason, setHoveredReason] = useState({ taskKey: null, subIdx: null });
  const hoverTimeout = useRef();

  useEffect(() => {
    async function fetchProjectKeyAndData() {
      if (!isLoaded || !isSignedIn || !user) return;
      setLoading(true);
      setError('');
      try {
        // Get user's python.PythonCurrentProject
        const userRef = ref(db, 'users/' + user.id + '/python');
        const userSnap = await get(userRef);
        if (!userSnap.exists()) {
          setError('No Python project started.');
          setLoading(false);
          return;
        }
        const userData = userSnap.val();
        const startedKey = userData.PythonCurrentProject;
        setProjectKey(startedKey);
        if (!startedKey) {
          setError('No Python project started.');
          setLoading(false);
          return;
        }
        // Get project data using utility
        const projectData = await getProjectConfig(startedKey);
        if (!projectData) {
          setError('Project not found.');
          setLoading(false);
          return;
        }
        setProject(projectData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load project: ' + err.message);
        setLoading(false);
      }
    }
    fetchProjectKeyAndData();
  }, [isLoaded, isSignedIn, user]);

  // Checklist state handler
  const handleCheck = (task, subtask) => {
    setChecked((prev) => ({
      ...prev,
      [task]: {
        ...prev[task],
        [subtask]: !prev[task]?.[subtask],
      },
    }));
  };

  const handleTaskCheck = async (taskKey, task) => {
    if (!userCode || !projectConfig) return;
    setLoadingTaskKey(taskKey);
    try {
      const subtasks = task.subtasks || [];
      let allComplete = true;
      const subtaskResults = [];
      for (let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i];
        const prompt = `User's Code:\n\n${userCode}\n\nSubtask: ${subtask}\n\nIs this subtask clearly implemented in the user's code? Respond only with true or false.\nIMPORTANT: Ignore whether other subtasks are complete or not. Only check if THIS subtask is implemented, regardless of the rest of the code.\nIMPORTANT: Only consider the subtask statement itself. Make your decision strictly according to the subtask statement. Do not overthink or infer extra requirements.`;
        let isSubtaskComplete = false;
        let reason = '';
        try {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
          const model = 'gemini-1.5-flash';
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const data = await response.json();
          let answer = '';
          if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            answer = data.candidates[0].content.parts[0].text.trim().toLowerCase();
          }
          const normalized = answer.replace(/[^a-z]/g, '');
          if (normalized.startsWith('true')) isSubtaskComplete = true;
          else if (normalized.startsWith('false')) isSubtaskComplete = false;
          // Now get the reason/explanation
          const reasonPrompt = `User's Code:\n\n${userCode}\n\nSubtask: ${subtask}\n\nIf this subtask is not completed, explain why in one sentence. If it is completed, explain why it is considered complete.\nIMPORTANT: Ignore whether other subtasks are complete or not. Only check if THIS subtask is implemented, regardless of the rest of the code.\nIMPORTANT: Only consider the subtask statement itself. Make your decision strictly according to the subtask statement. Do not overthink or infer extra requirements.`;
          const reasonResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: reasonPrompt }] }] })
          });
          const reasonData = await reasonResponse.json();
          if (reasonData.candidates && reasonData.candidates[0] && reasonData.candidates[0].content && reasonData.candidates[0].content.parts) {
            reason = reasonData.candidates[0].content.parts[0].text.trim();
          }
        } catch (e) {
          // On error, treat as not complete and no reason
        }
        subtaskResults.push({ subtask, complete: isSubtaskComplete, reason });
        // Update subtasks UI as each result comes in
        setSubtaskCheckResults(prev => ({
          ...prev,
          [taskKey]: [...subtaskResults]
        }));
        if (!isSubtaskComplete) allComplete = false;
      }
      setTaskCheckStatus(prev => ({ ...prev, [taskKey]: allComplete }));
      if (!allComplete) {
        // Optionally, show modal with missing subtasks (reuse modal logic)
      }
    } catch (e) {
      // Optionally handle error
    }
    setLoadingTaskKey(null);
  };

  if (loading) {
    return <div className="p-8 text-lg text-white">Loading project statement...</div>;
  }
  if (error) {
    return <div className="p-8 text-lg text-red-500">{error}</div>;
  }
  if (!project) {
    return <div className="p-8 text-lg text-slate-600">No project data.</div>;
  }

  return (
    <div
      className="p-8 max-w-2xl shadow-lg mt-6 animate-fadeIn"
      style={{
        maxHeight: '79vh',
        overflowY: 'auto',
        background: '#18181b', // slate-900
        color: '#f3f4f6', // slate-100
        boxShadow: '0 4px 32px #000a',
      }}
    >
      <h1 className="text-3xl text-center justify-center font-bold mb-2 flex gap-2" style={{ color: '#a78bfa' }}>
        {project.title}
      </h1>
      <p className="mb-4 text-lg" style={{ color: '#e5e7eb' }}>{project.description}</p>

      <div className="mb-2 text-xl font-semibold" style={{ color: '#f472b6' }}>Project Tasks</div>
      <div className="space-y-6">
        {project.tasks
          ? Object.entries(project.tasks).map(([taskKey, task]) => (
              <div
                key={taskKey}
                className="rounded-lg p-4 shadow border"
                style={{
                  background: '#23232a',
                  borderColor: '#a78bfa',
                }}
              >
                <div className="font-semibold mb-2 text-lg flex items-center justify-between" style={{ color: '#a78bfa' }}>
                  <span
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ background: '#312e81', color: '#f3f4f6' }}
                  >
                    {task.title}
                  </span>
                  <button
                    className="ml-4 px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm flex items-center gap-2"
                    style={{ minWidth: 70, minHeight: 32, position: 'relative' }}
                    onClick={() => handleTaskCheck(taskKey, task)}
                    disabled={loadingTaskKey === taskKey}
                  >
                    {loadingTaskKey === taskKey ? (
                      <span className="loader mr-2" style={{ width: 16, height: 16, border: '2px solid #fff', borderTop: '2px solid #a78bfa', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                    ) : taskCheckStatus[taskKey] === true ? (
                      <span style={{ color: '#22c55e', fontSize: 18 }}>✔</span>
                    ) : taskCheckStatus[taskKey] === false ? (
                      <span style={{ color: '#ef4444', fontSize: 18 }}>✖</span>
                    ) : (
                      'Check'
                    )}
                  </button>
                </div>
                <ul className="space-y-2 ml-2 mt-2">
                  {task.subtasks && task.subtasks.map((subDesc, subIdx) => (
                    <li key={subIdx} className="flex text-left gap-3 items-center">
                      <input
                        type="checkbox"
                        checked={!!checked[taskKey]?.[subIdx]}
                        onChange={() => handleCheck(taskKey, subIdx)}
                        className="accent-purple-400 rounded border-gray-600 focus:ring-2 focus:ring-purple-400 bg-[#18181b]"
                        style={{ background: '#18181b', width: 20, height: 20, minWidth: 20, minHeight: 20, flexShrink: 0 }}
                      />
                      <span
                        className={`text-base ${checked[taskKey]?.[subIdx] ? 'line-through text-gray-500' : ''}`}
                        style={{ color: checked[taskKey]?.[subIdx] ? '#6b7280' : '#f3f4f6' }}
                      >
                        {subDesc}
                      </span>
                      {/* Tick/cross for subtask check and reason */}
                      {loadingTaskKey === taskKey && (!subtaskCheckResults[taskKey] || subtaskCheckResults[taskKey][subIdx] === undefined) ? (
                        <span className="loader ml-2" style={{ width: 14, height: 14, border: '2px solid #fff', borderTop: '2px solid #a78bfa', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                      ) : subtaskCheckResults[taskKey] && subtaskCheckResults[taskKey][subIdx] !== undefined ? (
                        <>
                          <span
                            style={{ color: subtaskCheckResults[taskKey][subIdx].complete ? '#22c55e' : '#ef4444', fontSize: 16, marginLeft: 6, cursor: 'pointer', position: 'relative' }}
                            onMouseEnter={e => {
                              clearTimeout(hoverTimeout.current);
                              const rect = e.target.getBoundingClientRect();
                              const rightSpace = window.innerWidth - rect.right;
                              hoverTimeout.current = setTimeout(() => {
                                setHoveredReason({ taskKey, subIdx, left: rightSpace < 250 });
                              }, 200);
                            }}
                            onMouseLeave={() => {
                              clearTimeout(hoverTimeout.current);
                              hoverTimeout.current = setTimeout(() => {
                                setHoveredReason({ taskKey: null, subIdx: null });
                              }, 200);
                            }}
                          >
                            {subtaskCheckResults[taskKey][subIdx].complete ? '✔' : '✖'}
                            {/* Absolute reason box */}
                            {(hoveredReason.taskKey === taskKey && hoveredReason.subIdx === subIdx) && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 24,
                                  left: hoveredReason.left ? 'auto' : 0,
                                  right: hoveredReason.left ? 0 : 'auto',
                                  zIndex: 100,
                                  background: '#23232a',
                                  color: '#a78bfa',
                                  fontSize: 11,
                                  border: '1px solid #a78bfa',
                                  borderRadius: 6,
                                  padding: '6px 10px',
                                  minWidth: 120,
                                  maxWidth: 220,
                                  whiteSpace: 'pre-line',
                                  boxShadow: '0 2px 8px #0006',
                                  transition: 'opacity 0.4s cubic-bezier(.4,0,.2,1), transform 0.4s cubic-bezier(.4,0,.2,1)',
                                  opacity: 1,
                                  transform: 'translateY(0px) scale(1)',
                                }}
                              >
                                {subtaskCheckResults[taskKey][subIdx].reason
                                  .split(/(?<=[.!?])\s+/)
                                  .slice(0, 2)
                                  .join(' ')
                                  .slice(0, 140)}
                              </div>
                            )}
                          </span>
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          : project.ProjectTasks && Object.entries(project.ProjectTasks).map(([taskKey, task]) => (
              <div
                key={taskKey}
                className="rounded-lg p-4 shadow border"
                style={{
                  background: '#23232a',
                  borderColor: '#a78bfa',
                }}
              >
                <div className="font-semibold mb-2 text-lg flex items-center justify-between" style={{ color: '#a78bfa' }}>
                  <span
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ background: '#312e81', color: '#f3f4f6' }}
                  >
                    {task.title}
                  </span>
                  <button
                    className="ml-4 px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm flex items-center gap-2"
                    style={{ minWidth: 70, minHeight: 32, position: 'relative' }}
                    onClick={() => handleTaskCheck(taskKey, task)}
                    disabled={loadingTaskKey === taskKey}
                  >
                    {loadingTaskKey === taskKey ? (
                      <span className="loader mr-2" style={{ width: 16, height: 16, border: '2px solid #fff', borderTop: '2px solid #a78bfa', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                    ) : taskCheckStatus[taskKey] === true ? (
                      <span style={{ color: '#22c55e', fontSize: 18 }}>✔</span>
                    ) : taskCheckStatus[taskKey] === false ? (
                      <span style={{ color: '#ef4444', fontSize: 18 }}>✖</span>
                    ) : (
                      'Check'
                    )}
                  </button>
                </div>
                <ul className="space-y-2 ml-2 mt-2">
                  {Object.entries(task)
                    .filter(([k]) => k !== 'title')
                    .map(([subKey, subDesc], idx) => (
                      <li key={subKey} className="flex text-left gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={!!checked[taskKey]?.[idx]}
                          onChange={() => handleCheck(taskKey, idx)}
                          className="accent-purple-400 rounded border-gray-600 focus:ring-2 focus:ring-purple-400 bg-[#18181b]"
                          style={{ background: '#18181b', width: 20, height: 20, minWidth: 20, minHeight: 20, flexShrink: 0 }}
                        />
                        <span
                          className={`text-base ${checked[taskKey]?.[idx] ? 'line-through text-gray-500' : ''}`}
                          style={{ color: checked[taskKey]?.[idx] ? '#6b7280' : '#f3f4f6' }}
                        >
                          {subDesc}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
      </div>
    </div>
  );
}

export default Statement;
