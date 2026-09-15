// import React, { useState, useEffect } from 'react';
// import AdminSidebar from '../components/layout/AdminSidebar';
// import { getAdminSchools, getAdminPrograms, getAdminProgramSemesters, getAdminMappings } from '../api/apiService';

// export default function ManageUsersPage() {
//   const [users, setUsers] = useState([]);
//   const [roleTab, setRoleTab] = useState('student'); // 'student' or 'professor'
//   const [search, setSearch] = useState('');

//   // Hierarchy filter states (Background Dashboard Filters)
//   const [schools, setSchools] = useState([]);
//   const [branches, setBranches] = useState([]);
//   const [semesters, setSemesters] = useState([]);
//   const [mappings, setMappings] = useState([]);

//   const [selectedSchool, setSelectedSchool] = useState('');
//   const [selectedBranch, setSelectedBranch] = useState('');
//   const [selectedSemester, setSelectedSemester] = useState('');
//   const [selectedDivision, setSelectedDivision] = useState('');

//   // Upload Modal State (Isolated Independent State)
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [uploadFile, setUploadFile] = useState(null);
//   const [targetSchool, setTargetSchool] = useState('');     // Isolated modal school
//   const [targetProgram, setTargetProgram] = useState('');   // Isolated modal branch
//   const [targetSemester, setTargetSemester] = useState(''); // Isolated modal semester
//   const [targetDivision, setTargetDivision] = useState('');
//   const [targetBatch, setTargetBatch] = useState('');

//   useEffect(() => {
//     fetchFilterOptions();
//   }, []);

//   useEffect(() => {
//     if (roleTab === 'student') {
//       if (selectedSchool) {
//         fetchUsers();
//       } else {
//         setUsers([]);
//       }
//     } else {
//       fetchUsers();
//     }
//   }, [roleTab, selectedSchool, selectedBranch, selectedSemester, selectedDivision, search]);

//   const fetchFilterOptions = async () => {
//     try {
//       setSchools(await getAdminSchools());
//       setBranches(await getAdminPrograms());
//       setSemesters(await getAdminProgramSemesters());
//       setMappings(await getAdminMappings());
//     } catch (err) {
//       console.error("Error loading filter data:", err);
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       let url = `http://localhost:5000/api/admin/users?search=${search}&school=${selectedSchool || 'All'}&branch=${selectedBranch || 'All'}&semester=${selectedSemester || 'All'}&division=${selectedDivision || 'All'}`;
//       const response = await fetch(url, {
//         headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//       });
//       const data = await response.json();
//       if (response.ok) {
//         const filtered = (data.users || []).filter(u => {
//           if (roleTab === 'student') return u.role_id === 1;
//           if (roleTab === 'professor') return u.role_id === 2;
//           return true;
//         });
//         setUsers(filtered);
//       }
//     } catch (err) {
//       console.error("Error fetching users:", err);
//     }
//   };

//   const handleUploadSubmit = async (e) => {
//     e.preventDefault();
//     if (!uploadFile || !targetProgram || !targetSemester || !targetDivision || !targetBatch) {
//       alert("Please provide all target academic context fields and select a spreadsheet file.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append('file', uploadFile);
//     formData.append('program_id', targetProgram);
//     formData.append('semester_id', targetSemester);
//     formData.append('division_id', targetDivision);
//     formData.append('batch_id', targetBatch);

//     try {
//       const response = await fetch('http://localhost:5000/api/admin/users/upload', {
//         method: 'POST',
//         headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
//         body: formData
//       });
//       const result = await response.json();
//       if (response.ok) {
//         alert(result.message);
//         setShowUploadModal(false);
//         setUploadFile(null);
//         setTargetSchool('');
//         setTargetProgram('');
//         setTargetSemester('');
//         setTargetDivision('');
//         setTargetBatch('');
//         fetchUsers();
//       } else {
//         alert(result.error || "Upload failed");
//       }
//     } catch (err) {
//       alert("Error uploading file: " + err.message);
//     }
//   };

