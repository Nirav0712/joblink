import React, { useState, useEffect } from 'react';
import { X, Users, Download, Mail, Phone, Calendar, CheckCircle, Clock, AlertCircle, User } from 'lucide-react';
import apiService from '../services/api';

const ViewApplicationsModal = ({ isOpen, onClose, job, token, onStatusUpdate }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (isOpen && job) {
      fetchApplications();
    }
  }, [isOpen, job, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await apiService.getJobApplications(job._id, params, token);
      setApplications(response.data.applications || []);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await apiService.updateApplicationStatus(applicationId, newStatus, '', token);
      fetchApplications(); // Refresh the list
      if (onStatusUpdate) {
        onStatusUpdate(); // Update parent dashboard
      }
    } catch (err) {
      setError(err.message || 'Failed to update application status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-purple-100 text-purple-800',
      shortlisted: 'bg-green-100 text-green-800',
      interviewed: 'bg-yellow-100 text-yellow-800',
      offered: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      reviewed: CheckCircle,
      shortlisted: CheckCircle,
      interviewed: Calendar,
      offered: CheckCircle,
      rejected: AlertCircle,
      withdrawn: X
    };
    return icons[status] || Clock;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-600" />
              Applications for "{job?.title}"
            </h2>
            <p className="text-gray-600 mt-1">{job?.companyName} • {job?.location}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewed">Interviewed</option>
              <option value="offered">Offered</option>
              <option value="rejected">Rejected</option>
            </select>
            <span className="text-sm text-gray-500">
              {applications.length} application{applications.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading applications...</span>
            </div>
          ) : applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => {
                const StatusIcon = getStatusIcon(application.status);
                return (
                  <div key={application._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <img
                          src={application.applicant?.avatar || `https://ui-avatars.com/api/?name=${application.applicant?.name}&background=10b981&color=fff`}
                          alt={application.applicant?.name}
                          className="h-12 w-12 rounded-full shadow-sm"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.applicant?.name || 'Unknown Candidate'}
                            </h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(application.status)}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-4 w-4 mr-2" />
                                {application.applicant?.email || 'No email provided'}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <User className="h-4 w-4 mr-2" />
                                {application.applicant?.profile?.experience || 'Experience not specified'}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                Applied {formatTimeAgo(application.createdAt)}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {application.applicant?.profile?.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="h-4 w-4 mr-2" />
                                  {application.applicant.profile.phone}
                                </div>
                              )}
                              {application.applicant?.profile?.location && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <User className="h-4 w-4 mr-2" />
                                  {application.applicant.profile.location}
                                </div>
                              )}
                              {application.expectedSalary && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <span className="font-medium">Expected Salary:</span>
                                  <span className="ml-2">${application.expectedSalary.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Skills */}
                          {application.applicant?.profile?.skills && application.applicant.profile.skills.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Skills:</h4>
                              <div className="flex flex-wrap gap-2">
                                {application.applicant.profile.skills.slice(0, 6).map((skill, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    {skill}
                                  </span>
                                ))}
                                {application.applicant.profile.skills.length > 6 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                                    +{application.applicant.profile.skills.length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Cover Letter */}
                          {application.coverLetter && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Cover Letter:</h4>
                              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 max-h-24 overflow-y-auto">
                                {application.coverLetter}
                              </p>
                            </div>
                          )}

                          {/* Additional Info */}
                          {application.additionalInfo && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Information:</h4>
                              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 max-h-24 overflow-y-auto">
                                {application.additionalInfo}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 ml-4">
                        {application.resume && (
                          <a
                            href={application.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Resume
                          </a>
                        )}
                        
                        {application.portfolio && (
                          <a
                            href={application.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                          >
                            <User className="h-4 w-4 mr-1" />
                            Portfolio
                          </a>
                        )}

                        {/* Status Update Buttons */}
                        <div className="flex flex-col space-y-1">
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(application._id, 'reviewed')}
                                className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors"
                              >
                                Mark Reviewed
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(application._id, 'shortlisted')}
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                              >
                                Shortlist
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(application._id, 'rejected')}
                                className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          {application.status === 'reviewed' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(application._id, 'shortlisted')}
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                              >
                                Shortlist
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(application._id, 'rejected')}
                                className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          {application.status === 'shortlisted' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(application._id, 'interviewed')}
                                className="px-3 py-1 bg-yellow-600 text-white rounded text-xs font-medium hover:bg-yellow-700 transition-colors"
                              >
                                Schedule Interview
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(application._id, 'offered')}
                                className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 transition-colors"
                              >
                                Make Offer
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No applications yet</h3>
              <p className="text-sm">Applications for this job will appear here when candidates apply</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicationsModal;
