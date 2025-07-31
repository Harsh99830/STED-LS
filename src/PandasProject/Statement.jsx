import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import { getProjectConfig } from '../PythonProject/projectConfig';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';
import cross from '../assets/cross.png';
import applied from '../assets/applied.png';
import tick from '../assets/applied.png';

function Statement({ userCode, taskCheckStatus, setTaskCheckStatus, subtaskCheckResults, setSubtaskCheckResults, expandedTask, setExpandedTask }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [projectKey, setProjectKey] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState({});
  const [loadingTaskKey, setLoadingTaskKey] = useState(null);
  const hoverTimeout = useRef();
  const [showProjectDesc, setShowProjectDesc] = useState(false);
  const projectDescIconRef = useRef();
  const [hoveredReason, setHoveredReason] = useState({ taskKey: null, subIdx: null, left: false });

  useEffect(() => {
    async function fetchProjectData() {
      setLoading(true);
      setError('');
      try {
        // Fetch PandasProject/Project1 from Firebase
        const projectRef = ref(db, 'PandasProject/Project1');
        const projectSnap = await get(projectRef);
        if (!projectSnap.exists()) {
          setError('Pandas project not found.');
          setLoading(false);
          return;
        }
        setProject(projectSnap.val());
        setLoading(false);
      } catch (err) {
        setError('Failed to load project: ' + err.message);
        setLoading(false);
      }
    }
    fetchProjectData();
  }, []);

  // Close overlay on outside click
  useEffect(() => {
    if (!showProjectDesc) return;
    function handleClick(e) {
      if (projectDescIconRef.current && !projectDescIconRef.current.contains(e.target)) {
        setShowProjectDesc(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showProjectDesc]);

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

  // For Pandas, just show the statement and subtasks, no code check

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
        background: '#18181b',
        color: '#f3f4f6',
        boxShadow: '0 4px 32px #000a',
      }}
    >
      <h1 className="text-3xl text-center justify-center font-bold mb-2 flex gap-2 items-center relative" style={{ color: '#a78bfa' }}>
        {project.title}
        <span ref={projectDescIconRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <FaQuestionCircle
            style={{
              color: '#e5e7eb',
              fontSize: 22,
              marginLeft: 8,
              cursor: 'pointer',
              verticalAlign: 'middle',
              opacity: 0.85,
              transition: 'color 0.2s'
            }}
            onClick={() => setShowProjectDesc(v => !v)}
            title="Show project description"
          />
          {showProjectDesc && (
            <div
              style={{
                position: 'absolute',
                top: 32,
                right: 0,
                zIndex: 100,
                background: '#23232a',
                color: '#e5e7eb',
                border: '1px solid #444',
                borderRadius: 8,
                padding: '16px 20px',
                minWidth: 350,
                maxWidth: 340,
                boxShadow: '0 4px 24px #000a',
                fontSize: 16,
                lineHeight: '1.6',
                whiteSpace: 'pre-line',
                transition: 'opacity 0.3s cubic-bezier(.4,0,.2,1), transform 0.3s cubic-bezier(.4,0,.2,1)',
                opacity: 1,
                transform: 'translateY(0px) scale(1)'
              }}
            >
              {project.description}
            </div>
          )}
        </span>
      </h1>
      {project.Concept && (
        <div className="text-center mb-6">
          <p className="text-sm text-gray-400" style={{ fontSize: '14px', color: '#9ca3af' }}>
            <span className='font-semibold'>Concepts Used:</span> {project.Concept}
          </p>
        </div>
      )}
      <div className="space-y-6 mt-10">
        {project.tasks && Object.entries(project.tasks).map(([taskKey, task]) => {
          const isExpanded = expandedTask === taskKey;
          return (
            <div
              key={taskKey}
              className="p-4 shadow border"
              style={{ background: '#23232a', borderColor: '#444', borderRadius: 0 }}
            >
              <div
                className="font-semibold mb-2 text-lg flex items-center justify-between cursor-pointer select-none"
                style={{ color: '#e5e7eb', borderRadius: 0, fontSize: 24, lineHeight: '2.2rem' }}
                onClick={() => setExpandedTask(isExpanded ? null : taskKey)}
              >
                <span className="flex items-center gap-2">
                  <FaChevronDown
                    style={{
                      transition: 'transform 0.3s',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      fontSize: 16,
                    }}
                  />
                  <span
                    className="px-3 py-1"
                    style={{ background: '#23232a', color: '#e5e7eb', borderRadius: 0, fontWeight: 400, fontSize: 20, lineHeight: '2.2rem' }}
                  >
                    {task.title}
                  </span>
                </span>
              </div>
              {isExpanded && (
                <ul className="space-y-2 ml-2 mt-2">
                  {task.subtasks && task.subtasks.map((subDesc, subIdx) => (
                    <li
                      key={subIdx}
                      className="flex text-left items-center justify-between"
                      style={{ borderBottom: '1px solid #333', paddingBottom: 6, marginBottom: 4, paddingRight: 0 }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={!!checked[taskKey]?.[subIdx]}
                          onChange={() => handleCheck(taskKey, subIdx)}
                          className="border-gray-600 focus:ring-2 bg-[#18181b]"
                          style={{ background: '#18181b', width: 20, height: 20, minWidth: 20, minHeight: 20, flexShrink: 0, borderRadius: 0 }}
                        />
                        <span
                          className={`text-base ${checked[taskKey]?.[subIdx] ? 'line-through text-gray-500' : ''}`}
                          style={{ color: checked[taskKey]?.[subIdx] ? '#6b7280' : '#f3f4f6' }}
                        >
                          {subDesc}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Statement;