//   const handleDeleteUser = async (userId) => {
//     if (window.confirm("Are you sure you want to delete this user?")) {
//       try {
//         const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
//           method: 'DELETE',
//           headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//         });
//         if (response.ok) {
//           fetchUsers();
//         } else {
//           alert("Failed to delete user.");
//         }
//       } catch (err) {
//         alert("Error: " + err.message);
//       }
//     }
//   };

//   // Dashboard filter cascading lists
//   const availableBranches = branches.filter(b => b.school_id === parseInt(selectedSchool || 0));
//   const availableSemesters = semesters.filter(s => s.program_id === parseInt(selectedBranch || 0));

//   // Modal cascading lists (completely separated from background)
//   const modalAvailableBranches = branches.filter(b => b.school_id === parseInt(targetSchool || 0));
//   const modalAvailableSemesters = semesters.filter(s => s.program_id === parseInt(targetProgram || 0));

//   return (
//     <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
//       <AdminSidebar />

//       <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//         <div style={{ height: '65px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '0 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
//           <h3 style={{ margin: 0, color: '#4a3b69', fontWeight: '600' }}>User & Roster Management</h3>
//         </div>

//         <div style={{ padding: '30px' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
//             <h2 style={{ color: '#2c3e50', margin: 0, fontSize: '24px' }}>Enterprise User Directory</h2>
//             <button 
//               onClick={() => setShowUploadModal(true)}
//               style={{ padding: '12px 24px', backgroundColor: '#84e8cd', color: '#2c3e50', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
//             >
//               + Bulk Roster Upload
//             </button>
//           </div>

//           {/* Role Switcher */}
//           <div style={{ display: 'inline-flex', backgroundColor: '#e9ecef', padding: '4px', borderRadius: '10px', marginBottom: '25px' }}>
//             <button 
//               onClick={() => setRoleTab('student')}
//               style={{ padding: '10px 25px', backgroundColor: roleTab === 'student' ? '#4a3b69' : 'transparent', color: roleTab === 'student' ? 'white' : '#495057', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
//             >
//               Student Roster
//             </button>
//             <button 
//               onClick={() => setRoleTab('professor')}
//               style={{ padding: '10px 25px', backgroundColor: roleTab === 'professor' ? '#4a3b69' : 'transparent', color: roleTab === 'professor' ? 'white' : '#495057', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
//             >
//               Faculty / Professor Roster
//             </button>
//           </div>

//           {/* Background Dashboard Cascading Filter Bar */}
//           {roleTab === 'student' && (
//             <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.03)' }}>
//               <input 
//                 type="text" 
//                 placeholder="Search name or email..." 
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '14px' }}
//               />
              
//               <select 
//                 value={selectedSchool} 
//                 onChange={(e) => {
//                   setSelectedSchool(e.target.value);
//                   setSelectedBranch('');
//                   setSelectedSemester('');
//                   setSelectedDivision('');
//                 }} 
//                 style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '14px', backgroundColor: '#fff' }}
//               >
//                 <option value="">1. Select School...</option>
//                 {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
//               </select>

//               <select 
//                 value={selectedBranch} 
//                 onChange={(e) => {
//                   setSelectedBranch(e.target.value);
//                   setSelectedSemester('');
//                   setSelectedDivision('');
//                 }} 
//                 disabled={!selectedSchool}
//                 style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '14px', backgroundColor: !selectedSchool ? '#f8f9fa' : '#fff' }}
//               >
//                 <option value="">2. Select Branch...</option>
//                 {availableBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
//               </select>

//               <select 
//                 value={selectedSemester} 
//                 onChange={(e) => {
//                   setSelectedSemester(e.target.value);
//                   setSelectedDivision('');
//                 }} 
//                 disabled={!selectedBranch}
//                 style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '14px', backgroundColor: !selectedBranch ? '#f8f9fa' : '#fff' }}
//               >
//                 <option value="">3. Select Semester...</option>
//                 {availableSemesters.map(s => <option key={s.semester_id} value={s.sem_no}>Semester {s.sem_no}</option>)}
//               </select>

//               <select 
//                 value={selectedDivision} 
//                 onChange={(e) => setSelectedDivision(e.target.value)} 
//                 disabled={!selectedSemester}
//                 style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '14px', backgroundColor: !selectedSemester ? '#f8f9fa' : '#fff' }}
//               >
//                 <option value="">4. Select Div...</option>
//                 {['A', 'B', 'C', 'D'].map(d => <option key={d} value={d}>Division {d}</option>)}
//               </select>
//             </div>
//           )}

