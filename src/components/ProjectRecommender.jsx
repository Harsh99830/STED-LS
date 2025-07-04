import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import { useUser } from '@clerk/clerk-react';

// Accepts a render prop for full control of UI
function ProjectRecommender({ learnedConcepts, children }) {
  const [recommendedProject, setRecommendedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUser();

  useEffect(() => {
    async function fetchAndRecommend() {
      setLoading(true);
      setError('');
      setRecommendedProject(null);
      try {
        // Fetch all projects from Firebase
        const projectsRef = ref(db, 'PythonProject');
        const snapshot = await get(projectsRef);
        if (!snapshot.exists()) {
          setError('No projects found.');
          setLoading(false);
          return;
        }
        const projects = snapshot.val();
        // Prepare learned concepts as a Set for fast lookup
        let learnedSet = new Set();
        if (Array.isArray(learnedConcepts)) {
          learnedSet = new Set(
            learnedConcepts.map(c => c.concept.toLowerCase().trim())
          );
        } else if (typeof learnedConcepts === 'object' && learnedConcepts !== null) {
          learnedSet = new Set(
            Object.values(learnedConcepts).map(c => c.concept.toLowerCase().trim())
          );
        }
        // Find a project where all required concepts are learned
        let found = null;
        Object.values(projects).forEach(project => {
          if (!project.Concept) return;
          // Split concepts by comma and trim
          const required = project.Concept.split(',').map(s => s.toLowerCase().trim());
          const allLearned = required.every(concept => learnedSet.has(concept));
          if (allLearned && !found) {
            found = project;
          }
        });
        if (found) {
          setRecommendedProject(found);
        } else {
          setRecommendedProject(null);
        }
      } catch (err) {
        setError('Failed to fetch projects.');
      }
      setLoading(false);
    }
    if (learnedConcepts && user) {
      fetchAndRecommend();
    }
  }, [learnedConcepts, user]);

  // Render prop for full UI control
  if (typeof children === 'function') {
    return children({ recommendedProject, loading, error });
  }

  // Default fallback UI (not used in overlay integration)
  if (loading) return <div>Loading project recommendation...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!recommendedProject) return <div>No suitable project found for your learned concepts yet.</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4">
      <h2 className="text-xl font-bold mb-2 text-purple-700">Recommended Project</h2>
      <div className="text-lg font-semibold mb-1">{recommendedProject.title}</div>
      <div className="mb-2 text-gray-700">{recommendedProject.description}</div>
      <div className="text-sm text-gray-500">Required Concepts: {recommendedProject.Concept}</div>
    </div>
  );
}

export default ProjectRecommender; 