import React from 'react';
import { Outlet } from 'react-router-dom'; 
import StudentSidebar from './StudentSidebar'; 
import Header from './Header'; 
import Footer from './Footer';

const StudentLayout = () => {
    return (
        <div className="layout-container" style={{ display: 'flex', overflow: 'hidden' }}>
            
            {/* Student Sidebar stays fixed on the left */}
            <StudentSidebar />

            <div className="main-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                
                {/* Header stays fixed at top */}
                <Header role="Student" />

                {/* Main content area scrolls independently */}
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px', backgroundColor: '#f4f6f8' }}>
                    <Outlet />  
                </div>

                {/* Footer stays fixed at bottom */}
                <Footer />
            </div>
        </div>
    );
};

export default StudentLayout;