import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Briefcase,
  Building,
  MapPin,
  Filter,
  TrendingUp,
  Users,
  Star,
  ChevronRight,
  Activity
} from 'lucide-react';

const Applications = () => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    rejected: 0,
    active: 0,
    successful: 0
  });

  useEffect(() => {
    if (user && token) {
      loadApplications();
    }
  }, [user, token]);

  useEffect(() => {
    filterApplications();
  }, [applications, statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Loading applications for user:', user._id);
      
      // Use the new getUserApplications API
      const response = await apiService.getUserApplications(user._id, {}, token);
      console.log('📊 Applications response:', response);
      
      const applicationsData = response.data.applications || [];
      console.log('📋 Applications data:', applicationsData);
      
      setApplications(applicationsData);
      
      // Set stats if available
      if (response.data.stats) {
        console.log('📈 Application stats:', response.data.stats);
        setStats({
          total: response.data.stats.totalApplications || applicationsData.length,
          pending: response.data.stats.pendingApplications || 0,
          shortlisted: response.data.stats.shortlistedApplications || 0,
          rejected: response.data.stats.rejectedApplications || 0,
          active: applicationsData.filter(app => ['pending', 'reviewed', 'shortlisted', 'interviewed'].includes(app.status)).length,
          successful: applicationsData.filter(app => app.status === 'offered').length
        });
      } else {
        // Calculate stats from applications data
        const total = applicationsData.length;
        const pending = applicationsData.filter(app => app.status === 'pending').length;
        const shortlisted = applicationsData.filter(app => app.status === 'shortlisted').length;
        const rejected = applicationsData.filter(app => app.status === 'rejected').length;
        const active = applicationsData.filter(app => ['pending', 'reviewed', 'shortlisted', 'interviewed'].includes(app.status)).length;
        const successful = applicationsData.filter(app => app.status === 'offered').length;
        
        setStats({ total, pending, shortlisted, rejected, active, successful });
      }
      
    } catch (err) {
      console.error('Error fetching applications:', err);
      
      // Provide specific error messages based on error type
      if (err.message.includes('Access denied') || err.message.includes('403')) {
        setError('Access denied. You need a jobseeker account to view applications. Please contact support if you believe this is an error.');
      } else if (err.message.includes('Authentication failed') || err.message.includes('401')) {
        setError('Your session has expired. Please log in again.');
      } else if (err.message.includes('Server error') || err.message.includes('500')) {
        setError('Server error occurred. Please try again later or contact support if the problem persists.');
      } else {
        setError('Failed to load applications. Please try again.');
      }
      
      // Set empty applications array on error
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      interviewed: 'bg-orange-100 text-orange-800',
      offered: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      reviewed: Eye,
      shortlisted: FileText,
      interviewed: Briefcase,
      offered: CheckCircle,
      rejected: XCircle,
      withdrawn: XCircle
    };
    return icons[status] || Clock;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysSinceApplied = (dateString) => {
    const appliedDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - appliedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleWithdrawApplication = async (applicationId) => {
    try {
      await apiService.withdrawApplication(applicationId, token);
      // Reload applications after withdrawal
      await loadApplications();
    } catch (err) {
      setError('Failed to withdraw application. Please try again.');
      console.error('Error withdrawing application:', err);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Applications' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interviewed', label: 'Interviewed' },
    { value: 'offered', label: 'Offered' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ];

  // Safety check: Ensure only jobseekers can access this page
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  if (user.userType !== 'jobseeker') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need a jobseeker account to view applications.</p>
          <p className="text-sm text-gray-500">Current user type: {user.userType}</p>
          <button 
            onClick={() => window.location.href = '/dashboard'} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                My Applications
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Track the status of your job applications
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        )}

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-blue-50 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +12% this month
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-yellow-50 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                    Awaiting response
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-green-50 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Applications</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <Activity className="h-3 w-3 mr-1 text-green-500" />
                    In progress
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-purple-50 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Offers Received</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.successful}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <Star className="h-3 w-3 mr-1 text-purple-500" />
                    Success rate
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </div>
          </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center">
                <div className="p-2 bg-gray-50 rounded-xl mr-3">
                  <Filter className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Filter Applications</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      statusFilter === option.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {!loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredApplications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredApplications.map((application) => {
                const StatusIcon = getStatusIcon(application.status);
                const daysSinceApplied = getDaysSinceApplied(application.createdAt);
                
                return (
                  <div key={application._id} className="p-6 hover:bg-gray-50 transition-all duration-200 group">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Job Information */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {application.job?.title || 'Job Title Not Available'}
                            </h3>
                            <div className="flex items-center text-gray-700 mb-2">
                              <div className="p-1 bg-blue-50 rounded-lg mr-2">
                                <Building className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="font-medium">{application.job?.companyName || 'Company Not Available'}</span>
                            </div>
                            <div className="flex flex-wrap items-center text-gray-500 text-sm gap-4">
                              <div className="flex items-center">
                                <div className="p-1 bg-green-50 rounded-lg mr-2">
                                  <MapPin className="h-4 w-4 text-green-600" />
                                </div>
                                <span>{application.job?.location || 'Location not specified'}</span>
                              </div>
                              <div className="flex items-center">
                                <div className="p-1 bg-purple-50 rounded-lg mr-2">
                                  <Calendar className="h-4 w-4 text-purple-600" />
                                </div>
                                <span>Applied {formatDate(application.createdAt)}</span>
                              </div>
                              <div className="flex items-center">
                                <div className="p-1 bg-yellow-50 rounded-lg mr-2">
                                  <Clock className="h-4 w-4 text-yellow-600" />
                                </div>
                                <span>{daysSinceApplied} days ago</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex items-center">
                            <div className="p-1 bg-gray-50 rounded-lg mr-2">
                              <StatusIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="flex gap-3">
                            <button
                              onClick={() => setSelectedApplication(application)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center transition-colors duration-200"
                            >
                              View Details
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </button>
                            {application.status === 'pending' && (
                              <button 
                                onClick={() => handleWithdrawApplication(application._id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center transition-colors duration-200"
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No applications found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {statusFilter === 'all' 
                  ? "You haven't applied to any jobs yet. Start exploring opportunities!"
                  : `No applications with status "${statusFilter}" found.`
                }
              </p>
              {statusFilter === 'all' && (
                <a
                  href="/jobs"
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md inline-flex items-center"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Browse Jobs
                </a>
              )}
            </div>
            )}
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                    {selectedApplication.jobTitle}
                  </h2>
                  <div className="flex items-center text-gray-600">
                    <div className="p-1 bg-blue-50 rounded-lg mr-2">
                      <Building className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{selectedApplication.company}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <XCircle className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-50 rounded-xl mr-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Application Details</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Applied Date</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedApplication.appliedDate)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                        {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                      </span>
                    </div>
                    <div className="bg-white p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Resume</p>
                      <p className="font-medium text-gray-900">{selectedApplication.resume || 'Not provided'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Expected Salary</p>
                      <p className="font-medium text-gray-900">{selectedApplication.expectedSalary || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {selectedApplication.coverLetter && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-green-50 rounded-xl mr-3">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Cover Letter</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedApplication.coverLetter}</p>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-purple-50 rounded-xl mr-3">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Portfolio Links</h3>
                  </div>
                  <div className="bg-white p-6 rounded-xl space-y-3">
                    {selectedApplication.portfolio && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">Portfolio</span>
                        <a href={selectedApplication.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                          View Link →
                        </a>
                      </div>
                    )}
                    {selectedApplication.linkedin && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">LinkedIn</span>
                        <a href={selectedApplication.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                          View Profile →
                        </a>
                      </div>
                    )}
                    {selectedApplication.github && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">GitHub</span>
                        <a href={selectedApplication.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                          View Profile →
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Close
                  </button>
                  {selectedApplication.status === 'pending' && (
                    <button className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md">
                      Withdraw Application
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