//           {/* User Table */}
//           <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.03)' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
//               <thead>
//                 <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef', color: '#495057', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
//                   <th style={{ padding: '15px 20px' }}>ID</th>
//                   <th style={{ padding: '15px 20px' }}>Name</th>
//                   <th style={{ padding: '15px 20px' }}>Email</th>
//                   <th style={{ padding: '15px 20px' }}>Role</th>
//                   {roleTab === 'student' && (
//                     <>
//                       <th style={{ padding: '15px 20px' }}>Branch</th>
//                       <th style={{ padding: '15px 20px' }}>Sem</th>
//                       <th style={{ padding: '15px 20px' }}>Div</th>
//                     </>
//                   )}
//                   <th style={{ padding: '15px 20px', textAlign: 'center' }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {roleTab === 'student' && !selectedSchool ? (
//                   <tr>
//                     <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#6c757d', fontStyle: 'italic' }}>
//                       Please select a School and Branch from the filters above to load the student roster.
//                     </td>
//                   </tr>
//                 ) : users.length === 0 ? (
//                   <tr>
//                     <td colSpan={roleTab === 'student' ? 8 : 5} style={{ textAlign: 'center', padding: '40px', color: '#6c757d', fontStyle: 'italic' }}>
//                       No users found matching current criteria.
//                     </td>
//                   </tr>
//                 ) : (
//                   users.map(u => (
//                     <tr key={u.user_id} style={{ borderBottom: '1px solid #f1f3f5' }}>
//                       <td style={{ padding: '15px 20px', color: '#adb5bd' }}>#{u.user_id}</td>
//                       <td style={{ padding: '15px 20px', fontWeight: '500', color: '#212529' }}>{u.user_name}</td>
//                       <td style={{ padding: '15px 20px', color: '#6c757d' }}>{u.email}</td>
//                       <td style={{ padding: '15px 20px' }}>
//                         <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', backgroundColor: u.role_id === 1 ? '#e7f5ff' : '#ebfbee', color: u.role_id === 1 ? '#1971c2' : '#2b8a3e' }}>
//                           {u.role_name}
//                         </span>
//                       </td>
//                       {roleTab === 'student' && (
//                         <>
//                           <td style={{ padding: '15px 20px', color: '#495057' }}>{u.program_name || 'N/A'}</td>
//                           <td style={{ padding: '15px 20px', color: '#495057' }}>{u.sem_no ? `Sem ${u.sem_no}` : 'N/A'}</td>
//                           <td style={{ padding: '15px 20px', color: '#495057' }}>{u.division || 'N/A'}</td>
//                         </>
//                       )}
//                       <td style={{ padding: '15px 20px', textAlign: 'center' }}>
//                         <button 
//                           onClick={() => handleDeleteUser(u.user_id)}
//                           style={{ color: '#fa5252', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Hierarchical Bulk Upload Modal (Using Isolated target* states) */}
//           {showUploadModal && (
//             <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
//               <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '14px', width: '480px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
//                 <h3 style={{ marginTop: 0, color: '#4a3b69', fontSize: '20px' }}>Hierarchical Bulk Roster Upload</h3>
//                 <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>Follow the institutional hierarchy before uploading your spreadsheet (CSV/Excel).</p>
                
//                 <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  
//                   {/* 1. Target School */}
//                   <div>
//                     <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>1. Target School</label>
//                     <select 
//                       value={targetSchool} 
//                       onChange={(e) => {
//                         setTargetSchool(e.target.value);
//                         setTargetProgram('');
//                         setTargetSemester('');
//                       }} 
//                       style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ced4da', marginTop: '5px' }} 
//                       required
//                     >
//                       <option value="">Select School...</option>
//                       {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
//                     </select>
//                   </div>

