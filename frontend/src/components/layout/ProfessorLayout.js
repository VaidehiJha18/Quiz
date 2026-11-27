import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; 
import Header from './Header'; 
import Footer from './Footer';

const ProfessorLayout = () => {
    return (
        <div className="layout-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* 1. Sidebar on the left */}
            <Sidebar />

            <div className="main-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                {/* 2. Header at the top */}
                <Header role="Professor" />

                {/* 3. DYNAMIC CONTENT HERE */}
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px', backgroundColor: '#f4f6f8' }}>
                    <Outlet />  {/* 👈 Renders child pages like GenerateCustomPaperPage */}
                </div>

                {/* 4. Footer at the bottom */}
                <Footer />
            </div>
        </div>
    );
};

export default ProfessorLayout;