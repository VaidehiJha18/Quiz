import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/layout/AdminSidebar';

export default function AdminDashboardHub() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalProfessors: 0,
    totalCourses: 0,
    totalAssignments: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalStudents: data.total_students || 0,
          totalProfessors: data.total_professors || 0,
          totalCourses: data.total_courses || 0,
          totalAssignments: data.total_assignments || 0
        });
      }
    } catch (err) {
      console.log("Backend stats offline, rendering fallback view.");
    }
  };

  // The professional feature cards matching your vision
  const adminCards = [
    {
      title: "User & Roster Directory",
      description: "Manage student and faculty accounts, filter hierarchically by department, and execute secure bulk CSV roster uploads.",
      path: "/admin/users",
      icon: "👥",
      color: "#4a3b69",
      badge: `${stats.totalStudents} Students / ${stats.totalProfessors} Faculty`
    },
    {
      title: "University Infrastructure Setup",
      description: "Configure institutions, schools, academic branches, programs, and semester mappings across departments.",
      path: "/admin/setup",
      icon: "🏛️",
      color: "#3b82f6",
      badge: "System Configuration"
    },
    {
      title: "Course Catalog & Mapping",
      description: "Define master course registries, credit weights, and bind specific courses directly to target semesters.",
      path: "/admin/courses",
      icon: "📚",
      color: "#10b981",
      badge: `${stats.totalCourses} Active Courses`
    },
    {
      title: "Faculty Course Assignment",
      description: "Assign authorized professors to teach specific semester courses and micro-cohort divisions.",
      path: "/admin/assignments",
      icon: "👨‍🏫",
      color: "#f59e0b",
      badge: `${stats.totalAssignments} Bindings`
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      <AdminSidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <div style={{ height: '65px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '0 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: 0, color: '#4a3b69', fontWeight: '600' }}>Admin Command Center</h3>
        </div>

        {/* Dashboard Body */}
        <div style={{ padding: '40px' }}>
          <div style={{ marginBottom: '35px' }}>
            <h1 style={{ color: '#2c3e50', fontSize: '26px', margin: '0 0 8px 0' }}>Welcome, Administrator</h1>
            <p style={{ color: '#666', fontSize: '15px', margin: 0 }}>Select an operation card below to manage system data, rosters, and academic structures seamlessly.</p>
          </div>

          {/* Professional Card Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
            {adminCards.map((card, index) => (
              <div 
                key={index}
                onClick={() => navigate(card.path)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '30px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  border: '1px solid #eaeaea',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = card.color;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = '#eaeaea';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                      {card.icon}
                    </div>
                    <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: `${card.color}15`, color: card.color }}>
                      {card.badge}
                    </span>
                  </div>

                  <h3 style={{ color: '#2c3e50', fontSize: '18px', margin: '0 0 10px 0', fontWeight: '600' }}>{card.title}</h3>
                  <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>{card.description}</p>
                </div>

                <div style={{ marginTop: '25px', display: 'flex', alignItems: 'center', gap: '8px', color: card.color, fontWeight: '600', fontSize: '14px' }}>
                  <span>Launch Workspace</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}