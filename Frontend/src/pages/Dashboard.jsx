import { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { apiFetch, getResumes } from '../api';
import ResumeForm from '../components/ResumeForm';

export default function Dashboard() {
  const { token, logout } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResume, setEditingResume] = useState(null);
  const [deletingResumeIds, setDeletingResumeIds] = useState(() => new Set());

  // Fetch resumes when component mounts
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await getResumes(token);
        setResumes(data);
      } catch (err) {
        console.error(err);
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [token]);

  // Callback when a resume is successfully created or updated
  const handleResumeCreated = (savedResume) => {
    setResumes((current) => editingResume
      ? current.map((resume) => resume.id === savedResume.id ? savedResume : resume)
      : [savedResume, ...current]);
    setEditingResume(null);
    setShowForm(false);
  };

    // Delete a resume
  const handleDelete = async (resumeId) => {
      if (deletingResumeIds.has(resumeId)) return;
    if (!window.confirm("Are you sure you want to delete this resume?")) return;

      setDeletingResumeIds((current) => new Set(current).add(resumeId));
      try {
        await apiFetch(`/resumes/${resumeId}`, {
          method: 'DELETE',
      }, token);
        setResumes((current) => current.filter((r) => r.id !== resumeId));
      } catch (err) {
        alert(err.message);
      } finally {
        setDeletingResumeIds((current) => {
          const updated = new Set(current);
          updated.delete(resumeId);
          return updated;
        });
      }
    };
  
  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Resumes</h1>
        <button 
          onClick={logout} 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto">
        
        {/* Toggle Form Button */}
        {!showForm && (
          <button 
            onClick={() => { setEditingResume(null); setShowForm(true); }} 
            className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700"
          >
            + Create New Resume
          </button>
        )}

        {/* The Form */}
        {showForm && (
          <ResumeForm 
            onResumeCreated={handleResumeCreated} 
            onCancel={() => {
              setEditingResume(null);
              setShowForm(false);
            }}
            initialData={editingResume}
          />
        )}

        {/* Resume List */}
        {loading ? (
          <p>Loading...</p>
        ) : resumes.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-center">
            <p className="text-gray-500">You haven't created any resumes yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resumes.map((resume) => (
              <div key={resume.id} className="bg-white p-6 rounded shadow flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{resume.full_name}</h2>
                  <p className="text-gray-500">{resume.email}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {resume.experiences.length} experience(s)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingResume(resume);
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm px-3 py-1 rounded border border-blue-200 hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    disabled={deletingResumeIds.has(resume.id)}
                    aria-busy={deletingResumeIds.has(resume.id)}
                    className="text-red-500 hover:text-red-700 font-semibold text-sm px-3 py-1 rounded border border-red-200 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                  >
                    {deletingResumeIds.has(resume.id) ? (
                      <span className="flex items-center gap-2" aria-live="polite">
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                        Deleting...
                      </span>
                    ) : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}