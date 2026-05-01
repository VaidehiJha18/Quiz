import React from 'react';

const StatCard = ({ title, value, gradient }) => {
  return (
    <div style={{ 
      background: gradient, 
      padding: '30px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)', 
      flex: 1, 
      textAlign: 'center',
      minWidth: '200px',
      color: 'white'
    }}>
      <h2 style={{ fontSize: '48px', margin: '0 0 5px 0', fontWeight: 'bold' }}>
        {value}
      </h2>
      <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
        {title}
      </p>
    </div>
  );
};

export default StatCard;