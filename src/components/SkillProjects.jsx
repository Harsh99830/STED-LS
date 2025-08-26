import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

export default function SkillProjects({ skill }) {
  const { user } = useUser();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedProjectId, setCopiedProjectId] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      
      try {
        const projectsRef = ref(db, `users/${user.id}/projects`);
        const projectsSnap = await get(projectsRef);
        
        if (projectsSnap.exists()) {
          const projectsData = Object.entries(projectsSnap.val())
            .map(([id, project]) => ({
              id,
              name: project.title || 'Project',
              description: project.description || '',
              completedDate: project.completedAt 
                ? new Date(project.completedAt).toLocaleDateString() 
                : new Date().toLocaleDateString(),
              sp: project.sp || 10,
              skill: project.skills || 'general',
              publicUrl: project.link || '',
              timestamp: project.completedAt || Date.now()
            }))
            // Filter projects by the current skill
            .filter(project => 
              Array.isArray(project.skill) 
                ? project.skill.some(s => s.toLowerCase() === skill.toLowerCase())
                : project.skill.toLowerCase() === skill.toLowerCase()
            )
            // Sort by timestamp (newest first)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

          setProjects(projectsData);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, skill]);

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md mt-8 p-6">
      <h2 className='text-2xl text-left font-bold text-slate-800 mb-6'>Projects</h2>
      
      {projects.length > 0 ? (
        <div className="space-y-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start text-left space-x-4 border-b border-slate-200 pb-4 last:border-0"
            >
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium text-slate-800">{project.name}</h3>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    +{Math.min(project.sp || 0, 10)} SP
                  </span>
                </div>
                <p className="text-slate-600 pt-2 text-sm">{project.description}</p>
                <div className="flex flex-col mt-2">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(project.skill) 
                        ? project.skill.map((s, idx) => (
                            <span key={idx} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap">
                              {String(s).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))
                        : (
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {(project.skill || 'General').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          )}
                    </div>
                    <span className="text-sm text-slate-500">{project.completedDate}</span>
                  </div>
                </div>
                {project.publicUrl && (
                  <div className="mt-2">
                    <button
                      className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs font-semibold border border-purple-200 transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(project.publicUrl);
                        setCopiedProjectId(project.id);
                        setTimeout(() => setCopiedProjectId(null), 1500);
                      }}
                    >
                      {copiedProjectId === project.id ? 'Copied!' : 'Copy Link'}
                    </button>
                    <a
                      href={project.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-semibold border border-blue-200 transition-colors"
                      style={{fontWeight: 500}}
                    >
                      View Project
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className='min-h-[200px] flex items-center justify-center text-slate-400'>
          No {skill} projects available. Complete a project to see it here!
        </div>
      )}
    </div>
  );
}
