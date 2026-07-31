

// import React, { useEffect, useState, useRef } from 'react';
// import AdminSidebar from '../components/layout/AdminSidebar';
// import StatCard from '../components/ui/StatCard';
// import { getAdminStats, getAdminUsers, getAdminUserDetails, uploadAdminRoster } from '../api/apiService';

// const AdminDashboardPage = () => {
//   const [stats, setStats] = useState({ students: 0, professors: 0, quizzes: 0 });
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
  
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
  
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef(null);

//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedSchool, setSelectedSchool] = useState('All');
//   const [selectedBranch, setSelectedBranch] = useState('All');
//   const [selectedSemester, setSelectedSemester] = useState('All');

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     try {
//       const statsData = await getAdminStats();
//       const data = await getAdminUsers(searchTerm, selectedSchool, selectedBranch, selectedSemester);
      
//       const usersArray = Array.isArray(data) ? data : (data.users || []);
//       setStats(statsData);
//       setUsers(usersArray);
//     } catch (err) {
//       setError('Failed to sync with University database.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, [searchTerm, selectedSchool, selectedBranch, selectedSemester]);

//   const handleEditClick = async (userId) => {
//     try {
//       const fullUserDetails = await getAdminUserDetails(userId);
//       setSelectedUser(fullUserDetails);
//       setIsModalOpen(true);
//     } catch (err) {
//       alert("Failed to load full user profile.");
//     }
//   };

//   const handleFileChange = async (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setIsUploading(true); 
//       try {
//         const result = await uploadAdminRoster(file);
//         alert(result.message); 
//         await fetchDashboardData(); 
//       } catch (err) {
//         alert(err.message || "Something went wrong during upload.");
//       } finally {
//         setIsUploading(false); 
//         event.target.value = null; 
//       }
//     }
//   };

//   const filteredUsers = (users || []).filter(user => {
//     const matchesSearch = user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
//                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesSearch; 
//   });

//   return (
//     <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9', position: 'relative' }}>
//       <AdminSidebar />
      
//       <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//         <div style={{ height: '60px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px' }}>
//           <h3 style={{ margin: 0, color: '#4a3b69' }}>Quiz Portal</h3>
//           <span style={{ color: '#4a3b69', fontWeight: '500', cursor: 'pointer' }}>Home</span>
//         </div>

//         <div style={{ padding: '40px' }}>
//           <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>Admin Dashboard</h1>
          
//           {loading ? ( <p>Loading live database metrics...</p> ) : error ? ( <p style={{ color: 'red' }}>{error}</p> ) : (
//             <>
//               <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '40px' }}>
//                 <StatCard title="Total Students" value={stats.students} gradient="linear-gradient(135deg, #cba4e3, #e8a9d6)" />
//                 <StatCard title="Total Professors" value={stats.professors} gradient="linear-gradient(135deg, #84e8cd, #86c4e8)" />
//                 <StatCard title="Total Quizzes" value={stats.quizzes} gradient="linear-gradient(135deg, #fabc96, #f397c8)" />
//               </div>

//               <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
//                   <h3 style={{ color: '#4a3b69', margin: 0 }}>Global User Roster</h3>
                  
//                   <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
//                     <input 
//                       type="text" 
//                       placeholder="Search name or email..." 
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', width: '200px' }}
//                     />

//                     <select 
//                       value={selectedSchool} 
//                       onChange={(e) => setSelectedSchool(e.target.value)}
//                       style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', backgroundColor: 'white' }}
//                     >
//                       <option value="All">All Schools</option>
//                       <option value="1">School of Technology (SOT)</option>
//                       <option value="2">School of Science (SOS)</option>
//                       <option value="3">School of Management (SOM)</option>
//                     </select>

//                     <select 
//                       value={selectedBranch} 
//                       onChange={(e) => setSelectedBranch(e.target.value)}
//                       style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', backgroundColor: 'white' }}
//                     >
//                       <option value="All">All Branches</option>
//                       <option value="B.Tech CSE">B.Tech CSE</option>
//                       <option value="B.Tech Chemical">B.Tech Chemical</option>
//                       <option value="BBA">BBA</option>
//                       <option value="B.Sc Biotech">B.Sc Biotech</option>
//                     </select>

//                     <select 
//                       value={selectedSemester} 
//                       onChange={(e) => setSelectedSemester(e.target.value)}
//                       style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', backgroundColor: 'white' }}
//                     >
//                       <option value="All">All Semesters</option>
//                       <option value="1">Semester 1</option>
//                       <option value="2">Semester 2</option>
//                       <option value="3">Semester 3</option>
//                       <option value="4">Semester 4</option>
//                       <option value="5">Semester 5</option>
//                       <option value="6">Semester 6</option>
//                       <option value="7">Semester 7</option>
//                       <option value="8">Semester 8</option>
//                     </select>

//                     <input 
//                       type="file" 
//                       accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
//                       style={{ display: 'none' }} 
//                       ref={fileInputRef}
//                       onChange={handleFileChange}
//                     />
//                     <button 
//                       onClick={() => fileInputRef.current.click()} 
//                       disabled={isUploading}
//                       style={{ padding: '10px 20px', backgroundColor: isUploading ? '#ccc' : '#84e8cd', color: '#2c3e50', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isUploading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
//                     >
//                       {isUploading ? 'Uploading...' : '+ Upload'}
//                     </button>
//                   </div>
//                 </div>

//                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
//                   <thead>
//                     <tr style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}>
//                       <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>ID</th>
//                       <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Name</th>
//                       <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Email</th>
//                       <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Role</th>
//                       <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredUsers.length === 0 ? (
//                       <tr>
//                         <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
//                           No users found matching your search.
//                         </td>
//                       </tr>
//                     ) : (
//                       filteredUsers.map((user) => (
//                         <tr key={user.user_id} style={{ borderBottom: '1px solid #eee' }}>
//                           <td style={{ padding: '15px', color: '#495057' }}>#{user.user_id}</td>
//                           <td style={{ padding: '15px', fontWeight: '500', color: '#2c3e50' }}>{user.user_name}</td>
//                           <td style={{ padding: '15px', color: '#6c757d' }}>{user.email}</td>
//                           <td style={{ padding: '15px' }}>
//                             <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.85em', fontWeight: '600', backgroundColor: user.role_id === 3 ? '#e8a9d6' : user.role_id === 2 ? '#86c4e8' : '#e0e0e0', color: user.role_id === 3 ? '#6b2f56' : user.role_id === 2 ? '#2b5e7a' : '#4a4a4a' }}>
//                               {user.role_name}
//                             </span>
//                           </td>
//                           <td style={{ padding: '15px' }}>
//                             <button onClick={() => handleEditClick(user.user_id)} style={{ marginRight: '10px', padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'white' }}>Edit</button>
//                             <button style={{ padding: '6px 12px', border: '1px solid #ffcccc', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#fff0f0', color: '#d9534f' }}>Delete</button>
//                           </td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* THE RESTORED AND FIXED MODAL CODE */}
//       {isModalOpen && selectedUser && (
//         <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
//           <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
//             <h2 style={{ marginTop: 0, color: '#4a3b69', borderBottom: '2px solid #f4f6f9', paddingBottom: '10px' }}>User Profile</h2>
            
//             <div style={{ marginBottom: '20px' }}>
//               <p><strong>Name:</strong> {selectedUser.account?.user_name}</p>
//               <p><strong>Email:</strong> {selectedUser.account?.email}</p>
//               <p><strong>Role:</strong> {selectedUser.account?.role_name}</p>
//             </div>

//             {selectedUser.profile && Object.keys(selectedUser.profile).length > 0 && (
//               <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
//                 <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>University Details</h4>
//                 {Object.entries(selectedUser.profile).map(([key, value]) => {
//                   // Safety check: Prevent React from crashing on objects
//                   let displayValue = value;
//                   if (typeof value === 'object' && value !== null) {
//                     displayValue = JSON.stringify(value);
//                   }
//                   return (
//                     <p key={key} style={{ margin: '5px 0', textTransform: 'capitalize' }}>
//                       <strong>{key.replace(/_/g, ' ')}:</strong> {displayValue || 'N/A'}
//                     </p>
//                   );
//                 })}
//               </div>
//             )}

//             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//               <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#e0e0e0', color: '#333' }}>Close</button>
//               <button style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#4a3b69', color: 'white' }}>Save Changes</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminDashboardPage;

import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/layout/AdminSidebar';
import StatCard from '../components/ui/StatCard';
import { getAdminStats } from '../api/apiService';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ students: 0, professors: 0, quizzes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getAdminStats();
        setStats(statsData);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      <AdminSidebar />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '60px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px' }}>
          <h3 style={{ margin: 0, color: '#4a3b69' }}>Quiz Portal Overview</h3>
        </div>

        <div style={{ padding: '40px' }}>
          <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>Admin Dashboard</h1>
          
          {loading ? ( <p>Loading live database metrics...</p> ) : error ? ( <p style={{ color: 'red' }}>{error}</p> ) : (
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              <StatCard title="Total Students" value={stats.students} gradient="linear-gradient(135deg, #cba4e3, #e8a9d6)" />
              <StatCard title="Total Professors" value={stats.professors} gradient="linear-gradient(135deg, #84e8cd, #86c4e8)" />
              <StatCard title="Total Quizzes" value={stats.quizzes} gradient="linear-gradient(135deg, #fabc96, #f397c8)" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;