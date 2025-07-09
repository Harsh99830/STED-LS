import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

function Feed() {
  const [feedProjects, setFeedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    // Fetch all users and their completed Python projects
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setFeedProjects([]);
        setLoading(false);
        return;
      }
      const usersObj = snapshot.val();
      let allProjects = [];
      await Promise.all(Object.entries(usersObj).map(async ([uid, userData]) => {
        // Exclude current user
        if (user && uid === user.id) return;
        const name = userData.name || userData.fullName || userData.username || 'Student';
        const pythonProjects = userData.python?.PythonCompletedProjects || {};
        Object.entries(pythonProjects).forEach(([projectId, project]) => {
          allProjects.push({
            userId: uid,
            userName: name,
            projectId,
            projectTitle: project.projectTitle || project.title || 'Python Project',
            completedAt: project.completedAt || project.completedDate || null,
            publicUrl: project.publicUrl || '',
          });
        });
      }));
      // Sort by completedAt descending (latest first)
      allProjects.sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0);
        const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0);
        return dateB - dateA;
      });
      setFeedProjects(allProjects);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  if (loading) return <div>Loading feed...</div>;
  if (feedProjects.length === 0) return <div>No projects to show yet.</div>;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {feedProjects.map((project, idx) => (
        <div key={project.projectId + project.userId} className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold text-slate-700">{project.userName}</span>
            {project.completedAt && (
              <span className="text-xs text-slate-500">{new Date(project.completedAt).toLocaleString()}</span>
            )}
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1 break-words">{project.projectTitle}</div>
          {project.publicUrl && (
            <div className="w-full mb-3">
              <iframe
                src={project.publicUrl.replace('/public/python-project/', '/python-project/') + '?preview=true'}
                title={project.projectTitle}
                className="w-full h-[350px] rounded border"
                style={{ minHeight: '200px', maxHeight: '350px' }}
                sandbox="allow-scripts allow-same-origin allow-popups"
                scrolling="yes"
              />
            </div>
          )}
          {project.publicUrl && (
            <a
              href={project.publicUrl.replace('/public/python-project/', '/python-project/')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded font-semibold text-base hover:bg-blue-700 transition-colors"
            >
              Preview
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

export default Feed;