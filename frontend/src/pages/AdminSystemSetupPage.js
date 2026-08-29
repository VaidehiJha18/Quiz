// import React, { useState, useEffect } from 'react';
// import AdminSidebar from '../components/layout/AdminSidebar';
// import { 
//   getAdminSchools, addAdminSchool, deleteAdminSchool,
//   getAdminPrograms, addAdminProgram, deleteAdminProgram,
//   getAdminProgramSemesters, addAdminProgramSemester, deleteAdminProgramSemester,
//   getAdminMappings, addAdminMapping, deleteAdminMapping,
//   getAdminCourses, addAdminCourse, getAdminSemesterCourses, linkAdminSemesterCourse, unlinkAdminSemesterCourse
// } from '../api/apiService';

// const AdminSystemSetupPage = () => {
//   // --- STATE FOR SCHOOLS ---
//   const [schools, setSchools] = useState([]);
//   const [newSchoolName, setNewSchoolName] = useState('');

//   // --- STATE FOR BRANCHES ---
//   const [branches, setBranches] = useState([]);
//   const [selectedSchoolId, setSelectedSchoolId] = useState('');
//   const [newBranchName, setNewBranchName] = useState('');

//   // --- STATE FOR SEMESTERS ---
//   const [programSemesters, setProgramSemesters] = useState([]);
//   const [selectedProgramIdForSem, setSelectedProgramIdForSem] = useState('');
//   const [newSemNo, setNewSemNo] = useState('');

//   // --- STATE FOR MAPPINGS (DIVISIONS/BATCHES) ---
//   const [mappings, setMappings] = useState([]);
//   const [selectedProgramForMap, setSelectedProgramForMap] = useState('');
//   const [selectedSemesterForMap, setSelectedSemesterForMap] = useState('');
//   const [newDivision, setNewDivision] = useState('');
//   const [newBatch, setNewBatch] = useState('');

//   // --- STATE FOR COURSES ---
//   const [courses, setCourses] = useState([]);
//   const [semesterCourses, setSemesterCourses] = useState([]);
//   const [newCourseName, setNewCourseName] = useState('');
//   const [newShortCourseName, setNewShortCourseName] = useState('');
//   const [selectedCourseToLink, setSelectedCourseToLink] = useState('');

//   // 1. Fetch All Data on Load
//   useEffect(() => {
//     fetchSchools();
//     fetchBranches();
//     fetchProgramSemesters();
//     fetchMappings();
//     fetchCourses();
//     fetchSemesterCourses();
//   }, []);

//   // ==========================================
//   // --- SCHOOL FUNCTIONS ---
//   // ==========================================
//   const fetchSchools = async () => {
//     try {
//       const data = await getAdminSchools();
//       setSchools(data);
//     } catch (error) {
//       console.error("Error fetching schools:", error);
//     }
//   };

//   const handleAddSchool = async () => {
//     if (newSchoolName.trim() === '') return;
//     try {
//       await addAdminSchool({ name: newSchoolName });
//       setNewSchoolName(''); 
//       fetchSchools(); 
//     } catch (error) {
//       alert("Error adding school.");
//     }
//   };

//   const handleDeleteSchool = async (id) => {
//     if (window.confirm("Are you sure you want to delete this school?")) {
//       try {
//         await deleteAdminSchool(id);
//         fetchSchools(); 
//       } catch (error) {
//         alert(error.message);
//       }
//     }
//   };

//   // ==========================================
//   // --- BRANCH FUNCTIONS ---
//   // ==========================================
//   const fetchBranches = async () => {
//     try {
//       const data = await getAdminPrograms();
//       setBranches(data);
//     } catch (error) {
//       console.error("Error fetching branches:", error);
//     }
//   };

//   const handleAddBranch = async () => {
//     if (newBranchName.trim() === '' || selectedSchoolId === '') {
//       alert("Please select a parent school and enter a branch name.");
//       return;
//     }
//     try {
//       await addAdminProgram({ name: newBranchName, school_id: selectedSchoolId });
//       setNewBranchName('');
//       fetchBranches();
//     } catch (error) {
//       alert("Error adding branch.");
//     }
//   };

//   const handleDeleteBranch = async (id) => {
//     if (window.confirm("Are you sure you want to delete this branch?")) {
//       try {
//         await deleteAdminProgram(id);
//         fetchBranches();
//       } catch (error) {
//         alert(error.message);
//       }
//     }
//   };

//   // ==========================================
//   // --- SEMESTER FUNCTIONS ---
//   // ==========================================
//   const fetchProgramSemesters = async () => {
//     try {
//       const data = await getAdminProgramSemesters();
//       setProgramSemesters(data);
//     } catch (error) {
//       console.error("Error fetching semesters:", error);
//     }
//   };

