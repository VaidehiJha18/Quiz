import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { fetchPaperFullDetails, downloadPaperDocx } from '../api/apiService';
import './PaperPreviewPage.css';

export default function PaperPreviewPage() {
  const { paperId } = useParams();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaperFullDetails(paperId)
      .then((res) => setPaper(res.data))
      .catch((err) => console.error('Error fetching paper:', err))
      .finally(() => setLoading(false));
  }, [paperId]);

  const handleDownloadDocx = async () => {
    try {
      const response = await downloadPaperDocx(paperId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `GSFC_Paper_${paperId}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download Word file.');
    }
  };

const renderMathText = (txt) => {
    if (!txt) return '';
    return txt.split(/(\$.*?\$)/).map((segment, idx) => {
      if (segment.startsWith('$') && segment.endsWith('$')) {
        const rawFormula = segment.slice(1, -1);
        try {
          const html = katex.renderToString(rawFormula, { throwOnError: false });
          return <span key={idx} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (e) {
          return <span key={idx}>{segment}</span>;
        }
      }
      return segment;
    });
  };

  if (loading) return <div className="preview-loading">Loading paper preview...</div>;
  if (!paper) return <div className="preview-error">Exam paper not found.</div>;

  return (
    <div className="preview-wrapper">
      <div className="export-bar">
        <button onClick={handleDownloadDocx} className="docx-export-btn">
          📄 Download Word Document (.docx)
        </button>
        <button onClick={() => window.print()} className="print-export-btn">
          🖨️ Print / Save as PDF
        </button>
      </div>

      {/* GSFC Institutional Print Layout Container */}
      <div className="exam-sheet">
        <div className="enrollment-header">Enrollment No: ____________________</div>

        <div className="institution-title">
          <h2>GSFC UNIVERSITY</h2>
          <h3>SCHOOL OF TECHNOLOGY</h3>
          <h4>
            B.Tech. CSE, {paper.exam_type === 'mid_sem' ? 'Mid Semester Examination' : 'End Semester Examination'}, Odd Session {paper.academic_year || '2025-26'}
          </h4>
        </div>

        <table className="metadata-table">
          <tbody>
            <tr>
              <td><strong>Semester:</strong> VII</td>
              <td><strong>Date:</strong> {new Date(paper.created_at).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Course Code:</strong> {paper.course_code || 'BTCS701'}</td>
              <td><strong>Time:</strong> {paper.exam_type === 'mid_sem' ? '10:00 AM to 11:00 AM' : '10:00 AM to 12:00 PM'}</td>
            </tr>
            <tr>
              <td><strong>Course Name:</strong> {paper.course_name}</td>
              <td><strong>Total Marks:</strong> {paper.total_marks}</td>
            </tr>
          </tbody>
        </table>

        <div className="instructions-section">
          <strong>Instructions:</strong>
          <ol>
            <li>Attempt all questions.</li>
            <li>Figures to the right indicate full marks.</li>
            <li>Make suitable assumptions wherever necessary.</li>
          </ol>
        </div>

        <div className="questions-body">
          {paper.sections?.map((sec, sIdx) => (
            <div key={sIdx} className="section-block">
              <table className="question-table">
                <thead>
                  <tr className="q-header-row">
                    <th style={{ width: '8%' }}>{sec.question_number}</th>
                    <th style={{ width: '82%' }}>{sec.instructions}</th>
                    <th style={{ width: '10%', textAlign: 'right' }}>({String(sec.total_section_marks).padStart(2, '0')})</th>
                  </tr>
                </thead>
                <tbody>
                  {sec.main_questions?.map((item, mIdx) => (
                    <tr key={mIdx} className="q-row">
                      <td className="sub-label">{item.sub_label}</td>
                      <td className="q-text">
                        {renderMathText(item.question_txt)}
                        {item.diagram_url && (
                          <div className="diagram-box">
                            <img src={item.diagram_url} alt="Diagram" />
                          </div>
                        )}
                      </td>
                      <td className="q-marks">({String(item.marks).padStart(2, '0')})</td>
                    </tr>
                  ))}

                  {sec.or_questions?.length > 0 && (
                    <>
                      <tr>
                        <td colSpan="3" className="or-divider-cell">OR</td>
                      </tr>
                      {sec.or_questions.map((item, oIdx) => (
                        <tr key={oIdx} className="q-row">
                          <td className="sub-label">{item.sub_label}</td>
                          <td className="q-text">
                            {renderMathText(item.question_txt)}
                            {item.diagram_url && (
                              <div className="diagram-box">
                                <img src={item.diagram_url} alt="Diagram" />
                              </div>
                            )}
                          </td>
                          <td className="q-marks">({String(item.marks).padStart(2, '0')})</td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="end-divider">*********</div>
      </div>
    </div>
  );
}