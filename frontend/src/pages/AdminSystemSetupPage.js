import React, { useState } from 'react';
import AdminSidebar from '../components/layout/AdminSidebar';

const AdminSystemSetupPage = () => {
  // We will wire these up to Python in the next step!
  const [schools, setSchools] = useState([{ id: 1, name: 'School of Technology (SOT)' }, { id: 2, name: 'School of Science (SOS)' }]);
  const [branches, setBranches] = useState([{ id: 1, name: 'B.Tech CSE', school_id: 1 }]);
  
  const [newSchoolName, setNewSchoolName] = useState('');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      <AdminSidebar />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '60px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '0 30px' }}>
          <h3 style={{ margin: 0, color: '#4a3b69' }}>System Setup & Hierarchy</h3>
        </div>

        <div style={{ padding: '40px', maxWidth: '1200px' }}>
          <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>University Configuration</h1>
          <p style={{ color: '#6c757d', marginBottom: '40px' }}>Manage the structural data that powers the application dropdowns and filters.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            {/* --- PANEL 1: SCHOOLS --- */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ color: '#4a3b69', marginTop: 0, borderBottom: '2px solid #f4f6f9', paddingBottom: '10px' }}>Manage Schools</h3>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                  type="text" 
                  placeholder="New School Name (e.g., School of Arts)" 
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
                <button style={{ padding: '10px 20px', backgroundColor: '#84e8cd', color: '#2c3e50', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  + Add
                </button>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {schools.map(school => (
                  <li key={school.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', backgroundColor: '#f8f9fa', marginBottom: '8px', borderRadius: '6px', border: '1px solid #eee' }}>
                    <span style={{ fontWeight: '500', color: '#333' }}>{school.name}</span>
                    <button style={{ color: '#d9534f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* --- PANEL 2: BRANCHES / PROGRAMS --- */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ color: '#4a3b69', marginTop: 0, borderBottom: '2px solid #f4f6f9', paddingBottom: '10px' }}>Manage Branches (Programs)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <select style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="">Select Parent School...</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="New Branch (e.g., B.Tech Civil)" style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  <button style={{ padding: '10px 20px', backgroundColor: '#84e8cd', color: '#2c3e50', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ Add</button>
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {branches.map(branch => (
                  <li key={branch.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', backgroundColor: '#f8f9fa', marginBottom: '8px', borderRadius: '6px', border: '1px solid #eee' }}>
                    <span style={{ fontWeight: '500', color: '#333' }}>{branch.name}</span>
                    <button style={{ color: '#d9534f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemSetupPage;