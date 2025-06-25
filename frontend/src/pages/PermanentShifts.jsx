import React, { useState, useEffect, useCallback } from 'react';
import {
    listPermanentAssignments,
    createPermanentAssignment,
    updatePermanentAssignment,
    deletePermanentAssignment,
    generateShiftsFromPermanent,
    reassignPermanentShift,
    listOfficers
} from '../api';
import './PermanentShifts.css';

// --- NEW: A fixed list of permanent locations ---
// This prevents typos and keeps data consistent.
// In the future, this could be fetched from its own API endpoint.
const PERMANENT_LOCATIONS = [
    'KNIGHT MOVER',
    'PSB Lobby',
    'Sec. Tech.',
    'EOF - Hardenburgh Hall',
    'Supervisor Hours',
    'Alexander Library',
    'RUPD SUPPORT',
    'CA FOOT PATROL',
    'MOUNTED PATROL',
    'OVERNIGHT PATROL',
    'Civic Square',
    'RBS Back Entrance',
    'RBS Front Entrance'
];


// Helper to format time from "HH:MM:SS" to "HH:MM" for time inputs
const formatTimeForInput = (time) => time ? time.substring(0, 5) : '';

export default function PermanentShifts() {
    // --- STATE MANAGEMENT ---
    const [assignments, setAssignments] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // --- NEW: State for the location filter ---
    const [locationFilter, setLocationFilter] = useState(''); // Empty string means "All Locations"

    // State for the main Create/Edit form
    const [form, setForm] = useState({
        officerId: '',
        shiftType: PERMANENT_LOCATIONS[0], // Default to the first location
        dayOfWeek: 'Sunday',
        startTime: '',
        endTime: '',
    });

    // State for the "Generate Shifts" action
    const [generationDates, setGenerationDates] = useState({
        startDate: '',
        endDate: '',
    });

    // State for the Reassignment Modal
    const [reassigningAssignment, setReassigningAssignment] = useState(null);
    const [reassignmentDetails, setReassignmentDetails] = useState({
        newOfficerId: '',
        effectiveDate: '',
    });

    // --- DATA LOADING ---
    const reloadAssignments = useCallback(() => {
        listPermanentAssignments()
            .then(data => {
                const sorted = data.sort((a, b) => a.officer_name.localeCompare(b.officer_name) || a.day_of_week.localeCompare(b.day_of_week));
                setAssignments(sorted);
            })
            .catch(() => alert('Could not load permanent assignments.'));
    }, []);

    const loadOfficers = useCallback(() => {
        listOfficers()
            .then(setOfficers)
            .catch(() => alert('Could not load officers list.'));
    }, []);

    useEffect(() => {
        reloadAssignments();
        loadOfficers();
    }, [reloadAssignments, loadOfficers]);

    // --- FORM & ACTION HANDLERS ---
    const resetForm = () => {
        setEditingId(null);
        setForm({
            officerId: '',
            shiftType: PERMANENT_LOCATIONS[0],
            dayOfWeek: 'Sunday',
            startTime: '',
            endTime: '',
        });
    };
    
    const handleFormChange = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

    const startEdit = (assignment) => {
        setEditingId(assignment.id);
        setForm({
            officerId: assignment.officer_id,
            shiftType: assignment.shift_type,
            dayOfWeek: assignment.day_of_week,
            startTime: formatTimeForInput(assignment.start_time),
            endTime: formatTimeForInput(assignment.end_time),
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.officerId || !form.shiftType || !form.startTime || !form.endTime) {
            return alert('All fields are required.');
        }

        try {
            if (editingId) {
                await updatePermanentAssignment(editingId, form);
                alert('✅ Assignment rule updated');
            } else {
                await createPermanentAssignment(form);
                alert('✅ Assignment rule created');
            }
            resetForm();
            reloadAssignments();
        } catch (err) {
            alert('Save failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const onDelete = async (id) => {
        const ans = prompt("Type DELETE to confirm permanent deletion of this rule AND all its future shifts.");
        if (ans !== 'DELETE') return;

        try {
            await deletePermanentAssignment(id);
            if (editingId === id) resetForm();
            reloadAssignments();
        } catch (err) {
            alert('Delete failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const onGenerateShifts = async (e) => {
        e.preventDefault();
        if (!generationDates.startDate || !generationDates.endDate) {
            return alert("Both a start and end date are required.");
        }
        if (!window.confirm(`Generate all shifts from ${generationDates.startDate} to ${generationDates.endDate}? This will delete and replace any existing permanent shifts in this date range.`)) {
            return;
        }

        try {
            const result = await generateShiftsFromPermanent(generationDates);
            alert(`✅ Success: ${result.message}`);
        } catch (err) {
            alert('Generation failed: ' + (err.response?.data?.error || err.message));
        }
    };
    
    // --- REASSIGNMENT MODAL HANDLERS ---
    const startReassign = (assignment) => {
        setReassigningAssignment(assignment);
        setReassignmentDetails({ newOfficerId: '', effectiveDate: '' });
    };

    const closeReassignModal = () => setReassigningAssignment(null);
    
    const onReassign = async (e) => {
        e.preventDefault();
        if (!reassignmentDetails.newOfficerId || !reassignmentDetails.effectiveDate) {
            return alert("You must select a new officer and an effective date.");
        }
        if (!window.confirm("This will reassign all future shifts for this rule to the new officer from the selected date. Proceed?")) {
            return;
        }

        try {
            await reassignPermanentShift(reassigningAssignment.id, reassignmentDetails);
            alert('✅ Shifts successfully reassigned for all future dates.');
            reloadAssignments();
            closeReassignModal();
        } catch (err) {
            alert('Reassignment failed: ' + (err.response?.data?.error || err.message));
        }
    };

    // --- NEW: Filtered assignments for display ---
    const filteredAssignments = locationFilter 
        ? assignments.filter(a => a.shift_type === locationFilter) 
        : assignments;

    return (
        <div className="permanent-shifts-container">
            <h1>Manage Permanent Schedules</h1>
            
            <section className="card">
                <h2>{editingId ? 'Edit Assignment Rule' : 'Create Assignment Rule'}</h2>
                <form onSubmit={onSubmit} className="form-grid">
                    <div className="form-group">
                        <label>Officer</label>
                        <select name="officerId" value={form.officerId} onChange={handleFormChange('officerId')} required>
                            <option value="">Select Officer</option>
                            {officers.map(officer => (
                                <option key={officer.id} value={officer.id}>{officer.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Shift Type / Location</label>
                        {/* --- UPDATED: From text input to a dropdown --- */}
                        <select name="shiftType" value={form.shiftType} onChange={handleFormChange('shiftType')} required>
                            {PERMANENT_LOCATIONS.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Day of the Week</label>
                        <select name="dayOfWeek" value={form.dayOfWeek} onChange={handleFormChange('dayOfWeek')} required>
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Start Time</label>
                        <input type="time" value={form.startTime} onChange={handleFormChange('startTime')} required />
                    </div>
                    <div className="form-group">
                        <label>End Time</label>
                        <input type="time" value={form.endTime} onChange={handleFormChange('endTime')} required />
                    </div>
                    <div className="form-group full-width form-controls">
                        {editingId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel Edit</button>}
                        <button type="submit" className="btn btn-primary-solid">{editingId ? 'Save Changes' : '+ Add Rule'}</button>
                    </div>
                </form>
            </section>

            <section className="card">
                <h3>Current Permanent Assignment Rules</h3>
                {/* --- NEW: Filter dropdown for the list --- */}
                <div className="form-group filter-group">
                    <label>Filter by Location</label>
                    <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
                        <option value="">All Locations</option>
                        {PERMANENT_LOCATIONS.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>

                <div className="assignments-list">
                    {filteredAssignments.length === 0 ? (
                        <p>No assignments found for this location.</p>
                    ) : (
                        <ul>
                            {/* --- UPDATED: Maps over the filtered list --- */}
                            {filteredAssignments.map(assign => (
                                <li key={assign.id}>
                                    <span><strong>{assign.officer_name}</strong> works <strong>{assign.shift_type}</strong> on <strong>{assign.day_of_week}s</strong></span>
                                    <div className="assignment-actions">
                                        <button className="btn btn-secondary" onClick={() => startEdit(assign)}>Edit</button>
                                        <button className="btn btn-primary" onClick={() => startReassign(assign)}>Reassign</button>
                                        <button className="btn btn-danger" onClick={() => onDelete(assign.id)}>Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <section className="card">
                <h2>Generate Shifts for a Semester</h2>
                <p>Use this tool to create all individual shifts in the main schedule based on the rules above.</p>
                <form onSubmit={onGenerateShifts} className="form-grid">
                    <div className="form-group">
                        <label>Semester Start Date</label>
                        <input type="date" value={generationDates.startDate} onChange={e => setGenerationDates(prev => ({ ...prev, startDate: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                        <label>Semester End Date</label>
                        <input type="date" value={generationDates.endDate} onChange={e => setGenerationDates(prev => ({ ...prev, endDate: e.target.value }))} required />
                    </div>
                    <div className="form-group full-width">
                         <button type="submit" className="btn btn-primary-solid">Generate All Shifts</button>
                    </div>
                </form>
            </section>

            {reassigningAssignment && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h2>Reassign Permanent Shift</h2>
                        <div className="original-assignment-details">
                            <p><strong>Original Assignment:</strong></p>
                            <p>{reassigningAssignment.officer_name} works {reassigningAssignment.shift_type} on {reassigningAssignment.day_of_week}s</p>
                        </div>
                        <form onSubmit={onReassign}>
                             <div className="form-group">
                                <label>Reassign To:</label>
                                <select value={reassignmentDetails.newOfficerId} onChange={e => setReassignmentDetails(prev => ({...prev, newOfficerId: e.target.value}))} required>
                                    <option value="">Select New Officer</option>
                                    {officers.filter(o => o.id !== reassigningAssignment.officer_id).map(o => (
                                        <option key={o.id} value={o.id}>{o.name}</option>
                                    ))}
                                </select>
                             </div>
                              <div className="form-group">
                                <label>Effective From This Date Onwards:</label>
                                <input type="date" value={reassignmentDetails.effectiveDate} onChange={e => setReassignmentDetails(prev => ({...prev, effectiveDate: e.target.value}))} required />
                             </div>
                             <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeReassignModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary-solid">Save and Update Future Shifts</button>
                             </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
