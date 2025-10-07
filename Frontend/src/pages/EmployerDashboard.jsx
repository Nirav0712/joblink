import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, 
  Briefcase, 
  Users, 
  Bell, 
  Plus,
  Eye,
  Calendar,
  TrendingUp,
  MapPin,
  DollarSign,
  CheckCircle,
  Clock,
  FileText,
  Star,
  ChevronRight,
  Settings,
  Activity,
  Target,
  UserCheck,
  Edit3,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import EditJobModal from '../components/EditJobModal';
import DeleteJobModal from '../components/DeleteJobModal';
import ViewApplicationsModal from '../components/ViewApplicationsModal';

const EmployerDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [editJobModal, setEditJobModal] = useState({ isOpen: false, job: null });
  const [deleteJobModal, setDeleteJobModal] = useState({ isOpen: false, job: null });
  const [viewApplicationsModal, setViewApplicationsModal] = useState({ isOpen: false, job: null });
  const [deletingJobId, setDeletingJobId] = useState(null);

  // Safety check: Ensure only employers can access this dashboard
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

  if (user.userType !== 'employer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need an employer account to access this dashboard.</p>
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

  useEffect(() => {
    console.log('🔄 EmployerDashboard useEffect triggered');
    console.log('👤 User:', user);
    console.log('🔑 Token:', token ? 'Token exists' : 'No token');
    
    if (user && token) {
      console.log('✅ User and token available, fetching dashboard data');
      fetchDashboardData();
    } else {
      console.log('❌ Missing user or token, not fetching data');
    }
  }, [user, token]);

  // Cleanup effect to reset loading state on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 EmployerDashboard cleanup - resetting loading states');
      setDeletingJobId(null);
      setDeleteJobModal({ isOpen: false, job: null });
    };
  }, []);

  // Safety timeout to reset loading state if it gets stuck
  useEffect(() => {
    if (deletingJobId) {
      const safetyTimeout = setTimeout(() => {
        console.log('⚠️ Safety timeout triggered - resetting loading state');
        setDeletingJobId(null);
        setError('Delete operation timed out. Please try again.');
      }, 35000); // 35 second safety timeout

      return () => clearTimeout(safetyTimeout);
    }
  }, [deletingJobId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Current user:', user);
      console.log('🔍 User type:', user?.userType);
      console.log('🔍 Token exists:', !!token);
      
      // Fetch employer dashboard stats
      const statsResponse = await apiService.getUserDashboardStats(token);
      const dashboardStats = statsResponse.data.stats;
      
      // Fetch employer's jobs
      console.log('🔍 Fetching employer jobs...');
      const jobsResponse = await apiService.apiCall('/jobs/employer/my-jobs', {}, token);
      console.log('📊 Jobs response:', jobsResponse);
      
      // Fetch recent applications for employer dashboard
      const applicationsResponse = await apiService.apiCall('/applications/employer/dashboard', {}, token);
      
      // Format stats for display
      const formattedStats = [
        { 
          name: 'Active Job Postings', 
          value: dashboardStats.activeJobs || '0', 
          icon: Briefcase, 
          color: 'blue', 
          change: `${dashboardStats.totalJobs - dashboardStats.activeJobs} inactive` 
        },
        { 
          name: 'Applications Received', 
          value: dashboardStats.totalApplications || '0', 
          icon: Users, 
          color: 'green', 
          change: `${dashboardStats.pendingApplications || 0} pending review` 
        },
        { 
          name: 'Candidates Shortlisted', 
          value: dashboardStats.shortlistedApplications || '0', 
          icon: CheckCircle, 
          color: 'purple', 
          change: `${dashboardStats.reviewedApplications || 0} reviewed` 
        },
        { 
          name: 'Interviews Scheduled', 
          value: dashboardStats.offeredApplications || '0', 
          icon: Calendar, 
          color: 'orange', 
          change: 'Manage interviews' 
        },
      ];
      
      setStats(formattedStats);
      const jobsData = jobsResponse.data.jobs || [];
      console.log('📝 Setting active jobs:', jobsData);
      setActiveJobs(jobsData);
      setRecentApplications(applicationsResponse.data.recentApplications || []);
      
      // Filter shortlisted candidates from recent applications
      const shortlisted = (applicationsResponse.data.recentApplications || [])
        .filter(app => app.status === 'shortlisted')
        .slice(0, 5);
      setShortlistedCandidates(shortlisted);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      // Provide specific error messages based on error type
      if (err.message.includes('Access denied') || err.message.includes('403')) {
        setError('Access denied. You need an employer account to view this dashboard. Please contact support if you believe this is an error.');
      } else if (err.message.includes('Authentication failed') || err.message.includes('401')) {
        setError('Your session has expired. Please log in again.');
      } else if (err.message.includes('Server error') || err.message.includes('500')) {
        setError('Server error occurred. Please try again later or contact support if the problem persists.');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
      
      // Set default empty data on error
      setStats([
        { name: 'Active Job Postings', value: '0', icon: Briefcase, color: 'blue', change: 'No data' },
        { name: 'Applications Received', value: '0', icon: Users, color: 'green', change: 'No data' },
        { name: 'Candidates Shortlisted', value: '0', icon: CheckCircle, color: 'purple', change: 'No data' },
        { name: 'Interviews Scheduled', value: '0', icon: Calendar, color: 'orange', change: 'No data' },
      ]);
      setActiveJobs([]);
      setRecentApplications([]);
      setShortlistedCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format time ago
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

  // Helper function to format salary
  const formatSalary = (salary) => {
    if (!salary) return 'Salary not specified';
    const { min, max, currency = 'USD' } = salary;
    return `${currency} ${min?.toLocaleString()} - ${max?.toLocaleString()}`;
  };

  // Handle application status update
  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await apiService.updateApplicationStatus(applicationId, newStatus, '', token);
      // Refresh dashboard data
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status. Please try again.');
    }
  };

  // Modal handlers
  const handleEditJob = (job) => {
    setEditJobModal({ isOpen: true, job });
  };

  const handleDeleteJob = (job) => {
    console.log('🗑️ Delete button clicked for job:', job);
    console.log('📝 Job ID:', job._id);
    console.log('📝 Job title:', job.title);
    
    // Don't set deletingJobId here - only set it when actually deleting
    setDeleteJobModal({ isOpen: true, job });
    
    console.log('✅ Delete modal state updated');
  };

  const handleViewApplications = (job) => {
    setViewApplicationsModal({ isOpen: true, job });
  };

  const handleJobUpdated = () => {
    fetchDashboardData(); // Refresh dashboard data
  };

  const handleJobDeleted = async () => {
    try {
      const deletedJobId = deleteJobModal.job._id;
      
      console.log('🚀 Starting delete process for job:', deletedJobId);
      
      // Set loading state
      setDeletingJobId(deletedJobId);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
      );
      
      console.log('🌐 Making API call to delete job...');
      
      // Call API to delete from database first
      await Promise.race([
        apiService.deleteJob(deletedJobId, token),
        timeoutPromise
      ]);
      
      console.log('✅ API call successful, updating UI...');
      
      // Only after successful API call:
      // 1. Remove job from UI state
      setActiveJobs(prevJobs => prevJobs.filter(job => job._id !== deletedJobId));
      
      // 2. Close modal and clear deleting state
      setDeleteJobModal({ isOpen: false, job: null });
      setDeletingJobId(null);
      
      console.log('✅ Job deleted successfully from database and UI');
      
    } catch (err) {
      console.error('❌ Failed to delete job:', err);
      
      // Always clear loading state on error
      setDeletingJobId(null);
      
      // Handle different types of errors
      if (err.message && err.message.includes('timeout')) {
        setError('Request timed out. Please check your connection and try again.');
      } else if (err.message && err.message.includes('401')) {
        setError('Your session has expired. Please log in again.');
        // Don't logout automatically, let user decide
      } else if (err.message && err.message.includes('403')) {
        setError('You are not authorized to delete this job.');
      } else if (err.message && err.message.includes('404')) {
        setError('Job not found. It may have already been deleted.');
      } else {
        setError('Failed to delete job. Please try again.');
      }
      
      // Don't modify UI state on error - keep the job visible
      // User can try again or refresh the page
    }
  };

  const handleApplicationStatusUpdate = () => {
    fetchDashboardData(); // Refresh dashboard data
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-purple-100 text-purple-800',
      shortlisted: 'bg-green-100 text-green-800',
      interviewed: 'bg-yellow-100 text-yellow-800',
      offered: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.active;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100'
    };
    return colors[color] || colors.blue;
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'jobs', name: 'Job Postings', icon: Briefcase },
    { id: 'applications', name: 'Applications', icon: Users },
    { id: 'candidates', name: 'Shortlisted', icon: CheckCircle }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
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
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Here's what's happening with your hiring process today.
              </p>
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                  <button 
                    onClick={fetchDashboardData}
                    className="text-red-600 hover:text-red-700 text-sm font-medium mt-1"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Active</span>
                </div>
              </div>
              <Link to="/settings" className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                <Settings className="h-5 w-5 text-gray-600" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl ${getColorClasses(stat.color)} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      {stat.change}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
            <nav className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Recent Applications */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Recent Applications
                    </h2>
                    <Link to="/applications" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                      View all <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {recentApplications.length > 0 ? (
                      recentApplications.slice(0, 3).map((application) => (
                        <div key={application._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                        <div className="flex items-center">
                            <img 
                              src={application.applicant?.avatar || `https://ui-avatars.com/api/?name=${application.applicant?.name}&background=10b981&color=fff`} 
                              alt={application.applicant?.name} 
                              className="h-10 w-10 rounded-full shadow-sm" 
                            />
                          <div className="ml-3">
                              <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                                {application.applicant?.name || 'Unknown Candidate'}
                              </h3>
                              <p className="text-xs text-gray-600">{application.job?.title || 'Unknown Job'}</p>
                              <p className="text-xs text-gray-500">
                                {application.applicant?.profile?.experience || `${Math.floor(Math.random() * 5) + 1} years experience`}
                              </p>
                              {application.expectedSalary && (
                                <p className="text-xs text-green-600 font-medium">
                                  Expected: ${application.expectedSalary?.toLocaleString()}
                                </p>
                              )}
                            </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(application.status)}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                            <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(application.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No applications yet</p>
                        <p className="text-sm">Applications will appear here when candidates apply to your jobs</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Jobs */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                      Active Job Postings
                    </h2>
                    <button 
                      onClick={() => setActiveTab('jobs')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                    >
                      Manage all <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {activeJobs.length > 0 ? (
                      activeJobs.slice(0, 3).map((job) => (
                        <div key={job._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                        <div className="flex items-center">
                            <img 
                              src={job.company?.logo || `https://ui-avatars.com/api/?name=${job.companyName}&background=3b82f6&color=fff`} 
                              alt={job.companyName} 
                              className="h-10 w-10 rounded-xl shadow-sm" 
                            />
                          <div className="ml-3">
                            <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{job.title}</h3>
                            <p className="text-xs text-gray-600">{job.location}</p>
                              <p className="text-xs text-gray-500">{job.applicationCount || 0} applications</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.isActive ? 'active' : 'inactive')}`}>
                              {job.isActive ? 'Active' : 'Inactive'}
                          </span>
                            <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(job.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No job postings yet</p>
                        <p className="text-sm">Create your first job posting to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                  Your Job Postings
                </h2>
                <Link to="/post-job" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-200 flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Link>
              </div>
              <div className="space-y-4">
                {console.log('📊 Active jobs count:', activeJobs.length)}
                {console.log('📊 Active jobs data:', activeJobs)}
                {activeJobs.length > 0 ? (
                  activeJobs.map((job) => {
                    console.log('📝 Rendering job:', job._id, job.title);
                    return (
                    <div key={job._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                    <div className="flex items-center">
                        <img 
                          src={job.company?.logo || `https://ui-avatars.com/api/?name=${job.companyName}&background=3b82f6&color=fff`} 
                          alt={job.companyName} 
                          className="h-12 w-12 rounded-xl shadow-sm" 
                        />
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.location}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <DollarSign className="h-4 w-4 mr-1" />
                            {formatSalary(job.salary)}
                          </div>
                      </div>
                    </div>
                    <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.isActive ? 'active' : 'inactive')}`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                        <p className="text-sm text-gray-500 mt-2">{job.applicationCount || 0} applications</p>
                        <p className="text-xs text-gray-500">Posted {formatTimeAgo(job.createdAt)}</p>
                      <div className="mt-2 space-x-2">
                          <button
                            onClick={() => handleViewApplications(job)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                          View Applications
                        </button>
                          <button
                            onClick={() => handleEditJob(job)}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors inline-flex items-center"
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                          <button
                            onClick={() => handleDeleteJob(job)}
                            disabled={deletingJobId === job._id}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center ${
                              deletingJobId === job._id
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            {deletingJobId === job._id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No job postings yet</h3>
                    <p className="text-sm mb-4">Create your first job posting to start attracting candidates</p>
                    <Link 
                      to="/post-job"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Post Your First Job
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                All Applications
              </h2>
              <div className="space-y-4">
                {recentApplications.length > 0 ? (
                  recentApplications.map((application) => (
                    <div key={application._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                    <div className="flex items-center">
                        <img 
                          src={application.applicant?.avatar || `https://ui-avatars.com/api/?name=${application.applicant?.name}&background=10b981&color=fff`} 
                          alt={application.applicant?.name} 
                          className="h-12 w-12 rounded-full shadow-sm" 
                        />
                      <div className="ml-4">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {application.applicant?.name || 'Unknown Candidate'}
                          </h3>
                          <p className="text-sm text-gray-600">{application.job?.title || 'Unknown Job'}</p>
                          <p className="text-sm text-gray-500">
                            {application.applicant?.profile?.experience || `${Math.floor(Math.random() * 5) + 1} years experience`}
                          </p>
                          {application.expectedSalary && (
                            <p className="text-sm text-green-600 font-medium">
                              Expected: ${application.expectedSalary?.toLocaleString()}
                            </p>
                          )}
                          {application.applicant?.email && (
                            <p className="text-xs text-gray-500">
                              {application.applicant.email}
                            </p>
                          )}
                        <div className="flex flex-wrap gap-1 mt-2">
                            {(application.applicant?.profile?.skills && application.applicant.profile.skills.length > 0 
                              ? application.applicant.profile.skills.slice(0, 3)
                              : ['JavaScript', 'React', 'Node.js'].slice(0, 3)
                            ).map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                        <p className="text-sm text-gray-500 mt-2">Applied {formatTimeAgo(application.createdAt)}</p>
                      <div className="mt-2 space-x-2">
                          <Link 
                            to={`/users/${application.applicant?._id}`}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                          View Profile
                          </Link>
                          {application.status === 'pending' && (
                            <button 
                              onClick={() => handleStatusUpdate(application._id, 'shortlisted')}
                              className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                          Shortlist
                        </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                    <p className="text-sm mb-4">Applications will appear here when candidates apply to your jobs</p>
                    <Link 
                      to="/post-job"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Post a Job
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'candidates' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                Shortlisted Candidates
              </h2>
              <div className="space-y-4">
                {shortlistedCandidates.length > 0 ? (
                  shortlistedCandidates.map((candidate) => (
                    <div key={candidate._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                    <div className="flex items-center">
                        <img 
                          src={candidate.applicant?.avatar || `https://ui-avatars.com/api/?name=${candidate.applicant?.name}&background=06b6d4&color=fff`} 
                          alt={candidate.applicant?.name} 
                          className="h-12 w-12 rounded-full shadow-sm" 
                        />
                      <div className="ml-4">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {candidate.applicant?.name || 'Unknown Candidate'}
                          </h3>
                          <p className="text-sm text-gray-600">{candidate.job?.title || 'Unknown Job'}</p>
                          <p className="text-sm text-gray-500">
                            {candidate.applicant?.profile?.experience || 'Experience not specified'}
                          </p>
                        <div className="flex items-center text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full mt-2">
                          <Star className="h-4 w-4 mr-1" />
                            Shortlisted
                          </div>
                      </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Shortlisted {formatTimeAgo(candidate.createdAt)}</p>
                      <div className="mt-2 space-x-2">
                          <button 
                            onClick={() => handleStatusUpdate(candidate._id, 'interviewed')}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                          Schedule Interview
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <UserCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No shortlisted candidates yet</h3>
                    <p className="text-sm mb-4">Shortlisted candidates will appear here when you review applications</p>
                    <Link 
                      to="/applications"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Review Applications
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link to="/post-job" className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-200">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Post a Job</h3>
            <p className="text-gray-600 text-sm mt-2">Create a new job listing</p>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
              Get started <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
          
          <Link to="/company-profile" className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-200">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Company Profile</h3>
            <p className="text-gray-600 text-sm mt-2">Update your company information</p>
            <div className="mt-4 flex items-center text-green-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
              Update <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
          
          <Link to="/candidates" className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors duration-200">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Candidate Search</h3>
            <p className="text-gray-600 text-sm mt-2">Search our candidate database</p>
            <div className="mt-4 flex items-center text-purple-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
              Search <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* Modals */}
      <EditJobModal
        isOpen={editJobModal.isOpen}
        onClose={() => setEditJobModal({ isOpen: false, job: null })}
        job={editJobModal.job}
        onJobUpdated={handleJobUpdated}
        token={token}
      />

      <DeleteJobModal
        isOpen={deleteJobModal.isOpen}
        onClose={() => {
          console.log('🚪 Delete modal close requested');
          console.log('🔍 Current deletingJobId:', deletingJobId);
          
          // Force close modal and reset loading state
          setDeleteJobModal({ isOpen: false, job: null });
          setDeletingJobId(null);
          console.log('✅ Delete modal force closed and loading state reset');
        }}
        onConfirm={handleJobDeleted}
        job={deleteJobModal.job}
        loading={deletingJobId === deleteJobModal.job?._id}
      />

      <ViewApplicationsModal
        isOpen={viewApplicationsModal.isOpen}
        onClose={() => setViewApplicationsModal({ isOpen: false, job: null })}
        job={viewApplicationsModal.job}
        token={token}
        onStatusUpdate={handleApplicationStatusUpdate}
      />
    </div>
  );
};

export default EmployerDashboard;
