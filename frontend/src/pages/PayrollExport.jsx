import React, { useState, useEffect } from 'react';
// Access API functions from the global window.api object, set up in App.jsx
// This avoids relative path issues in some environments.
// import { getAdminUsers, getPayrollExportData, getPayrollMappings, updatePayrollMappings } from '../api';
import { FaDownload, FaSave, FaSyncAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker CSS
import './PayrollExport.css'; // Import custom CSS for this page

export default function PayrollExport() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]); // All users for selection
  const [selectedUsers, setSelectedUsers] = useState([]); // Users selected for export
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [exportData, setExportData] = useState([]); // Preview of data
  const [payCodeMappings, setPayCodeMappings] = useState({}); // Stores user_rank -> payroll_code mappings
  const [payrollSystemFields, setPayrollSystemFields] = useState([ // Example customizable payroll system fields
    'EmployeeID', 'FirstName', 'LastName', 'Date', 'PayCode', 'Hours', 'Department', 'JobTitle', 'Comments'
  ]);
  const [customPayCodeInput, setCustomPayCodeInput] = useState(''); // For adding new custom pay codes

  // Define your user ranks. These should match what's in your user data.
  const userRanks = ['CDT', 'CSO', 'FTO', 'XO', 'CS', 'BS', 'LT'];

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Access getAdminUsers from window.api
        const allUsers = await window.api.getAdminUsers(true); // Get all active users
        setUsers(allUsers);

        // Load existing payroll mappings from backend
        // Access getPayrollMappings from window.api
        const existingMappings = await window.api.getPayrollMappings();
        setPayCodeMappings(existingMappings || {});

        // Set default date range to last full pay week (example: Mon-Sun for current week)
        const today = new Date();
        const lastMonday = new Date(today);
        lastMonday.setDate(today.getDate() - (today.getDay() + 6) % 7); // Last Monday
        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6); // Last Sunday

        setStartDate(lastMonday);
        setEndDate(lastSunday);

      } catch (error) {
        // Use a custom message box instead of alert()
        console.error("Failed to load initial data:", error);
        // You would display a custom modal/message here
        // alert("Failed to load initial data: " + (error.response?.data?.error || error.message));
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  /**
   * Handles selecting/deselecting an individual user for export.
   * @param {string} userId - The ID of the user to toggle.
   */
  const handleUserSelect = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  /**
   * Toggles selection of all users for export.
   */
  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]); // Deselect all
    } else {
      setSelectedUsers(users.map(u => u.id)); // Select all
    }
  };

  /**
   * Updates the payroll code mapping for a specific user rank.
   * @param {string} userRank - The internal user rank (e.g., 'CDT').
   * @param {string} payrollCode - The corresponding payroll system code (e.g., 'REG_HOURS').
   */
  const handlePayCodeMappingChange = (userRank, payrollCode) => {
    setPayCodeMappings(prev => ({ ...prev, [userRank]: payrollCode }));
  };

  /**
   * Adds a new custom payroll field/code to the list of available fields.
   */
  const handleAddCustomPayCodeInput = () => {
    if (customPayCodeInput.trim() && !payrollSystemFields.includes(customPayCodeInput.trim())) {
      setPayrollSystemFields(prev => [...prev, customPayCodeInput.trim()]);
      setCustomPayCodeInput('');
    }
  };

  /**
   * Saves the current pay code mappings to the backend.
   */
  const handleSaveMappings = async () => {
    try {
      // Access updatePayrollMappings from window.api
      await window.api.updatePayrollMappings(payCodeMappings);
      // alert('Payroll mappings saved successfully!'); // Replace with custom message box
      console.log('Payroll mappings saved successfully!');
    } catch (error) {
      console.error("Failed to save mappings:", error);
      // alert("Failed to save mappings: " + (error.response?.data?.error || error.message)); // Replace with custom message box
    }
  };

  /**
   * Fetches the payroll data from the backend based on selected criteria.
   */
  const fetchExportData = async () => {
    if (!startDate || !endDate) {
      // alert('Please select a start and end date.'); // Replace with custom message box
      console.warn('Please select a start and end date.');
      return;
    }
    if (selectedUsers.length === 0) {
      // alert('Please select at least one employee.'); // Replace with custom message box
      console.warn('Please select at least one employee.');
      return;
    }
    // Basic validation for mappings
    const unmappedRanks = userRanks.filter(rank => !payCodeMappings[rank] || payCodeMappings[rank].trim() === '');
    if (unmappedRanks.length > 0) {
      // alert(`Please map all user roles. Missing mappings for: ${unmappedRanks.join(', ')}`); // Replace with custom message box
      console.warn(`Please map all user roles. Missing mappings for: ${unmappedRanks.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      // Send selected users, date range, and current mappings to the backend
      // Access getPayrollExportData from window.api
      const data = await window.api.getPayrollExportData({
        userIds: selectedUsers,
        startDate: startDate.toISOString().split('T')[0], // Format to YYYY-MM-DD
        endDate: endDate.toISOString().split('T')[0],     // Format to YYYY-MM-DD
        payCodeMappings: payCodeMappings,
      });
      setExportData(data);
    } catch (error) {
      console.error("Failed to fetch export data:", error);
      // alert("Failed to fetch export data: " + (error.response?.data?.error || error.message)); // Replace with custom message box
      setExportData([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generates and downloads the CSV file from the fetched export data.
   */
  const downloadCSV = () => {
    if (exportData.length === 0) {
      // alert('No data to export. Please fetch data first.'); // Replace with custom message box
      console.warn('No data to export. Please fetch data first.');
      return;
    }

    // Determine the headers based on actual data keys from the first row of exportData
    const headers = Object.keys(exportData[0] || {});

    // Create CSV content
    const csvContent = [
      headers.join(','), // CSV header row
      ...exportData.map(row =>
        headers.map(header => {
          let value = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
          // Basic CSV escaping: enclose values containing commas, quotes, or newlines in double quotes
          // and escape existing double quotes by doubling them.
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create a Blob and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_data_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  return (
    <div className="PayrollExport">
      <h2>Payroll Export Tool</h2>

      {/* Section 1: Configure Pay Code Mappings */}
      <div className="card">
        <h3>1. Configure Pay Code Mappings</h3>
        <p className="card-description">Map your internal user roles to the corresponding pay codes used by your payroll system (e.g., 'REG', 'OT1.5', 'SICK'). These settings are saved automatically.</p>
        <div className="paycode-mappings">
          {userRanks.map(rank => (
            <div key={rank} className="mapping-item">
              <label>{rank} maps to:</label>
              <input
                type="text"
                value={payCodeMappings[rank] || ''}
                onChange={(e) => handlePayCodeMappingChange(rank, e.target.value)}
                placeholder={`e.g., REG_HOURS or ${rank}`}
              />
            </div>
          ))}
        </div>
        <div className="custom-paycode-add">
          <input
            type="text"
            placeholder="Add new payroll field/code (e.g., Department)"
            value={customPayCodeInput}
            onChange={(e) => setCustomPayCodeInput(e.target.value)}
          />
          <button onClick={handleAddCustomPayCodeInput} className="btn-secondary">Add Field</button>
        </div>
        <button onClick={handleSaveMappings} className="btn-primary save-mappings-btn">
          <FaSave /> Save Mappings
        </button>
      </div>

      {/* Section 2: Select Date Range & Employees */}
      <div className="card">
        <h3>2. Select Date Range & Employees</h3>
        <div className="date-picker-section">
          <div>
            <label>Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              className="date-input"
            />
          </div>
          <div>
            <label>End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
              className="date-input"
            />
          </div>
        </div>

        <div className="employee-selection">
          <h4>Employees to Include:</h4>
          <label className="select-all-checkbox">
            <input
              type="checkbox"
              checked={selectedUsers.length === users.length && users.length > 0}
              onChange={handleSelectAllUsers}
            />
            Select All ({selectedUsers.length} / {users.length})
          </label>
          <div className="user-list-checkboxes">
            {users.map(user => (
              <label key={user.id}>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleUserSelect(user.id)}
                />
                {user.first_name} ({user.username})
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Fetch & Download Data */}
      <div className="card download-section">
        <h3>3. Fetch & Download Data</h3>
        <button onClick={fetchExportData} className="btn-primary fetch-data-btn" disabled={loading}>
          {loading ? <FaSyncAlt className="spin-icon" /> : <FaSyncAlt />} Fetch Data for Preview
        </button>

        {exportData.length > 0 && (
          <div className="data-preview">
            <h4>Data Preview ({exportData.length} records):</h4>
            <div className="table-wrapper">
              <table className="preview-table">
                <thead>
                  <tr>
                    {/* Render headers based on actual data keys */}
                    {Object.keys(exportData[0] || {}).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exportData.slice(0, 10).map((row, index) => ( // Show first 10 rows for preview
                    <tr key={index}>
                      {Object.values(row).map((value, idx) => (
                        <td key={idx}>{String(value).substring(0, 50)}</td> // Truncate long values for preview
                      ))}
                    </tr>
                  ))}
                  {exportData.length > 10 && (
                    <tr>
                      <td colSpan={Object.keys(exportData[0] || {}).length}>... {exportData.length - 10} more rows</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button onClick={downloadCSV} className="btn-success download-btn">
              <FaDownload /> Download CSV
            </button>
            <p className="download-hint">
              Review the data above. Once satisfied, click "Download CSV".
              The file will be named "payroll_data\_[start\_date]\_to\_[end\_date].csv".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
