import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/layout/AdminSidebar';

export default function AdminDashboardHub() {
  const navigate = useNavigate();

  // Configuration management cards matching your vision
  const adminModules = [
    {
      title: "User & Roster Directory",
      description: "Manage student and faculty accounts, filter by university hierarchy, and execute secure bulk CSV roster uploads.",
      path: "/admin/users",
      icon: "👥",
      color: "#4a3b69",
      badge: "Core Roster"
    },
    {
      title: "University Structure Setup",
      description: "Configure institutions, schools, academic branches, programs, and semester mappings across departments.",
      path: "/admin/setup",
      icon: "🏛️",
      color: "#3b82f6",
      badge: "Hierarchy"
    },
    {
      title: "Course Catalog & Mapping",
      description: "Define master course registries, credit weights, and bind specific courses directly to target semesters.",
      path: "/admin/courses",
      icon: "📚",
      color: "#10b981",
      badge: "Curriculum"
    },
    {
      title: "Faculty Course Assignment",
      description: "Assign authorized professors to teach specific semester courses and micro-cohort divisions.",
      path: "/admin/assignments",
      icon: "👨‍🏫",
      color: "#f59e0b",
      badge: "Operations"
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9', overflow: 'hidden' }}>
      {/* Static Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header */}
        <div style={{ height: '65px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '0 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: 0, color: '#4a3b69', fontWeight: '600' }}>Admin Control Center</h3>
        </div>

        {/* Dashboard Body */}
        <div style={{ padding: '40px' }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ color: '#2c3e50', fontSize: '26px', margin: '0 0 8px 0' }}>Welcome, Administrator</h1>
            <p style={{ color: '#666', fontSize: '15px', margin: 0 }}>Select a management module below to configure system data, rosters, and academic structures.</p>
          </div>

          {/* Card Grid Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
            {adminModules.map((mod, index) => (
              <div 
                key={index}
                onClick={() => navigate(mod.path)}
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
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = mod.color;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = '#eaeaea';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: `${mod.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                      {mod.icon}
                    </div>
                    <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: `${mod.color}15`, color: mod.color }}>
                      {mod.badge}
                    </span>
                  </div>

                  <h3 style={{ color: '#2c3e50', fontSize: '18px', margin: '0 0 10px 0', fontWeight: '600' }}>{mod.title}</h3>
                  <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>{mod.description}</p>
                </div>

                <div style={{ marginTop: '25px', display: 'flex', alignItems: 'center', gap: '8px', color: mod.color, fontWeight: '600', fontSize: '14px' }}>
                  <span>Access Module</span>
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