import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/apiService';

export default function QuizPreviewPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        // Fetches preview details specifically for the professor
        const res = await api.get(`/prof/quiz-preview/${token}`);
        setQuizData(res.data);
      } catch (err) {
        console.error("Error fetching preview:", err);
        alert("Failed to load quiz preview.");
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [token]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem', color: '#64748b' }}>Loading Preview...</div>;
  if (!quizData || !quizData.questions) return <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>Quiz not found or invalid token.</div>;

  return (
    <main className="main-content" style={styles.container}>
      
      {/* 🟡 PREVIEW BANNER */}
      <div style={styles.banner}>
        <span style={{ fontSize: '2rem', marginRight: '15px' }}>👀</span>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#854d0e' }}>Professor Preview Mode</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: '#a16207' }}>
            This is a read-only preview. Students will not see the correct answers highlighted.
          </p>
        </div>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Close Preview</button>
      </div>

      {/* 🔵 QUIZ TITLE */}
      <div style={styles.quizHeader}>
        <h1 style={{ margin: 0, color: '#1e293b' }}>{quizData.title}</h1>
        <p style={{ margin: '8px 0 0 0', color: '#64748b', fontWeight: '600' }}>Total Questions: {quizData.questions.length}</p>
      </div>

      {/* 📝 QUESTION LIST */}
      <div style={styles.questionList}>
        {quizData.questions.map((q, index) => (
          <div key={q.id} style={styles.questionCard}>
            <h3 style={styles.questionText}>
              <span style={styles.questionNumber}>Q{index + 1}.</span> {q.text}
            </h3>
            
            <div style={styles.optionsGrid}>
              {q.options.map((opt, oIndex) => (
                <div 
                  key={oIndex} 
                  style={{
                    ...styles.optionBox,
                    // Highlight the correct option in Green
                    ...(opt.is_correct ? styles.correctOption : {})
                  }}
                >
                  <input 
                    type="radio" 
                    disabled // Stops clicking
                    checked={opt.is_correct} // Auto-selects the correct answer
                    style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                  />
                  {opt.text}
                  {opt.is_correct && <span style={styles.correctLabel}>✓ Correct Answer</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
    </main>
  );
}

// --- CSS STYLES ---
const styles = {
  container: { padding: '30px', maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' },
  banner: { 
      backgroundColor: '#fef08a', 
      padding: '20px', 
      borderRadius: '12px', 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '30px', 
      border: '1px solid #fde047',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  backBtn: { 
      marginLeft: 'auto', 
      backgroundColor: '#ca8a04', 
      color: 'white', 
      border: 'none', 
      padding: '10px 18px', 
      borderRadius: '8px', 
      fontWeight: 'bold', 
      cursor: 'pointer',
      transition: 'background 0.2s'
  },
  quizHeader: { 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
      marginBottom: '30px', 
      borderTop: '5px solid #667eea' 
  },
  questionList: { display: 'flex', flexDirection: 'column', gap: '25px' },
  questionCard: { 
      backgroundColor: 'white', 
      padding: '30px', 
      borderRadius: '12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
      border: '1px solid #e2e8f0' 
  },
  questionText: { margin: '0 0 20px 0', color: '#1e293b', fontSize: '1.2rem', lineHeight: '1.5' },
  questionNumber: { color: '#667eea', marginRight: '8px', fontWeight: '800' },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '12px' },
  optionBox: { 
      display: 'flex', 
      alignItems: 'center', 
      padding: '14px 18px', 
      border: '1px solid #cbd5e1', 
      borderRadius: '8px', 
      backgroundColor: '#f8fafc', 
      color: '#475569',
      fontSize: '1.05rem'
  },
  correctOption: { 
      backgroundColor: '#dcfce7', 
      borderColor: '#86efac', 
      color: '#166534', 
      fontWeight: '600',
      boxShadow: '0 2px 4px rgba(34, 197, 94, 0.1)'
  },
  correctLabel: { 
      marginLeft: 'auto', 
      fontSize: '0.85rem', 
      backgroundColor: '#22c55e', 
      color: 'white', 
      padding: '4px 10px', 
      borderRadius: '20px',
      fontWeight: 'bold'
  }
};