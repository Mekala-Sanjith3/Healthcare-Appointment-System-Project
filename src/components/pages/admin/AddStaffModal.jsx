import React, { useEffect, useState } from 'react';
import '../../../styles/pages/admin/AddMedicalRecordModal.css';
import { staffApi } from '../../../services/realtimeApi';

const AddStaffModal = ({ isOpen, onClose, onAdd, staff }) => {
  const [form, setForm] = useState({
    name: '',
    role: '',
    department: '',
    phone: '',
    status: 'ACTIVE'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: '', role: '', department: '', phone: '', status: 'ACTIVE' });
      setError(null);
      setSubmitting(false);
    } else if (staff) {
      setForm({
        name: staff.name || '',
        role: staff.role || '',
        department: staff.department || '',
        phone: staff.phone || '',
        status: (staff.status || 'ACTIVE')
      });
    }
  }, [isOpen, staff]);

  if (!isOpen) return null;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (staff && staff.id) {
        await staffApi.update(staff.id, { ...staff, ...form });
      } else {
        await staffApi.create(form);
      }
      if (onAdd) onAdd();
    } catch (err) {
      setError(err.message || 'Failed to create staff');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container add-medical-record-modal">
        <div className="modal-header">
          <h2>{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
          <button className="close-icon" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
          <form onSubmit={submit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input name="name" value={form.name} onChange={onChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={onChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Role *</label>
                <select name="role" value={form.role} onChange={onChange} required>
                  <option value="">Select Role</option>
                  <option>Nurse</option>
                  <option>Lab Technician</option>
                  <option>Receptionist</option>
                  <option>Pharmacist</option>
                  <option>Administrator</option>
                </select>
              </div>
              <div className="form-group">
                <label>Department *</label>
                <select name="department" value={form.department} onChange={onChange} required>
                  <option value="">Select Department</option>
                  <option>Emergency</option>
                  <option>Laboratory</option>
                  <option>Administration</option>
                  <option>Pharmacy</option>
                  <option>Outpatient</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={onChange}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ON_LEAVE">ON_LEAVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div className="form-group" style={{ alignSelf: 'end' }}>
                <button type="submit" className="submit-button" disabled={submitting}>
                  {submitting ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;


