import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import { useUser } from '@clerk/clerk-react';

// Accepts a render prop for full control of UI
function ProjectRecommender({ learnedConcepts, completedProjects = [], projectType = 'python', children }) {
  const [recommendedProject, setRecommendedProject] = useState(null);
  const [allMatchingProjects, setAllMatchingProjects] = useState([]);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUser();

  // Function to get next project from the list
  const getNextProject = () => {
    if (allMatchingProjects.length === 0) return;
    const nextIndex = (currentProjectIndex + 1) % allMatchingProjects.length;
    setCurrentProjectIndex(nextIndex);
    setRecommendedProject(allMatchingProjects[nextIndex]);
  };

  useEffect(() => {
    async function fetchAndRecommend() {
      setLoading(true);
      setError('');
      setRecommendedProject(null);
      setAllMatchingProjects([]);
      setCurrentProjectIndex(0);
      
      try {
        // Fetch all projects from Firebase based on project type
        const projectPath = projectType === 'pandas' ? 'PandasProject' : 'PythonProject';
        const projectsRef = ref(db, projectPath);
        const snapshot = await get(projectsRef);
        
        if (!snapshot.exists()) {
          setError('No projects found.');
          setLoading(false);
          return;
        }
        
        const projects = snapshot.val();
        // console.log(`Found ${projectType} projects:`, projects);
        
        // Prepare learned concepts as a Set for fast lookup
        let learnedSet = new Set();
        // console.log('Raw learnedConcepts:', learnedConcepts);
        
        if (Array.isArray(learnedConcepts)) {
          learnedSet = new Set(
            learnedConcepts.map(c => {
              const concept = c.concept || c;
              return typeof concept === 'string' ? concept.toLowerCase().trim() : '';
            }).filter(Boolean)
          );
        } else if (typeof learnedConcepts === 'object' && learnedConcepts !== null) {
          learnedSet = new Set(
            Object.values(learnedConcepts).map(c => {
              const concept = c.concept || c;
              return typeof concept === 'string' ? concept.toLowerCase().trim() : '';
            }).filter(Boolean)
          );
        }
        
        // console.log('Learned concepts:', Array.from(learnedSet));
        // console.log('Total learned concepts:', learnedSet.size);
        
        // Find all projects where all required concepts are learned - make it more flexible
        const matchingProjects = [];
        Object.values(projects).forEach(project => {
          if (!project.Concept) {
            // console.log('Project has no Concept field:', project.title || project.id);
            return;
          }
          
          // Split concepts by comma and trim
          const required = project.Concept.split(',').map(s => s.toLowerCase().trim());
          // console.log('Required concepts for project:', project.title || project.id, required);
          
          // Check if all required concepts are learned - make it more flexible
          let learnedCount = 0;
          const totalRequired = required.length;
          
          required.forEach(concept => {
            if (learnedSet.has(concept)) {
              learnedCount++;
              // console.log(`✓ Concept "${concept}" is learned for project "${project.title || project.id}"`);
            } else {
              // console.log(`✗ Concept "${concept}" not learned for project "${project.title || project.id}"`);
            }
          });
          
          // For now, let's show projects if at least one concept is learned (more lenient)
          if (learnedCount > 0) {
            // console.log(`Project "${project.title || project.id}" matches - ${learnedCount}/${totalRequired} concepts learned`);
            matchingProjects.push(project);
          } else {
            // console.log(`Project "${project.title || project.id}" skipped - no concepts learned (0/${totalRequired})`);
          }
        });
        
        // console.log('Matching projects found:', matchingProjects.length);
        
        // If no projects match by concepts, let's show all projects for debugging
        if (matchingProjects.length === 0 && learnedSet.size > 0) {
          // console.log('No projects match by concepts, showing all projects for debugging');
          Object.values(projects).forEach(project => {
            if (project.Concept) {
              matchingProjects.push(project);
            }
          });
        }
        
        // If still no projects and no learned concepts, show all projects
        if (matchingProjects.length === 0 && learnedSet.size === 0) {
          // console.log('No concepts learned yet, showing all projects');
          Object.values(projects).forEach(project => {
            if (project.Concept) {
            matchingProjects.push(project);
          }
        });
        }
        
        // Filter out completed projects
        const completedProjectKeys = new Set(completedProjects.map(p => p.projectKey || p.key || p.title));
        
        const availableProjects = matchingProjects.filter(project => {
          // Check if this project has been completed - try multiple possible key formats
          const projectId = project.id || project.title;
          const projectTitle = project.title;
          
          // Try different variations of the project key
          const possibleKeys = [
            projectId,
            projectId?.toLowerCase(),
            projectId?.toUpperCase(),
            projectTitle,
            projectTitle?.toLowerCase(),
            projectTitle?.toUpperCase(),
            // Handle the case where project.id is "project1" but saved as "Project1"
            projectId?.replace(/^project/, 'Project'),
            // Handle the case where project.id is "project1" but saved as "Project1"
            projectId?.replace(/^Project/, 'project')
          ];
          
          const isCompleted = possibleKeys.some(key => completedProjectKeys.has(key));
          
          if (isCompleted) {
            // console.log(`Project "${project.title}" already completed`);
          }
          
          return !isCompleted;
        });
        
        // console.log('Available projects:', availableProjects.length);
        
        if (availableProjects.length > 0) {
          setAllMatchingProjects(availableProjects);
          setRecommendedProject(availableProjects[0]);
          setCurrentProjectIndex(0);
        } else {
          setRecommendedProject(null);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to fetch projects.');
      }
      setLoading(false);
    }
    
    if (user) {
      fetchAndRecommend();
    }
  }, [learnedConcepts, user, completedProjects, projectType]);

  // Render prop for full UI control
  if (typeof children === 'function') {
    return children({ 
      recommendedProject, 
      loading, 
      error, 
      getNextProject, 
      hasMultipleProjects: allMatchingProjects.length > 1,
      currentProjectIndex,
      totalProjects: allMatchingProjects.length
    });
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