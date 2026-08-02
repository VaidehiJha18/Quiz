
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