//                   {/* 2. Target Branch / Program */}
//                   <div>
//                     <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>2. Target Branch / Program</label>
//                     <select 
//                       value={targetProgram} 
//                       onChange={(e) => {
//                         setTargetProgram(e.target.value);
//                         setTargetSemester('');
//                       }} 
//                       disabled={!targetSchool}
//                       style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ced4da', marginTop: '5px', backgroundColor: !targetSchool ? '#f8f9fa' : '#fff' }} 
//                       required
//                     >
//                       <option value="">Select Branch...</option>
//                       {modalAvailableBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
//                     </select>
//                   </div>

//                   {/* 3. Target Semester */}
//                   <div>
//                     <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>3. Target Semester</label>
//                     <select 
//                       value={targetSemester} 
//                       onChange={(e) => setTargetSemester(e.target.value)} 
//                       disabled={!targetProgram}
//                       style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ced4da', marginTop: '5px', backgroundColor: !targetProgram ? '#f8f9fa' : '#fff' }} 
//                       required
//                     >
//                       <option value="">Select Semester ID...</option>
//                       {modalAvailableSemesters.map(s => <option key={s.semester_id} value={s.semester_id}>Semester {s.sem_no}</option>)}
//                     </select>
//                   </div>

//                   {/* 4. Division & Batch */}
//                   <div style={{ display: 'flex', gap: '10px' }}>
//                     <div style={{ flex: 1 }}>
//                       <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>4. Division ID</label>
//                       <input type="number" placeholder="Div ID (e.g., 1)" value={targetDivision} onChange={(e) => setTargetDivision(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ced4da', marginTop: '5px' }} required />
//                     </div>
//                     <div style={{ flex: 1 }}>
//                       <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>5. Batch ID</label>
//                       <input type="number" placeholder="Batch ID (e.g., 1)" value={targetBatch} onChange={(e) => setTargetBatch(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ced4da', marginTop: '5px' }} required />
//                     </div>
//                   </div>

//                   {/* File Upload */}
//                   <div>
//                     <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>Spreadsheet File (CSV / Excel)</label>
//                     <input type="file" accept=".csv, .xlsx, .xls" onChange={(e) => setUploadFile(e.target.files[0])} style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px dashed #ced4da', borderRadius: '8px' }} required />
//                   </div>

