import React, { useEffect, useState } from 'react';
import { getMyProjects } from '@/services/projectService';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getMyProjects();
        setProjects(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <div className="p-8">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">My Projects</h1>
      
      {projects.length === 0 ? (
        <p className="text-gray-500">No projects found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-bold mb-2">{project.title}</h2>
              <p className="text-gray-600 mb-4">{project.description}</p>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Status:</span> {project.status}
                </div>
                <div>
                  <span className="font-semibold">Assigned Editor:</span>{' '}
                    {project.assignedEditorEmail || 'Not Assigned'}
                </div>
                <div>
                  <span className="font-semibold">Created Date:</span>{' '}
                    {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
