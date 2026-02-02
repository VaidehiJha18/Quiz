import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/apiService'; // Assuming you have your axios instance here

const ProfessorResultsPage = () => {
  const { quizId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the big table of results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        // You need to add this route to apiService or call axios directly
        const res = await api.get(`/prof/quiz-results/${quizId}`);
        setResults(res.data);
      } catch (err) {
        console.error("Error fetching results", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [quizId]);

  // Function to Publish All
  const handlePublish = async () => {
    try {
        const attemptIds = results.map(r => r.attempt_id);
        await api.post('/prof/publish-results', { attempt_ids: attemptIds });
        alert("Results Published! Students can now see them.");
        window.location.reload(); // Refresh to show updated status
    } catch (err) {
        alert("Error publishing results.");
    }
  };

  if (loading) return <div>Loading Student Data...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Student Results</h1>
        <button 
            onClick={handlePublish}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            Publish All Results
        </button>
      </div>

      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border">Enrollment No</th>
            <th className="p-3 border">Student Name</th>
            <th className="p-3 border">Course</th>
            <th className="p-3 border">Semester</th>
            <th className="p-3 border">Score</th>
            <th className="p-3 border">Submitted At</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.attempt_id} className="text-center hover:bg-gray-50">
              <td className="p-3 border">{r.enrollment_no || 'N/A'}</td>
              <td className="p-3 border">{r.f_name} {r.l_name}</td>
              <td className="p-3 border">{r.course_name || 'N/A'}</td>
              <td className="p-3 border">Sem {r.sem_no || 'N/A'}</td>
              <td className="p-3 border font-bold text-blue-600">{r.total_score}</td>
              <td className="p-3 border">{new Date(r.submit_time).toLocaleString()}</td>
              <td className="p-3 border">
                {r.is_published ? (
                    <span className="text-green-600 font-bold">Published</span>
                ) : (
                    <span className="text-gray-500">Hidden</span>
                )}
              </td>
              <td className="p-3 border">
                {/* THIS IS THE LINK YOU WANTED */}
                <Link 
                    to={`/result/${r.attempt_id}`} 
                    target="_blank" // Opens in new tab so professor doesn't lose table view
                    className="text-blue-500 underline"
                >
                    View Answer Sheet
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProfessorResultsPage;