import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';

function Statement() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [projectKey, setProjectKey] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState({});

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
        // Get project data
        const projectRef = ref(db, 'PythonProject/' + startedKey);
        const projectSnap = await get(projectRef);
        if (!projectSnap.exists()) {
          setError('Project not found.');
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
        {project.ProjectTasks && Object.entries(project.ProjectTasks).map(([taskKey, task]) => (
          <div
            key={taskKey}
            className="rounded-lg p-4 shadow border"
            style={{
              background: '#23232a', // slightly lighter dark
              borderColor: '#a78bfa', // purple-400
            }}
          >
            <div className="font-semibold mb-2 text-lg flex items-center gap-2" style={{ color: '#a78bfa' }}>
              <span
                className="px-3 py-1 rounded-full text-sm"
                style={{ background: '#312e81', color: '#f3f4f6' }}
              >
                {task.title}
              </span>
            </div>
            <ul className="space-y-2 ml-2 mt-2">
              {Object.entries(task)
                .filter(([k]) => k !== 'title')
                .map(([subKey, subDesc]) => (
                  <li key={subKey} className="flex text-left gap-3 items-center">
                    <input
                      type="checkbox"
                      checked={!!checked[taskKey]?.[subKey]}
                      onChange={() => handleCheck(taskKey, subKey)}
                      className="accent-purple-400 rounded border-gray-600 focus:ring-2 focus:ring-purple-400 bg-[#18181b]"
                      style={{ background: '#18181b', width: 20, height: 20, minWidth: 20, minHeight: 20, flexShrink: 0 }}
                    />
                    <span
                      className={`text-base ${checked[taskKey]?.[subKey] ? 'line-through text-gray-500' : ''}`}
                      style={{ color: checked[taskKey]?.[subKey] ? '#6b7280' : '#f3f4f6' }}
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
