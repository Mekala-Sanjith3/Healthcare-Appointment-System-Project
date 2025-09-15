import React, { useState, useEffect } from 'react';
import '../../../styles/pages/admin/StaffManagement.css';

const StaffManagement = ({ searchTerm, filters }) => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    // Fetch staff members data (mock data for now)
    const fetchStaffMembers = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setStaffMembers(getMockStaffData());
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching staff members:", error);
        setIsLoading(false);
      }
    };

    fetchStaffMembers();
  }, []);

  // Mock staff data generator
  const getMockStaffData = () => {
    return [
      {
        id: "staff_001",
        name: "Sarah Johnson",
        role: "Nurse",
        department: "Emergency",
        email: "sarah.johnson@healthcare.com",
        phone: "555-123-4567",
        hireDate: "2020-03-15",
        status: "Active",
        education: "BSN, University of Michigan",
        certifications: ["RN", "ACLS", "PALS"]
      },
      {
        id: "staff_002",
        name: "Robert Davis",
        role: "Lab Technician",
        department: "Laboratory",
        email: "robert.davis@healthcare.com",
        phone: "555-987-6543",
        hireDate: "2019-06-28",
        status: "Active",
        education: "BS in Medical Technology, Ohio State University",
        certifications: ["MLT", "Blood Bank Technology"]
      },
      {
        id: "staff_003",
        name: "Emily Martinez",
        role: "Receptionist",
        department: "Administration",
        email: "emily.martinez@healthcare.com",
        phone: "555-456-7890",
        hireDate: "2021-01-10",
        status: "Active",
        education: "Associates Degree in Healthcare Administration",
        certifications: ["Medical Office Assistant"]
      },
      {
        id: "staff_004",
        name: "Michael Wong",
        role: "Pharmacist",
        department: "Pharmacy",
        email: "michael.wong@healthcare.com",
        phone: "555-789-0123",
        hireDate: "2018-09-05",
        status: "Active",
        education: "PharmD, University of California",
        certifications: ["RPh", "Immunization Certification"]
      },
      {
        id: "staff_005",
        name: "Jennifer Smith",
        role: "Nurse",
        department: "Outpatient",
        email: "jennifer.smith@healthcare.com",
        phone: "555-234-5678",
        hireDate: "2020-07-22",
        status: "On Leave",
        education: "BSN, University of Washington",
        certifications: ["RN", "Wound Care Certification"]
      }
    ];
  };

  // Filter staff based on search term and filters
  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = !searchTerm || 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phone.includes(searchTerm) ||
      staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !filters.role || staff.role === filters.role;
    const matchesDepartment = !filters.department || staff.department === filters.department;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const handleViewDetails = (staff) => {
    setSelectedStaff(staff);
    setShowDetailsModal(true);
  };

  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setShowAddStaffModal(true);
  };

  const handleDeleteStaff = (staffId) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      // In a real app, this would be an API call
      setStaffMembers(staffMembers.filter(s => s.id !== staffId));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'badge-success';
      case 'on leave':
        return 'badge-warning';
      case 'inactive':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className="staff-management-container">
      {isLoading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading staff data...</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="no-results">
          <i className="fas fa-search"></i>
          <p>No staff members found with the current filters.</p>
          <button 
            className="clear-filters-btn"
            onClick={() => window.location.reload()}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="staff-list">
          <div className="staff-table-container">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(staff => (
                  <tr key={staff.id}>
                    <td className="staff-name">
                      <span>{staff.name}</span>
                    </td>
                    <td>{staff.role}</td>
                    <td>{staff.department}</td>
                    <td>
                      <a href={`mailto:${staff.email}`}>{staff.email}</a>
                    </td>
                    <td>{staff.phone}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(staff.status)}`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn view-btn" 
                        onClick={() => handleViewDetails(staff)}
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEditStaff(staff)}
                        title="Edit Staff"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDeleteStaff(staff.id)}
                        title="Delete Staff"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="staff-metrics">
            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="metric-data">
                <h3>Total Staff</h3>
                <p>{staffMembers.length}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-user-nurse"></i>
              </div>
              <div className="metric-data">
                <h3>Nurses</h3>
                <p>{staffMembers.filter(s => s.role === "Nurse").length}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-pills"></i>
              </div>
              <div className="metric-data">
                <h3>Pharmacists</h3>
                <p>{staffMembers.filter(s => s.role === "Pharmacist").length}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-flask"></i>
              </div>
              <div className="metric-data">
                <h3>Lab Technicians</h3>
                <p>{staffMembers.filter(s => s.role === "Lab Technician").length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for staff details modal */}
      {showDetailsModal && selectedStaff && (
        <div className="modal-placeholder">
          <div className="modal-content">
            <h3>Staff Details - {selectedStaff.name}</h3>
            <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="details-grid">
              <div className="detail-item">
                <label>ID:</label>
                <span>{selectedStaff.id}</span>
              </div>
              <div className="detail-item">
                <label>Role:</label>
                <span>{selectedStaff.role}</span>
              </div>
              <div className="detail-item">
                <label>Department:</label>
                <span>{selectedStaff.department}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{selectedStaff.email}</span>
              </div>
              <div className="detail-item">
                <label>Phone:</label>
                <span>{selectedStaff.phone}</span>
              </div>
              <div className="detail-item">
                <label>Hire Date:</label>
                <span>{selectedStaff.hireDate}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span>{selectedStaff.status}</span>
              </div>
              <div className="detail-item">
                <label>Education:</label>
                <span>{selectedStaff.education}</span>
              </div>
              <div className="detail-item">
                <label>Certifications:</label>
                <span>{selectedStaff.certifications.join(", ")}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
              <button className="btn-primary" onClick={() => {
                setShowDetailsModal(false);
                handleEditStaff(selectedStaff);
              }}>Edit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement; 