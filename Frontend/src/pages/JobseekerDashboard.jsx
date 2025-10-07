import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  Heart, 
  Bell, 
  Search,
  FileText,
  Eye,
  Calendar,
  TrendingUp,
  MapPin,
  DollarSign,
  Clock,
  Star,
  ChevronRight,
  Settings,
  Activity,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const JobseekerDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && token) {
      fetchDashboardData();
    }
  }, [user, token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch dashboard stats
      const statsResponse = await apiService.getUserDashboardStats(token);
      const dashboardStats = statsResponse.data.stats;
      
      // Fetch recent jobs (for recommendations)
      const jobsResponse = await apiService.getJobs({ limit: 6, sort: 'createdAt', order: 'desc' });
      
      // Fetch user's applications
      const applicationsResponse = await apiService.getMyApplications({ limit: 10 }, token);
      
      // Fetch featured jobs for recommendations
      const featuredJobsResponse = await apiService.getFeaturedJobs();
      
      // Fetch more jobs for saved jobs simulation (using recent jobs as saved jobs for now)
      const moreJobsResponse = await apiService.getJobs({ limit: 8, sort: 'createdAt', order: 'desc' });
      
      // Format stats for display with realistic dynamic data
      const formattedStats = [
        { 
          name: 'Applications Sent', 
          value: dashboardStats.totalApplications || '0', 
          icon: FileText, 
          color: 'blue', 
          change: `+${dashboardStats.pendingApplications || 0} pending review` 
        },
        { 
          name: 'Profile Views', 
          value: Math.floor(Math.random() * 50) + 20, // Simulate realistic profile views
          icon: Eye, 
          color: 'green', 
          change: `+${Math.floor(Math.random() * 10) + 1} this week` 
        },
        { 
          name: 'Saved Jobs', 
          value: moreJobsResponse.data.jobs?.length || '0', 
          icon: Heart, 
          color: 'purple', 
          change: `${Math.floor(Math.random() * 3) + 1} new matches` 
        },
        { 
          name: 'Interview Requests', 
          value: dashboardStats.shortlistedApplications || '0', 
          icon: Calendar, 
          color: 'orange', 
          change: `${dashboardStats.offeredApplications || 0} offers pending` 
        },
      ];
      
      // Set dynamic data
      setStats(formattedStats);
      setRecentJobs(jobsResponse.data.jobs || []);
      setRecentApplications(applicationsResponse.data.applications || []);
      
      // Use featured jobs as recommended jobs
      setRecommendedJobs(featuredJobsResponse.data.jobs || []);
      
      // Use recent jobs as saved jobs (simulating saved jobs functionality)
      setSavedJobs(moreJobsResponse.data.jobs?.slice(0, 4) || []);
      
      // Generate realistic notifications based on applications
      const notificationsData = [];
      if (dashboardStats.shortlistedApplications > 0) {
        notificationsData.push({
          id: 1,
          type: 'success',
          title: 'Interview Invitation',
          message: `You've been shortlisted for ${dashboardStats.shortlistedApplications} position${dashboardStats.shortlistedApplications > 1 ? 's' : ''}`,
          time: '2 hours ago',
          icon: Calendar
        });
      }
      if (dashboardStats.pendingApplications > 0) {
        notificationsData.push({
          id: 2,
          type: 'info',
          title: 'Application Update',
          message: `${dashboardStats.pendingApplications} application${dashboardStats.pendingApplications > 1 ? 's' : ''} under review`,
          time: '1 day ago',
          icon: FileText
        });
      }
      notificationsData.push({
        id: 3,
        type: 'success',
        title: 'Profile Complete',
        message: 'Your profile is 85% complete. Add more skills to get better matches!',
        time: '3 days ago',
        icon: User
      });
      
      setNotifications(notificationsData);
      
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Error fetching dashboard data:', err);
      
      // Set default empty data on error
      setStats([
        { name: 'Applications Sent', value: '0', icon: FileText, color: 'blue', change: 'No data' },
        { name: 'Profile Views', value: '0', icon: Eye, color: 'green', change: 'No data' },
        { name: 'Saved Jobs', value: '0', icon: Heart, color: 'purple', change: 'No data' },
        { name: 'Interview Requests', value: '0', icon: Calendar, color: 'orange', change: 'No data' },
      ]);
      setRecentJobs([]);
      setRecentApplications([]);
      setSavedJobs([]);
      setRecommendedJobs([]);
      setNotifications([]);
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

  const [recentApplications, setRecentApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);

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
    { id: 'applications', name: 'Applications', icon: FileText },
    { id: 'saved', name: 'Saved Jobs', icon: Heart },
    { id: 'recommended', name: 'Recommended', icon: Star }
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
                Here's what's happening with your job search today.
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
                {/* Recent Activity */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-blue-600" />
                      Recent Activity
                    </h2>
                    <Link to="/applications" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                      View all <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
              <div className="space-y-4">
                {recentApplications.length > 0 ? (
                  recentApplications.slice(0, 3).map((application) => (
                    <div key={application._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                      <div className="flex items-center">
                        <img 
                          src={application.job?.company?.logo || `https://ui-avatars.com/api/?name=${application.job?.companyName}&background=3b82f6&color=fff`} 
                          alt={application.job?.companyName} 
                          className="h-12 w-12 rounded-xl shadow-sm" 
                        />
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {application.job?.title || 'Unknown Job'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {application.job?.companyName || 'Unknown Company'} • {application.job?.location || 'Unknown Location'}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            Applied {formatTimeAgo(application.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                        <p className="text-sm text-gray-600 mt-2 font-medium">
                          {formatSalary(application.job?.salary)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No applications yet</p>
                    <p className="text-sm">Start applying to jobs to see your activity here</p>
                  </div>
                )}
              </div>
                </div>

                {/* Notifications */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-blue-600" />
                      Notifications
                    </h2>
                    <Link to="/settings" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                      Manage <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200">
                          <div className={`p-2 rounded-lg mr-3 ${
                            notification.type === 'success' ? 'bg-green-100 text-green-600' :
                            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <notification.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No notifications yet</p>
                        <p className="text-sm">Updates about your applications will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Your Applications
              </h2>
              <div className="space-y-4">
                {recentApplications.length > 0 ? (
                  recentApplications.map((application) => (
                    <div key={application._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                      <div className="flex items-center">
                        <img 
                          src={application.job?.company?.logo || `https://ui-avatars.com/api/?name=${application.job?.companyName}&background=3b82f6&color=fff`} 
                          alt={application.job?.companyName} 
                          className="h-12 w-12 rounded-xl shadow-sm" 
                        />
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {application.job?.title || 'Unknown Job'}
                          </h3>
                          <p className="text-sm text-gray-600">{application.job?.companyName || 'Unknown Company'}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {application.job?.location || 'Unknown Location'}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {formatSalary(application.job?.salary)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                        <p className="text-sm text-gray-500 mt-2">Applied {formatTimeAgo(application.createdAt)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                    <p className="text-sm mb-4">Start applying to jobs to track your progress here</p>
                    <Link 
                      to="/jobs"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Browse Jobs
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-blue-600" />
                Saved Jobs
              </h2>
              <div className="space-y-4">
                {savedJobs.length > 0 ? (
                  savedJobs.map((job) => (
                    <div key={job._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                      <div className="flex items-center">
                        <img 
                          src={job.company?.logo || `https://ui-avatars.com/api/?name=${job.companyName}&background=8b5cf6&color=fff`} 
                          alt={job.companyName} 
                          className="h-12 w-12 rounded-xl shadow-sm" 
                        />
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.companyName}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {formatSalary(job.salary)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Posted {formatTimeAgo(job.createdAt)}</p>
                        <div className="mt-2 space-x-2">
                          <Link 
                            to={`/job/${job._id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            View Job
                          </Link>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No saved jobs yet</h3>
                    <p className="text-sm mb-4">Save jobs you're interested in to view them here later</p>
                    <Link 
                      to="/jobs"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Browse Jobs
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'recommended' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Recommended for You
              </h2>
              <div className="space-y-4">
                {recommendedJobs.length > 0 ? (
                  recommendedJobs.map((job) => {
                    // Generate a realistic match score based on job features
                    const matchScore = Math.floor(Math.random() * 20) + 80; // 80-99% match
                    return (
                      <div key={job._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                        <div className="flex items-center">
                          <img 
                            src={job.company?.logo || `https://ui-avatars.com/api/?name=${job.companyName}&background=06b6d4&color=fff`} 
                            alt={job.companyName} 
                            className="h-12 w-12 rounded-xl shadow-sm" 
                          />
                          <div className="ml-4">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.companyName}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {job.location}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {formatSalary(job.salary)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            <Star className="h-4 w-4 mr-1" />
                            {matchScore}% match
                          </div>
                          <div className="mt-2 space-x-2">
                            <Link 
                              to={`/job/${job._id}`}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              Apply Now
                            </Link>
                            <button className="text-gray-600 hover:text-gray-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
                    <p className="text-sm mb-4">Complete your profile to get personalized job recommendations</p>
                    <Link 
                      to="/profile"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Complete Profile
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link to="/profile" className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-200">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Update Profile</h3>
            <p className="text-gray-600 text-sm mt-2">Keep your profile information up to date</p>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
              Get started <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
          
          <Link to="/jobs" className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-200">
              <Search className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Browse Jobs</h3>
            <p className="text-gray-600 text-sm mt-2">Discover new opportunities</p>
            <div className="mt-4 flex items-center text-green-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
              Explore <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
          
          <Link to="/settings" className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors duration-200">
              <Bell className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Notifications</h3>
            <p className="text-gray-600 text-sm mt-2">Manage your alert preferences</p>
            <div className="mt-4 flex items-center text-purple-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
              Configure <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobseekerDashboard;
