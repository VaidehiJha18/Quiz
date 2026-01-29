import React from 'react';

// Renamed to avoid conflict with the 'styles' prop
const dropdownStyles = {
  filterCard: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    marginBottom: '30px',
    width: '100%',
    boxSizing: 'border-box'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', 
    gap: '20px', 
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '600',
    color: '#555',
    fontSize: '0.9rem',
    marginLeft: '2px'
  },
  select: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    fontSize: '1rem',
    backgroundColor: '#f9f9f9',
    width: '100%',
    outline: 'none',
    cursor: 'pointer'
  },
};

const Dropdown = ({ lists, selections, handlers }) => {
  return (
    <div style={dropdownStyles.filterCard}>
      <h3 style={{ marginBottom: '20px', color: '#444' }}>Filter Options</h3>
      
      <div style={dropdownStyles.gridContainer}>
        {/* Row 1: School */}
        <div style={dropdownStyles.inputGroup}>
          <label style={dropdownStyles.label}>Select School:</label>
          <select 
            style={dropdownStyles.select} 
            value={selections.school} 
            onChange={handlers.handleSchoolChange}
          >
            <option value="">Select a school</option>
            {/* Added safety check and changed to 'school' (singular) to match your decision */}
            {(lists.schools || []).map(item => (
              <option key={item.id} value={item.id}>{item.school_name}</option>
            ))}
          </select>
        </div>

         {/* Row 2: Program */}
        <div style={dropdownStyles.inputGroup}>
          <label style={dropdownStyles.label}>Select Program:</label>
          <select 
            style={dropdownStyles.select} 
            value={selections.program} 
            onChange={handlers.handleProgramChange} 
            disabled={!selections.school}
          >
            <option value="">Select a program</option>
            {(lists.programs || []).map(item => (
              <option key={item.id} value={item.id}>{item.program_name}</option>
            ))}
          </select>
        </div>

        {/* Row 1: Department */}
        <div style={dropdownStyles.inputGroup}>
          <label style={dropdownStyles.label}>Select Department:</label>
          <select 
            style={dropdownStyles.select} 
            value={selections.department} 
            onChange={handlers.handleDeptChange} 
            disabled={!selections.program}
          >
            <option value="">Select a department</option>
            {(lists.departments || []).map(item => (
              <option key={item.id} value={item.id}>{item.dept_name}</option>
            ))}
          </select>
        </div>

        {/* Row 2: Semester */}
        <div style={dropdownStyles.inputGroup}>
          <label style={dropdownStyles.label}>Select Semester:</label>
          <select 
            style={dropdownStyles.select} 
            value={selections.semester} 
            onChange={handlers.handleSemesterChange} 
            disabled={!selections.department}
          >
            <option value="">Select a semester</option>
            {(lists.semesters || []).map(s => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        {/* Row 3: Course (Full Width) */}
        <div style={{ ...dropdownStyles.inputGroup, gridColumn: '1 / -1' }}>
          <label style={dropdownStyles.label}>Select Course:</label>
          <select 
            style={dropdownStyles.select} 
            value={selections.course} 
            onChange={handlers.handleCourseChange} 
            disabled={!selections.semester}
          >
            <option value="">Select a course</option>
            {(lists.courses || []).map(item => (
              <option key={item.id} value={item.id}>{item.course_name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