//                   <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
//                     <button type="button" onClick={() => setShowUploadModal(false)} style={{ padding: '10px 20px', backgroundColor: '#e9ecef', color: '#495057', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
//                     <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#84e8cd', color: '#2c3e50', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Upload & Map Roster</button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/layout/AdminSidebar';
import { getAdminSchools, getAdminPrograms, getAdminProgramSemesters, getAdminMappings } from '../api/apiService';

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('students'); // 'students', 'professors', or 'upload'
  const [search, setSearch] = useState('');

  // Hierarchy filter states (Background Dashboard Filters)
  const [schools, setSchools] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [mappings, setMappings] = useState([]);

  // Student Filters
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');

  // Professor Filters
  const [selectedProfSchool, setSelectedProfSchool] = useState('');

  // Upload Tab State
  const [uploadFile, setUploadFile] = useState(null);
  const [targetSchool, setTargetSchool] = useState(''); 
  const [targetProgram, setTargetProgram] = useState(''); 
  const [targetSemester, setTargetSemester] = useState(''); 
  const [targetDivision, setTargetDivision] = useState('');
  const [targetBatch, setTargetBatch] = useState('');

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      // Fetch as soon as school, branch, and semester are chosen
      if (selectedSchool && selectedBranch && selectedSemester) {
        fetchUsers();
      } else {
        setUsers([]);
      }
    } else if (activeTab === 'professors') {
      fetchUsers();
    }
  }, [activeTab, selectedSchool, selectedBranch, selectedSemester, selectedDivision, selectedProfSchool, search]);

  const fetchFilterOptions = async () => {
    try {
      setSchools(await getAdminSchools() || []);
      setBranches(await getAdminPrograms() || []);
      setSemesters(await getAdminProgramSemesters() || []);
      setMappings(await getAdminMappings() || []);
    } catch (err) {
      console.error("Error loading filter data:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      let url = '';
      if (activeTab === 'students') {
        url = `http://localhost:5000/api/admin/users?search=${encodeURIComponent(search)}&school=${selectedSchool}&branch=${selectedBranch}&semester=${selectedSemester}&division=${selectedDivision}`;
      } else {
        url = `http://localhost:5000/api/admin/users?search=${encodeURIComponent(search)}&school=${selectedProfSchool || 'All'}`;
      }

      console.log("Firing API Request to URL:", url);

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      
      console.log("API Response Data Received:", data);

      if (response.ok) {
        const filtered = (data.users || []).filter(u => {
          if (activeTab === 'students') return u.role_id === 1;
          if (activeTab === 'professors') return u.role_id === 2;
          return true;
        });
        setUsers(filtered);
      } else {
        console.error("Server returned error status:", response.status);
      }
    } catch (err) {
      console.error("Network or parsing error fetching users:", err);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !targetProgram || !targetSemester || !targetDivision || !targetBatch) {
      alert("Please provide all target academic context fields and select a spreadsheet file.");
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('program_id', targetProgram);
    formData.append('semester_id', targetSemester);
    formData.append('division_id', targetDivision);
    formData.append('batch_id', targetBatch);

    try {
      const response = await fetch('http://localhost:5000/api/admin/users/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || "Roster successfully uploaded!");
        setUploadFile(null);
        setTargetSchool('');
        setTargetProgram('');
        setTargetSemester('');
        setTargetDivision('');
        setTargetBatch('');
        setActiveTab('students');
        fetchUsers();
      } else {
        alert(result.error || "Upload failed");
      }
    } catch (err) {
      alert("Error uploading file: " + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          fetchUsers();
        } else {
          alert("Failed to delete user.");
        }
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  // Dashboard filter cascading lists
  const availableBranches = branches.filter(b => b.school_id === parseInt(selectedSchool || 0));
  const availableSemesters = semesters.filter(s => s.program_id === parseInt(selectedBranch || 0));
  
  // Dynamic divisions mapped for the selected program and semester
  const availableDivisions = mappings.filter(m => 
    m.program_id === parseInt(selectedBranch || 0) && 
    m.semester_id === parseInt(selectedSemester || 0)
  );

  // Upload card cascading lists
  const modalAvailableBranches = branches.filter(b => b.school_id === parseInt(targetSchool || 0));
  const modalAvailableSemesters = semesters.filter(s => s.program_id === parseInt(targetProgram || 0));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9', overflow: 'hidden' }}>
      <AdminSidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <div style={{ height: '65px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '0 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: 0, color: '#4a3b69', fontWeight: '600' }}>User & Roster Directory</h3>
        </div>

        <div style={{ padding: '40px', maxWidth: '1280px', width: '100%', boxSizing: 'border-box' }}>
          
          <div style={{ marginBottom: '25px' }}>
            <h1 style={{ color: '#2c3e50', fontSize: '26px', margin: '0 0 8px 0' }}>Enterprise User Directory</h1>
            <p style={{ color: '#6c757d', fontSize: '14px', margin: 0 }}>Manage institutional accounts, sequential hierarchy filters, and hierarchical bulk spreadsheets.</p>
          </div>

          {/* Sub-Navigation Switcher Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
            
            <div 
              onClick={() => setActiveTab('students')}
              style={{
                backgroundColor: activeTab === 'students' ? '#4a3b69' : 'white',
                color: activeTab === 'students' ? 'white' : '#2c3e50',
                padding: '20px 25px',
                borderRadius: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                border: activeTab === 'students' ? 'none' : '1px solid #eaeaea',
                display: 'flex', alignItems: 'center', gap: '15px', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '24px' }}>🎓</div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Student Directory</h4>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>View and manage student cohorts</p>
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('professors')}
              style={{
                backgroundColor: activeTab === 'professors' ? '#4a3b69' : 'white',
                color: activeTab === 'professors' ? 'white' : '#2c3e50',
                padding: '20px 25px',
                borderRadius: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                border: activeTab === 'professors' ? 'none' : '1px solid #eaeaea',
                display: 'flex', alignItems: 'center', gap: '15px', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '24px' }}>👨‍🏫</div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Faculty Directory</h4>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Manage professor accounts & departments</p>
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('upload')}
              style={{
                backgroundColor: activeTab === 'upload' ? '#4a3b69' : 'white',
                color: activeTab === 'upload' ? 'white' : '#2c3e50',
                padding: '20px 25px',
                borderRadius: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                border: activeTab === 'upload' ? 'none' : '1px solid #eaeaea',
                display: 'flex', alignItems: 'center', gap: '15px', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '24px' }}>📁</div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Bulk CSV Upload</h4>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Import batch rosters via spreadsheets</p>
              </div>
            </div>

          </div>

          {/* --- MAIN CONTENT CONTAINER --- */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #eaeaea' }}>
            
            {activeTab !== 'upload' ? (
              <div>
                {/* Student Cascading Filter Bar */}
                {activeTab === 'students' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                    <input 
                      type="text" 
                      placeholder="Search name or email..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '14px' }}
                    />
                    
                    <select 
                      value={selectedSchool} 
                      onChange={(e) => {
                        setSelectedSchool(e.target.value);
                        setSelectedBranch('');
                        setSelectedSemester('');
                        setSelectedDivision('');
                      }} 
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '14px', backgroundColor: '#fff' }}
                    >
                      <option value="">1. Select School...</option>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>

                    <select 
                      value={selectedBranch} 
                      onChange={(e) => {
                        setSelectedBranch(e.target.value);
                        setSelectedSemester('');
                        setSelectedDivision('');
                      }} 
                      disabled={!selectedSchool}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '14px', backgroundColor: !selectedSchool ? '#f8f9fa' : '#fff' }}
                    >
                      <option value="">2. Select Branch...</option>
                      {availableBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>

                    <select 
                      value={selectedSemester} 
                      onChange={(e) => {
                        setSelectedSemester(e.target.value);
                        setSelectedDivision('');
                      }} 
                      disabled={!selectedBranch}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '14px', backgroundColor: !selectedBranch ? '#f8f9fa' : '#fff' }}
                    >
                      <option value="">3. Select Semester...</option>
                      {availableSemesters.map(s => <option key={s.semester_id} value={s.sem_no}>Semester {s.sem_no}</option>)}
                    </select>

                    {/* Dynamic Division Dropdown populated from database mappings */}
                    <select 
                      value={selectedDivision} 
                      onChange={(e) => setSelectedDivision(e.target.value)} 
                      disabled={!selectedSemester}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '14px', backgroundColor: !selectedSemester ? '#f8f9fa' : '#fff' }}
                    >
                      <option value="">4. Select Div (Optional)...</option>
                      {availableDivisions.map(d => (
                        <option key={d.division_id || d.division} value={d.division}>
                          Division {d.division}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Professor Filter Bar */}
                {activeTab === 'professors' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '25px' }}>
                    <input 
                      type="text" 
                      placeholder="Search faculty by name or email..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '14px' }}
                    />
                    <select 
                      value={selectedProfSchool} 
                      onChange={(e) => setSelectedProfSchool(e.target.value)} 
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '14px', backgroundColor: '#fff' }}
                    >
                      <option value="">Filter by School (All)...</option>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}

                {/* User Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef', color: '#495057', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '15px 20px' }}>ID</th>
                        <th style={{ padding: '15px 20px' }}>Name</th>
                        <th style={{ padding: '15px 20px' }}>Email</th>
                        <th style={{ padding: '15px 20px' }}>Role</th>
                        {activeTab === 'students' && (
                          <>
                            <th style={{ padding: '15px 20px' }}>Branch</th>
                            <th style={{ padding: '15px 20px' }}>Sem</th>
                            <th style={{ padding: '15px 20px' }}>Div</th>
                          </>
                        )}
                        <th style={{ padding: '15px 20px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTab === 'students' && (!selectedSchool || !selectedBranch || !selectedSemester) ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#6c757d', fontStyle: 'italic' }}>
                            Please select School, Branch, and Semester above to load the student roster.
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={activeTab === 'students' ? 8 : 5} style={{ textAlign: 'center', padding: '40px', color: '#6c757d', fontStyle: 'italic' }}>
                            No users found matching current criteria.
                          </td>
                        </tr>
                      ) : (
                        users.map(u => (
                          <tr key={u.user_id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                            <td style={{ padding: '15px 20px', color: '#adb5bd' }}>#{u.user_id}</td>
                            <td style={{ padding: '15px 20px', fontWeight: '500', color: '#212529' }}>{u.user_name}</td>
                            <td style={{ padding: '15px 20px', color: '#6c757d' }}>{u.email}</td>
                            <td style={{ padding: '15px 20px' }}>
                              <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', backgroundColor: u.role_id === 1 ? '#e7f5ff' : '#ebfbee', color: u.role_id === 1 ? '#1971c2' : '#2b8a3e' }}>
                                {u.role_name}
                              </span>
                            </td>
                            {activeTab === 'students' && (
                              <>
                                <td style={{ padding: '15px 20px', color: '#495057' }}>{u.program_name || 'N/A'}</td>
                                <td style={{ padding: '15px 20px', color: '#495057' }}>{u.sem_no ? `Sem ${u.sem_no}` : 'N/A'}</td>
                                <td style={{ padding: '15px 20px', color: '#495057' }}>{u.division || 'N/A'}</td>
                              </>
                            )}
                            <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                              <button 
                                onClick={() => handleDeleteUser(u.user_id)}
                                style={{ color: '#fa5252', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* --- HIERARCHICAL BULK UPLOAD TAB CONTENT --- */
              <div style={{ maxWidth: '600px', margin: '0 auto', padding: '10px 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📤</div>
                  <h3 style={{ marginTop: 0, color: '#4a3b69', fontSize: '20px' }}>Hierarchical Bulk Roster Upload</h3>
                  <p style={{ fontSize: '13px', color: '#666' }}>Follow the institutional hierarchy before uploading your spreadsheet (CSV/Excel).</p>
                </div>
                
                <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  
                  {/* 1. Target School */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>1. Target School</label>
                    <select 
                      value={targetSchool} 
                      onChange={(e) => {
                        setTargetSchool(e.target.value);
                        setTargetProgram('');
                        setTargetSemester('');
                      }} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', marginTop: '5px', backgroundColor: '#fff', boxSizing: 'border-box' }} 
                      required
                    >
                      <option value="">Select School...</option>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  {/* 2. Target Branch / Program */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>2. Target Branch / Program</label>
                    <select 
                      value={targetProgram} 
                      onChange={(e) => {
                        setTargetProgram(e.target.value);
                        setTargetSemester('');
                      }} 
                      disabled={!targetSchool}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', marginTop: '5px', backgroundColor: !targetSchool ? '#f8f9fa' : '#fff', boxSizing: 'border-box' }} 
                      required
                    >
                      <option value="">Select Branch...</option>
                      {modalAvailableBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>

                  {/* 3. Target Semester */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>3. Target Semester</label>
                    <select 
                      value={targetSemester} 
                      onChange={(e) => setTargetSemester(e.target.value)} 
                      disabled={!targetProgram}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', marginTop: '5px', backgroundColor: !targetProgram ? '#f8f9fa' : '#fff', boxSizing: 'border-box' }} 
                      required
                    >
                      <option value="">Select Semester ID...</option>
                      {modalAvailableSemesters.map(s => <option key={s.semester_id} value={s.semester_id}>Semester {s.sem_no}</option>)}
                    </select>
                  </div>

                  {/* 4. Division & Batch */}
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>4. Division ID</label>
                      <input type="number" placeholder="Div ID (e.g., 1)" value={targetDivision} onChange={(e) => setTargetDivision(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', marginTop: '5px', boxSizing: 'border-box' }} required />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>5. Batch ID</label>
                      <input type="number" placeholder="Batch ID (e.g., 1)" value={targetBatch} onChange={(e) => setTargetBatch(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', marginTop: '5px', boxSizing: 'border-box' }} required />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>Spreadsheet File (CSV / Excel)</label>
                    <input type="file" accept=".csv, .xlsx, .xls" onChange={(e) => setUploadFile(e.target.files[0])} style={{ width: '100%', padding: '12px', marginTop: '5px', border: '1px dashed #ced4da', borderRadius: '8px', boxSizing: 'border-box', backgroundColor: '#fcfcfc' }} required />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                    <button type="button" onClick={() => setActiveTab('students')} style={{ padding: '12px 20px', backgroundColor: '#e9ecef', color: '#495057', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                    <button type="submit" style={{ padding: '12px 25px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Upload & Map Roster</button>
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}