//   const handleAddSemester = async () => {
//     if (newSemNo.trim() === '' || selectedProgramIdForSem === '') {
//       alert("Please select a program and enter a semester number.");
//       return;
//     }
//     try {
//       await addAdminProgramSemester(selectedProgramIdForSem, newSemNo);
//       setNewSemNo('');
//       fetchProgramSemesters();
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   const handleDeleteSemester = async (programId, semesterId) => {
//     if (window.confirm("Are you sure you want to unlink this semester?")) {
//       try {
//         await deleteAdminProgramSemester(programId, semesterId);
//         fetchProgramSemesters();
//       } catch (error) {
//         alert(error.message);
//       }
//     }
//   };

//   // ==========================================
//   // --- MAPPING (DIV & BATCH) FUNCTIONS ---
//   // ==========================================
//   const fetchMappings = async () => {
//     try {
//       const data = await getAdminMappings();
//       setMappings(data);
//     } catch (error) {
//       console.error("Error fetching mappings:", error);
//     }
//   };

//   const handleAddMapping = async () => {
//     if (!selectedProgramForMap || !selectedSemesterForMap || !newDivision.trim() || !newBatch.trim()) {
//       alert("Please fill out all fields.");
//       return;
//     }
//     try {
//       await addAdminMapping({
//         program_id: selectedProgramForMap,
//         semester_id: selectedSemesterForMap,
//         division: newDivision.trim().toUpperCase(), 
//         batch_no: newBatch.trim()
//       });
//       setNewDivision('');
//       setNewBatch('');
//       fetchMappings();
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   const handleDeleteMapping = async (p_id, s_id, d_id, b_id) => {
//     if (window.confirm("Are you sure you want to unlink this cohort?")) {
//       try {
//         await deleteAdminMapping(p_id, s_id, d_id, b_id);
//         fetchMappings();
//       } catch (error) {
//         alert(error.message);
//       }
//     }
//   };

//   // ==========================================
//   // --- COURSE FUNCTIONS ---
//   // ==========================================
//   const fetchCourses = async () => {
//     try {
//       const data = await getAdminCourses();
//       setCourses(data);
//     } catch (error) {
//       console.error("Error fetching courses:", error);
//     }
//   };

//   const fetchSemesterCourses = async () => {
//     try {
//       const data = await getAdminSemesterCourses();
//       setSemesterCourses(data);
//     } catch (error) {
//       console.error("Error fetching semester courses:", error);
//     }
//   };

//   const handleAddCourse = async (e) => {
//     e.preventDefault();
//     if (!newCourseName.trim()) {
//       alert("Course name is required.");
//       return;
//     }
//     try {
//       await addAdminCourse({ course_name: newCourseName, short_course_name: newShortCourseName });
//       setNewCourseName('');
//       setNewShortCourseName('');
//       fetchCourses();
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   const handleLinkCourse = async () => {
//     if (!selectedSemesterForMap || !selectedCourseToLink) {
//       alert("Please select a semester and a course to link.");
//       return;
//     }
//     try {
//       await linkAdminSemesterCourse(selectedSemesterForMap, selectedCourseToLink);
//       setSelectedCourseToLink('');
//       fetchSemesterCourses();
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   const handleUnlinkCourse = async (semId, crsId) => {
//     if (window.confirm("Are you sure you want to unlink this course?")) {
//       try {
//         await unlinkAdminSemesterCourse(semId, crsId);
//         fetchSemesterCourses();
//       } catch (error) {
//         alert(error.message);
//       }
//     }
//   };

//   // --- FILTER LOGIC ---
//   const displayedBranches = selectedSchoolId 
//     ? branches.filter(branch => branch.school_id === parseInt(selectedSchoolId))
//     : [];

//   const displayedSemesters = selectedProgramIdForSem 
//     ? programSemesters.filter(sem => sem.program_id === parseInt(selectedProgramIdForSem))
//     : [];

//   const availableSemestersForMap = programSemesters.filter(sem => sem.program_id === parseInt(selectedProgramForMap));
  
//   const displayedMappings = mappings.filter(map => 
//     map.program_id === parseInt(selectedProgramForMap) && 
//     map.semester_id === parseInt(selectedSemesterForMap)
//   );

//   const displayedSemesterCourses = selectedSemesterForMap
//     ? semesterCourses.filter(sc => sc.semester_id === parseInt(selectedSemesterForMap))
//     : [];

//   return (
//     <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
//       <AdminSidebar />
      
//       <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//         <div style={{ height: '60px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '0 30px' }}>
//           <h3 style={{ margin: 0, color: '#4a3b69' }}>System Setup & Hierarchy</h3>
//         </div>

//         <div style={{ padding: '40px', maxWidth: '1200px' }}>
//           <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>University Configuration</h1>
//           <p style={{ color: '#6c757d', marginBottom: '40px' }}>Manage academic structure, semesters, cohorts, and course catalogs.</p>
          
//           {/* 2x2 Grid Container */}
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
//             {/* --- PANEL 1: SCHOOLS --- */}
//             <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//               <h3 style={{ color: '#4a3b69', marginTop: 0, borderBottom: '2px solid #f4f6f9', paddingBottom: '10px' }}>Manage Schools</h3>
              
//               <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
//                 <input 
//                   type="text" 
//                   placeholder="New School Name (e.g., School of Arts)" 
//                   value={newSchoolName}
//                   onChange={(e) => setNewSchoolName(e.target.value)}
//                   style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
//                 />
//                 <button 
//                   onClick={handleAddSchool}
//                   style={{ padding: '10px 20px', backgroundColor: '#84e8cd', color: '#2c3e50', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
//                 >
//                   + Add
//                 </button>
//               </div>

//               <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' }}>
//                 {schools.map(school => (
//                   <li key={school.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', backgroundColor: '#f8f9fa', marginBottom: '8px', borderRadius: '6px', border: '1px solid #eee' }}>
//                     <span style={{ fontWeight: '500', color: '#333' }}>{school.name}</span>
//                     <button 
//                       onClick={() => handleDeleteSchool(school.id)}
//                       style={{ color: '#d9534f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
//                     >
//                       Delete
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* --- PANEL 2: BRANCHES / PROGRAMS --- */}
//             <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//               <h3 style={{ color: '#4a3b69', marginTop: 0, borderBottom: '2px solid #f4f6f9', paddingBottom: '10px' }}>Manage Branches (Programs)</h3>
              
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
//                 <select 
//                   value={selectedSchoolId}
//                   onChange={(e) => setSelectedSchoolId(e.target.value)}
//                   style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
//                 >
//                   <option value="">Select Parent School...</option>
//                   {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
//                 </select>
                
//                 <div style={{ display: 'flex', gap: '10px' }}>
//                   <input 
//                     type="text" 
//                     placeholder="New Branch (e.g., B.Tech Civil)" 
//                     value={newBranchName}
//                     onChange={(e) => setNewBranchName(e.target.value)}
//                     style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
//                   />
//                   <button 
//                     onClick={handleAddBranch}
//                     style={{ padding: '10px 20px', backgroundColor: '#84e8cd', color: '#2c3e50', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
//                   >
//                     + Add
//                   </button>
//                 </div>
//               </div>

//               <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' }}>
//                 {selectedSchoolId === '' ? (
//                   <li style={{ color: '#999', fontStyle: 'italic', padding: '10px' }}>Select a school to view its branches.</li>
//                 ) : displayedBranches.length === 0 ? (
//                   <li style={{ color: '#999', fontStyle: 'italic', padding: '10px' }}>No branches found for this school.</li>
//                 ) : (
//                   displayedBranches.map(branch => (
//                     <li key={branch.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', backgroundColor: '#f8f9fa', marginBottom: '8px', borderRadius: '6px', border: '1px solid #eee' }}>
//                       <span style={{ fontWeight: '500', color: '#333' }}>{branch.name}</span>
//                       <button 
//                         onClick={() => handleDeleteBranch(branch.id)}
//                         style={{ color: '#d9534f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
//                       >
//                         Delete
//                       </button>
//                     </li>
//                   ))
//                 )}
//               </ul>
//             </div>

//             {/* --- PANEL 3: SEMESTERS --- */}
//             <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//               <h3 style={{ color: '#4a3b69', marginTop: 0, borderBottom: '2px solid #f4f6f9', paddingBottom: '10px' }}>Manage Semesters</h3>
              
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
//                 <select 
//                   value={selectedProgramIdForSem}
//                   onChange={(e) => setSelectedProgramIdForSem(e.target.value)}
//                   style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
//                 >
//                   <option value="">Select Parent Branch...</option>
//                   {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
//                 </select>
                
//                 <div style={{ display: 'flex', gap: '10px' }}>
//                   <input 
//                     type="number" 
//                     placeholder="Sem Number (e.g., 1)" 
//                     value={newSemNo}
//                     onChange={(e) => setNewSemNo(e.target.value)}
//                     min="1"
//                     style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
//                   />
//                   <button 
//                     onClick={handleAddSemester}
//                     style={{ padding: '10px 20px', backgroundColor: '#84e8cd', color: '#2c3e50', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
//                   >
//                     + Add
//                   </button>
//                 </div>
//               </div>

//               <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' }}>
//                 {selectedProgramIdForSem === '' ? (
//                   <li style={{ color: '#999', fontStyle: 'italic', padding: '10px' }}>Select a branch to view its semesters.</li>
//                 ) : displayedSemesters.length === 0 ? (
//                   <li style={{ color: '#999', fontStyle: 'italic', padding: '10px' }}>No semesters mapped yet.</li>
//                 ) : (
//                   displayedSemesters.map(sem => (
//                     <li key={`${sem.program_id}-${sem.semester_id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', backgroundColor: '#f8f9fa', marginBottom: '8px', borderRadius: '6px', border: '1px solid #eee' }}>
//                       <span style={{ fontWeight: '500', color: '#333' }}>Semester {sem.sem_no}</span>
//                       <button 
//                         onClick={() => handleDeleteSemester(sem.program_id, sem.semester_id)}
//                         style={{ color: '#d9534f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
//                       >
//                         Unlink
//                       </button>
//                     </li>
//                   ))
//                 )}
//               </ul>
//             </div>

//             {/* --- PANEL 4: DIVISIONS & BATCHES --- */}
//             <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//               <h3 style={{ color: '#4a3b69', marginTop: 0, borderBottom: '2px solid #f4f6f9', paddingBottom: '10px' }}>Manage Cohorts (Div & Batch)</h3>
              
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
//                 <select 
//                   value={selectedProgramForMap}
//                   onChange={(e) => {
//                     setSelectedProgramForMap(e.target.value);
//                     setSelectedSemesterForMap(''); 
//                   }}
//                   style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
//                 >
//                   <option value="">1. Select Branch...</option>
//                   {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
//                 </select>

//                 <select 
//                   value={selectedSemesterForMap}
//                   onChange={(e) => setSelectedSemesterForMap(e.target.value)}
//                   style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
//                   disabled={!selectedProgramForMap}
//                 >
//                   <option value="">2. Select Semester...</option>
//                   {availableSemestersForMap.map(sem => 
//                     <option key={sem.semester_id} value={sem.semester_id}>Semester {sem.sem_no}</option>
//                   )}
//                 </select>
                
//                 <div style={{ display: 'flex', gap: '10px' }}>
//                   <input 
//                     type="text" 
//                     placeholder="Div (e.g., A)" 
//                     value={newDivision}
//                     onChange={(e) => setNewDivision(e.target.value)}
//                     style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
//                   />
//                   <input 
//                     type="number" 
//                     placeholder="Batch (e.g., 1)" 
//                     value={newBatch}
//                     onChange={(e) => setNewBatch(e.target.value)}
//                     min="1"
//                     style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
//                   />
//                   <button 
//                     onClick={handleAddMapping}
//                     style={{ padding: '10px 20px', backgroundColor: '#84e8cd', color: '#2c3e50', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
//                   >
//                     + Add
//                   </button>
//                 </div>
//               </div>

//               <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' }}>
//                 {!selectedProgramForMap || !selectedSemesterForMap ? (
//                   <li style={{ color: '#999', fontStyle: 'italic', padding: '10px' }}>Select Branch & Semester to view cohorts.</li>
//                 ) : displayedMappings.length === 0 ? (
//                   <li style={{ color: '#999', fontStyle: 'italic', padding: '10px' }}>No cohorts mapped for this semester.</li>
//                 ) : (
//                   displayedMappings.map(map => (
//                     <li key={`${map.program_id}-${map.semester_id}-${map.division_id}-${map.batch_id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', backgroundColor: '#f8f9fa', marginBottom: '8px', borderRadius: '6px', border: '1px solid #eee' }}>
//                       <span style={{ fontWeight: '500', color: '#333' }}>
//                         Div: {map.division} | Batch: {map.batch_no}
//                       </span>
//                       <button 
//                         onClick={() => handleDeleteMapping(map.program_id, map.semester_id, map.division_id, map.batch_id)}
//                         style={{ color: '#d9534f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
//                       >
//                         Unlink
//                       </button>
//                     </li>
//                   ))
//                 )}
//               </ul>
//             </div>

//           </div>

//           {/* --- PANEL 5: COURSE CATALOG & SEMESTER CURRICULUM --- */}
//           <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//             <h3 style={{ color: '#4a3b69', marginTop: 0, borderBottom: '2px solid #f4f6f9', paddingBottom: '10px' }}>Manage Course Catalog & Semester Curriculum</h3>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              
//               <div>
//                 <h4 style={{ color: '#333' }}>1. Add New Master Course</h4>
//                 <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//                   <input type="text" placeholder="Course Name (e.g., Computer Programming)" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
//                   <input type="text" placeholder="Short Code (e.g., CP)" value={newShortCourseName} onChange={(e) => setNewShortCourseName(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
//                   <button type="submit" style={{ padding: '10px', backgroundColor: '#84e8cd', color: '#2c3e50', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ Create Course</button>
//                 </form>
//                 <h5 style={{ color: '#555', marginTop: '20px' }}>Existing Global Courses:</h5>
//                 <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '6px', padding: '10px' }}>
//                   {courses.map(c => (
//                     <div key={c.id} style={{ fontSize: '13px', padding: '4px 0', borderBottom: '1px solid #f4f6f9' }}>
//                       <strong>{c.short_course_name || 'N/A'}:</strong> {c.course_name}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h4 style={{ color: '#333' }}>2. Assign Course to Semester Curriculum</h4>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
//                   <select value={selectedProgramForMap} onChange={(e) => setSelectedProgramForMap(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
//                     <option value="">Select Branch...</option>
//                     {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
//                   </select>
//                   <select value={selectedSemesterForMap} onChange={(e) => setSelectedSemesterForMap(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} disabled={!selectedProgramForMap}>
//                     <option value="">Select Semester...</option>
//                     {programSemesters.filter(sem => sem.program_id === parseInt(selectedProgramForMap)).map(sem => <option key={sem.semester_id} value={sem.semester_id}>Semester {sem.sem_no}</option>)}
//                   </select>
//                   <div style={{ display: 'flex', gap: '10px' }}>
//                     <select value={selectedCourseToLink} onChange={(e) => setSelectedCourseToLink(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} disabled={!selectedSemesterForMap}>
//                       <option value="">Select Course...</option>
//                       {courses.map(c => <option key={c.id} value={c.id}>{c.course_name} ({c.short_course_name})</option>)}
//                     </select>
//                     <button onClick={handleLinkCourse} style={{ padding: '10px 20px', backgroundColor: '#84e8cd', color: '#2c3e50', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Link</button>
//                   </div>
//                 </div>
//                 <h5 style={{ color: '#555' }}>Curriculum for Selected Semester:</h5>
//                 <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '150px', overflowY: 'auto' }}>
//                   {!selectedSemesterForMap ? (
//                     <li style={{ color: '#999', fontStyle: 'italic', fontSize: '13px' }}>Select a branch and semester to view linked subjects.</li>
//                   ) : displayedSemesterCourses.length === 0 ? (
//                     <li style={{ color: '#999', fontStyle: 'italic', fontSize: '13px' }}>No courses mapped to this semester yet.</li>
//                   ) : (
//                     displayedSemesterCourses.map(sc => (
//                       <li key={sc.course_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8f9fa', marginBottom: '5px', borderRadius: '6px', border: '1px solid #eee', fontSize: '13px' }}>
//                         <span>{sc.course_name} ({sc.short_course_name})</span>
//                         <button onClick={() => handleUnlinkCourse(sc.semester_id, sc.course_id)} style={{ color: '#d9534f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Unlink</button>
//                       </li>
//                     ))
//                   )}
//                 </ul>
//               </div>

//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminSystemSetupPage;

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/layout/AdminSidebar';
import { 
  getAdminSchools, addAdminSchool, deleteAdminSchool,
  getAdminPrograms, addAdminProgram, deleteAdminProgram,
  getAdminProgramSemesters, addAdminProgramSemester, deleteAdminProgramSemester,
  getAdminMappings, addAdminMapping, deleteAdminMapping,
  getAdminCourses, addAdminCourse, getAdminSemesterCourses, linkAdminSemesterCourse, unlinkAdminSemesterCourse
} from '../api/apiService';

const AdminSystemSetupPage = () => {
  // --- STATE FOR SCHOOLS ---
  const [schools, setSchools] = useState([]);
  const [newSchoolName, setNewSchoolName] = useState('');

  // --- STATE FOR BRANCHES ---
  const [branches, setBranches] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [newBranchName, setNewBranchName] = useState('');

  // --- STATE FOR SEMESTERS ---
  const [programSemesters, setProgramSemesters] = useState([]);
  const [selectedProgramIdForSem, setSelectedProgramIdForSem] = useState('');
  const [newSemNo, setNewSemNo] = useState('');

  // --- STATE FOR MAPPINGS (DIVISIONS/BATCHES) ---
  const [mappings, setMappings] = useState([]);
  const [selectedProgramForMap, setSelectedProgramForMap] = useState('');
  const [selectedSemesterForMap, setSelectedSemesterForMap] = useState('');
  const [newDivision, setNewDivision] = useState('');
  const [newBatch, setNewBatch] = useState('');

  // --- STATE FOR COURSES ---
  const [courses, setCourses] = useState([]);
  const [semesterCourses, setSemesterCourses] = useState([]);
  const [newCourseName, setNewCourseName] = useState('');
  const [newShortCourseName, setNewShortCourseName] = useState('');
  const [selectedCourseToLink, setSelectedCourseToLink] = useState('');

  // --- ACTIVE TAB STATE FOR PROFESSIONAL SUB-HUB VIEW ---
  const [activeTab, setActiveTab] = useState('infrastructure'); // 'infrastructure' | 'timeline' | 'curriculum'

  // 1. Fetch All Data on Load
  useEffect(() => {
    fetchSchools();
    fetchBranches();
    fetchProgramSemesters();
    fetchMappings();
    fetchCourses();
    fetchSemesterCourses();
  }, []);

  // ==========================================
  // --- SCHOOL FUNCTIONS ---
  // ==========================================
  const fetchSchools = async () => {
    try {
      const data = await getAdminSchools();
      setSchools(data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const handleAddSchool = async () => {
    if (newSchoolName.trim() === '') return;
    try {
      await addAdminSchool({ name: newSchoolName });
      setNewSchoolName(''); 
      fetchSchools(); 
    } catch (error) {
      alert("Error adding school.");
    }
  };

  const handleDeleteSchool = async (id) => {
    if (window.confirm("Are you sure you want to delete this school?")) {
      try {
        await deleteAdminSchool(id);
        fetchSchools(); 
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // ==========================================
  // --- BRANCH FUNCTIONS ---
  // ==========================================
  const fetchBranches = async () => {
    try {
      const data = await getAdminPrograms();
      setBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const handleAddBranch = async () => {
    if (newBranchName.trim() === '' || selectedSchoolId === '') {
      alert("Please select a parent school and enter a branch name.");
      return;
    }
    try {
      await addAdminProgram({ name: newBranchName, school_id: selectedSchoolId });
      setNewBranchName('');
      fetchBranches();
    } catch (error) {
      alert("Error adding branch.");
    }
  };

  const handleDeleteBranch = async (id) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        await deleteAdminProgram(id);
        fetchBranches();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // ==========================================
  // --- SEMESTER FUNCTIONS ---
  // ==========================================
  const fetchProgramSemesters = async () => {
    try {
      const data = await getAdminProgramSemesters();
      setProgramSemesters(data);
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  };

  const handleAddSemester = async () => {
    if (newSemNo.trim() === '' || selectedProgramIdForSem === '') {
      alert("Please select a program and enter a semester number.");
      return;
    }
    try {
      await addAdminProgramSemester(selectedProgramIdForSem, newSemNo);
      setNewSemNo('');
      fetchProgramSemesters();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteSemester = async (programId, semesterId) => {
    if (window.confirm("Are you sure you want to unlink this semester?")) {
      try {
        await deleteAdminProgramSemester(programId, semesterId);
        fetchProgramSemesters();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // ==========================================
  // --- MAPPING (DIV & BATCH) FUNCTIONS ---
  // ==========================================
  const fetchMappings = async () => {
    try {
      const data = await getAdminMappings();
      setMappings(data);
    } catch (error) {
      console.error("Error fetching mappings:", error);
    }
  };

  const handleAddMapping = async () => {
    if (!selectedProgramForMap || !selectedSemesterForMap || !newDivision.trim() || !newBatch.trim()) {
      alert("Please fill out all fields.");
      return;
    }
    try {
      await addAdminMapping({
        program_id: selectedProgramForMap,
        semester_id: selectedSemesterForMap,
        division: newDivision.trim().toUpperCase(), 
        batch_no: newBatch.trim()
      });
      setNewDivision('');
      setNewBatch('');
      fetchMappings();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteMapping = async (p_id, s_id, d_id, b_id) => {
    if (window.confirm("Are you sure you want to unlink this cohort?")) {
      try {
        await deleteAdminMapping(p_id, s_id, d_id, b_id);
        fetchMappings();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // ==========================================
  // --- COURSE FUNCTIONS ---
  // ==========================================
  const fetchCourses = async () => {
    try {
      const data = await getAdminCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchSemesterCourses = async () => {
    try {
      const data = await getAdminSemesterCourses();
      setSemesterCourses(data);
    } catch (error) {
      console.error("Error fetching semester courses:", error);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourseName.trim()) {
      alert("Course name is required.");
      return;
    }
    try {
      await addAdminCourse({ course_name: newCourseName, short_course_name: newShortCourseName });
      setNewCourseName('');
      setNewShortCourseName('');
      fetchCourses();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLinkCourse = async () => {
    if (!selectedSemesterForMap || !selectedCourseToLink) {
      alert("Please select a semester and a course to link.");
      return;
    }
    try {
      await linkAdminSemesterCourse(selectedSemesterForMap, selectedCourseToLink);
      setSelectedCourseToLink('');
      fetchSemesterCourses();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUnlinkCourse = async (semId, crsId) => {
    if (window.confirm("Are you sure you want to unlink this course?")) {
      try {
        await unlinkAdminSemesterCourse(semId, crsId);
        fetchSemesterCourses();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // --- FILTER LOGIC ---
  const displayedBranches = selectedSchoolId 
    ? branches.filter(branch => branch.school_id === parseInt(selectedSchoolId))
    : [];

  const displayedSemesters = selectedProgramIdForSem 
    ? programSemesters.filter(sem => sem.program_id === parseInt(selectedProgramIdForSem))
    : [];

  const availableSemestersForMap = programSemesters.filter(sem => sem.program_id === parseInt(selectedProgramForMap));
  
  const displayedMappings = mappings.filter(map => 
    map.program_id === parseInt(selectedProgramForMap) && 
    map.semester_id === parseInt(selectedSemesterForMap)
  );

  const displayedSemesterCourses = selectedSemesterForMap
    ? semesterCourses.filter(sc => sc.semester_id === parseInt(selectedSemesterForMap))
    : [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9', overflow: 'hidden' }}>
      <AdminSidebar />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <div style={{ height: '65px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '0 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: 0, color: '#4a3b69', fontWeight: '600' }}>System Setup & Hierarchy Hub</h3>
        </div>

        <div style={{ padding: '40px', maxWidth: '1280px', width: '100%', boxSizing: 'border-box' }}>
          
          <div style={{ marginBottom: '25px' }}>
            <h1 style={{ color: '#2c3e50', fontSize: '26px', margin: '0 0 8px 0' }}>University Configuration</h1>
            <p style={{ color: '#6c757d', fontSize: '14px', margin: 0 }}>Manage academic structures, structural branches, semester timelines, cohorts, and course catalogs.</p>
          </div>

          {/* Professional Sub-Hub Tab Navigation Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '35px' }}>
            
            <div 
              onClick={() => setActiveTab('infrastructure')}
              style={{
                backgroundColor: activeTab === 'infrastructure' ? '#4a3b69' : 'white',
                color: activeTab === 'infrastructure' ? 'white' : '#2c3e50',
                padding: '20px 25px',
                borderRadius: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                border: activeTab === 'infrastructure' ? 'none' : '1px solid #eaeaea',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}
            >
              <div style={{ fontSize: '24px' }}>🏫</div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Schools & Branches</h4>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Manage parent faculties & degree programs</p>
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('timeline')}
              style={{
                backgroundColor: activeTab === 'timeline' ? '#4a3b69' : 'white',
                color: activeTab === 'timeline' ? 'white' : '#2c3e50',
                padding: '20px 25px',
                borderRadius: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                border: activeTab === 'timeline' ? 'none' : '1px solid #eaeaea',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}
            >
              <div style={{ fontSize: '24px' }}>📅</div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Semesters & Cohorts</h4>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Configure timelines, divisions & batches</p>
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('curriculum')}
              style={{
                backgroundColor: activeTab === 'curriculum' ? '#4a3b69' : 'white',
                color: activeTab === 'curriculum' ? 'white' : '#2c3e50',
                padding: '20px 25px',
                borderRadius: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                border: activeTab === 'curriculum' ? 'none' : '1px solid #eaeaea',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}
            >
              <div style={{ fontSize: '24px' }}>📚</div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Course Catalog</h4>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Manage master subjects & curriculum mapping</p>
              </div>
            </div>

          </div>

          {/* --- TAB 1: INFRASTRUCTURE (Schools & Branches) --- */}
          {activeTab === 'infrastructure' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              
              {/* SCHOOLS PANEL */}
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #eaeaea' }}>
                <h3 style={{ color: '#4a3b69', marginTop: 0, fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>Manage Schools</h3>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input 
                    type="text" 
                    placeholder="New School Name (e.g., School of Arts)" 
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' }}
                  />
                  <button 
                    onClick={handleAddSchool}
                    style={{ padding: '12px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                  >
                    + Add School
                  </button>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '300px', overflowY: 'auto' }}>
                  {schools.map(school => (
                    <li key={school.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', backgroundColor: '#f8f9fa', marginBottom: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
                      <span style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>{school.name}</span>
                      <button 
                        onClick={() => handleDeleteSchool(school.id)}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* BRANCHES PANEL */}
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #eaeaea' }}>
                <h3 style={{ color: '#4a3b69', marginTop: 0, fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>Manage Branches (Programs)</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <select 
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: 'white' }}
                  >
                    <option value="">Select Parent School...</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="New Branch (e.g., B.Tech Civil)" 
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' }} 
                    />
                    <button 
                      onClick={handleAddBranch}
                      style={{ padding: '12px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                    >
                      + Add Branch
                    </button>
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '300px', overflowY: 'auto' }}>
                  {selectedSchoolId === '' ? (
                    <li style={{ color: '#999', fontStyle: 'italic', padding: '15px', textAlign: 'center' }}>Select a school above to view its branches.</li>
                  ) : displayedBranches.length === 0 ? (
                    <li style={{ color: '#999', fontStyle: 'italic', padding: '15px', textAlign: 'center' }}>No branches found for this school.</li>
                  ) : (
                    displayedBranches.map(branch => (
                      <li key={branch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', backgroundColor: '#f8f9fa', marginBottom: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
                        <span style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>{branch.name}</span>
                        <button 
                          onClick={() => handleDeleteBranch(branch.id)}
                          style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                        >
                          Delete
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>

            </div>
          )}

          {/* --- TAB 2: TIMELINE (Semesters & Cohorts) --- */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              
              {/* SEMESTERS PANEL */}
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #eaeaea' }}>
                <h3 style={{ color: '#4a3b69', marginTop: 0, fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>Manage Semesters</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <select 
                    value={selectedProgramIdForSem}
                    onChange={(e) => setSelectedProgramIdForSem(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: 'white' }}
                  >
                    <option value="">Select Parent Branch...</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="number" 
                      placeholder="Sem Number (e.g., 1)" 
                      value={newSemNo}
                      onChange={(e) => setNewSemNo(e.target.value)}
                      min="1"
                      style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' }} 
                    />
                    <button 
                      onClick={handleAddSemester}
                      style={{ padding: '12px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                    >
                      + Add Semester
                    </button>
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '300px', overflowY: 'auto' }}>
                  {selectedProgramIdForSem === '' ? (
                    <li style={{ color: '#999', fontStyle: 'italic', padding: '15px', textAlign: 'center' }}>Select a branch to view its semesters.</li>
                  ) : displayedSemesters.length === 0 ? (
                    <li style={{ color: '#999', fontStyle: 'italic', padding: '15px', textAlign: 'center' }}>No semesters mapped yet.</li>
                  ) : (
                    displayedSemesters.map(sem => (
                      <li key={`${sem.program_id}-${sem.semester_id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', backgroundColor: '#f8f9fa', marginBottom: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
                        <span style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>Semester {sem.sem_no}</span>
                        <button 
                          onClick={() => handleDeleteSemester(sem.program_id, sem.semester_id)}
                          style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                        >
                          Unlink
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* COHORTS (DIV & BATCH) PANEL */}
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #eaeaea' }}>
                <h3 style={{ color: '#4a3b69', marginTop: 0, fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>Manage Cohorts (Divisions & Batches)</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <select 
                    value={selectedProgramForMap}
                    onChange={(e) => {
                      setSelectedProgramForMap(e.target.value);
                      setSelectedSemesterForMap(''); 
                    }}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: 'white' }}
                  >
                    <option value="">1. Select Branch...</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>

                  <select 
                    value={selectedSemesterForMap}
                    onChange={(e) => setSelectedSemesterForMap(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: 'white' }}
                    disabled={!selectedProgramForMap}
                  >
                    <option value="">2. Select Semester...</option>
                    {availableSemestersForMap.map(sem => 
                      <option key={sem.semester_id} value={sem.semester_id}>Semester {sem.sem_no}</option>
                    )}
                  </select>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Div (A)" 
                      value={newDivision}
                      onChange={(e) => setNewDivision(e.target.value)}
                      style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' }} 
                    />
                    <input 
                      type="number" 
                      placeholder="Batch (1)" 
                      value={newBatch}
                      onChange={(e) => setNewBatch(e.target.value)}
                      min="1"
                      style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' }} 
                    />
                    <button 
                      onClick={handleAddMapping}
                      style={{ padding: '12px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '250px', overflowY: 'auto' }}>
                  {!selectedProgramForMap || !selectedSemesterForMap ? (
                    <li style={{ color: '#999', fontStyle: 'italic', padding: '15px', textAlign: 'center' }}>Select Branch & Semester to view cohorts.</li>
                  ) : displayedMappings.length === 0 ? (
                    <li style={{ color: '#999', fontStyle: 'italic', padding: '15px', textAlign: 'center' }}>No cohorts mapped for this semester.</li>
                  ) : (
                    displayedMappings.map(map => (
                      <li key={`${map.program_id}-${map.semester_id}-${map.division_id}-${map.batch_id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', backgroundColor: '#f8f9fa', marginBottom: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
                        <span style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>
                          Division: {map.division} | Batch: {map.batch_no}
                        </span>
                        <button 
                          onClick={() => handleDeleteMapping(map.program_id, map.semester_id, map.division_id, map.batch_id)}
                          style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                        >
                          Unlink
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>

            </div>
          )}

          {/* --- TAB 3: CURRICULUM (Course Catalog & Mapping) --- */}
          {activeTab === 'curriculum' && (
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #eaeaea' }}>
              <h3 style={{ color: '#4a3b69', marginTop: 0, fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px' }}>Course Catalog & Semester Curriculum</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                
                {/* CREATE MASTER COURSE */}
                <div>
                  <h4 style={{ color: '#2c3e50', fontSize: '16px', marginTop: 0, marginBottom: '15px' }}>1. Create Master Course</h4>
                  <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                    <input type="text" placeholder="Course Name (e.g., Computer Programming)" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' }} />
                    <input type="text" placeholder="Short Code (e.g., CP)" value={newShortCourseName} onChange={(e) => setNewShortCourseName(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' }} />
                    <button type="submit" style={{ padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>+ Create Master Course</button>
                  </form>
                  
                  <h5 style={{ color: '#4a3b69', fontSize: '14px', marginBottom: '10px' }}>Existing Global Courses:</h5>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eaeaea', borderRadius: '8px', padding: '12px', backgroundColor: '#fcfcfc' }}>
                    {courses.map(c => (
                      <div key={c.id} style={{ fontSize: '13px', padding: '6px 0', borderBottom: '1px solid #f4f6f9' }}>
                        <strong style={{ color: '#3b82f6' }}>{c.short_course_name || 'N/A'}:</strong> {c.course_name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* LINK COURSE TO SEMESTER */}
                <div>
                  <h4 style={{ color: '#2c3e50', fontSize: '16px', marginTop: 0, marginBottom: '15px' }}>2. Assign Course to Semester Curriculum</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    <select value={selectedProgramForMap} onChange={(e) => setSelectedProgramForMap(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: 'white' }}>
                      <option value="">Select Branch...</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    
                    <select value={selectedSemesterForMap} onChange={(e) => setSelectedSemesterForMap(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: 'white' }} disabled={!selectedProgramForMap}>
                      <option value="">Select Semester...</option>
                      {programSemesters.filter(sem => sem.program_id === parseInt(selectedProgramForMap)).map(sem => <option key={sem.semester_id} value={sem.semester_id}>Semester {sem.sem_no}</option>)}
                    </select>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select value={selectedCourseToLink} onChange={(e) => setSelectedCourseToLink(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: 'white' }} disabled={!selectedSemesterForMap}>
                        <option value="">Select Course...</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.course_name} ({c.short_course_name})</option>)}
                      </select>
                      <button onClick={handleLinkCourse} style={{ padding: '12px 25px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Link</button>
                    </div>
                  </div>

                  <h5 style={{ color: '#4a3b69', fontSize: '14px', marginBottom: '10px' }}>Curriculum for Selected Semester:</h5>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' }}>
                    {!selectedSemesterForMap ? (
                      <li style={{ color: '#999', fontStyle: 'italic', fontSize: '13px', padding: '10px' }}>Select a branch and semester to view linked subjects.</li>
                    ) : displayedSemesterCourses.length === 0 ? (
                      <li style={{ color: '#999', fontStyle: 'italic', fontSize: '13px', padding: '10px' }}>No courses mapped to this semester yet.</li>
                    ) : (
                      displayedSemesterCourses.map(sc => (
                        <li key={sc.course_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f8f9fa', marginBottom: '6px', borderRadius: '8px', border: '1px solid #eee', fontSize: '13px' }}>
                          <span style={{ fontWeight: '500' }}>{sc.course_name} ({sc.short_course_name})</span>
                          <button onClick={() => handleUnlinkCourse(sc.semester_id, sc.course_id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>Unlink</button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSystemSetupPage;