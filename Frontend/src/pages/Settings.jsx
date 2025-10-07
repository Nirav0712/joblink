import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  Bell, 
  Shield, 
  Eye, 
  Mail, 
  Lock, 
  Trash2, 
  Save,
  AlertTriangle,
  User,
  Globe,
  Home,
  ChevronRight,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const SettingsPage = () => {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    jobAlerts: true,
    applicationUpdates: true,
    marketingEmails: false,
    pushNotifications: true
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [accountData, setAccountData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    location: user?.profile?.location || '',
    language: 'English',
    timezone: 'UTC-8 (Pacific Time)'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync account data with user data
  useEffect(() => {
    if (user) {
      setAccountData({
        name: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        location: user.profile?.location || '',
        language: 'English',
        timezone: 'UTC-8 (Pacific Time)'
      });
    }
  }, [user]);

  const handleAccountChange = (field, value) => {
    setAccountData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const saveSettings = async () => {
    try {
      setLoading(true);
      setError('');
      setSaveStatus('saving');

      // Check if user is authenticated
      if (!user || !localStorage.getItem('token')) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Prepare profile data for API
      const profileData = {
        name: accountData.name,
        profile: {
          phone: accountData.phone,
          location: accountData.location
        }
      };

      console.log('🔄 Saving settings...', profileData);
      
      // Call the updateProfile API
      const result = await updateProfile(profileData);
      console.log('✅ Settings save result:', result);
      
      setSaveStatus('saved');
      showToast('Settings saved successfully!', 'success');
      
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('❌ Error saving settings:', err);
      console.error('❌ Error details:', err.message);
      console.error('❌ Error stack:', err.stack);
      setError(`Failed to save settings: ${err.message}`);
      showToast(`Failed to save settings: ${err.message}`, 'error');
      setSaveStatus('');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access settings</h2>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'account', name: 'Account Info', icon: User, description: 'Manage your personal information' },
    { id: 'security', name: 'Security & Password', icon: Shield, description: 'Update password and security settings' },
    { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Configure notification preferences' },
    { id: 'privacy', name: 'Privacy', icon: Eye, description: 'Control your privacy settings' },
    { id: 'delete', name: 'Delete Account', icon: Trash2, description: 'Permanently delete your account', isDanger: true },
  ];

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };


  const changePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }
    setShowPasswordModal(true);
  };

  const confirmPasswordChange = async () => {
    try {
      setLoading(true);
      
      // Call the password change API
      const response = await fetch('https://www.astroshivaurica.com/api/auth/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      showToast('Password changed successfully', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordModal(false);
    } catch (err) {
      console.error('❌ Error changing password:', err);
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      
      // Call the delete account API
      const response = await fetch('https://www.astroshivaurica.com/api/users/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          password: passwordData.currentPassword // Use current password for confirmation
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }

      // Show success message
      showToast('Account deleted successfully! Redirecting to home page...', 'success');
      
      // Clear password field
      setPasswordData(prev => ({ ...prev, currentPassword: '' }));
      
      // Close modal
      setShowDeleteModal(false);
      
      // Wait a moment to show the success message, then logout and redirect
      setTimeout(() => {
        logout();
        // Redirect to home page
        window.location.href = '/';
      }, 2000);
      
    } catch (err) {
      console.error('❌ Error deleting account:', err);
      showToast(err.message || 'Failed to delete account', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link to="/dashboard" className="flex items-center hover:text-blue-600 transition-colors">
              <Home className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">Settings</span>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account preferences</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Tabs */}
          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2">
              <div className="flex space-x-1 overflow-x-auto">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 flex flex-col items-center justify-center px-4 py-3 rounded-lg min-w-[100px] transition-all duration-300 transform hover:scale-105 ${isActive ? (tab.isDanger ? 'bg-red-50 text-red-700 shadow-md animate-pulse' : 'bg-blue-50 text-blue-700 shadow-md animate-pulse') : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'}`}
                    >
                      <div 
                        className={`flex items-center justify-center w-8 h-8 rounded-lg mb-1 transition-all duration-300 ${isActive ? (tab.isDanger ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600 animate-pulse') : 'bg-gray-100 text-gray-500'}`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium text-center">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:w-1/4">
            <nav className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full group flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-300 transform hover:translate-x-1 ${isActive ? (tab.isDanger ? 'bg-red-50 text-red-700 border border-red-200 shadow-md animate-pulse' : 'bg-blue-50 text-blue-700 border border-blue-200 shadow-md animate-pulse') : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'}`}
                    >
                      <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 transform group-hover:scale-110 ${isActive ? (tab.isDanger ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600 animate-pulse') : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-600'}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{tab.name}</div>
                        <div className="text-xs opacity-75 mt-0.5">{tab.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>
                      <p className="text-gray-600 mt-1">Update your personal details and preferences</p>
                    </div>
                    <button
                      onClick={saveSettings}
                      disabled={loading || saveStatus === 'saving'}
                      className={`px-6 py-3 rounded-xl flex items-center font-medium transition-all duration-300 transform hover:scale-105 ${saveStatus === 'saved' ? 'bg-green-600 text-white hover:bg-green-700 animate-pulse' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {loading || saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                    </button>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-red-600 mr-2" />
                        <span className="text-red-700 font-medium">{error}</span>
                      </div>
                    </div>
                  )}


                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={accountData.name}
                          onChange={(e) => handleAccountChange('name', e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={accountData.email}
                          disabled
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                          placeholder="Enter your email address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={accountData.phone}
                          onChange={(e) => handleAccountChange('phone', e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Location
                        </label>
                        <input
                          type="text"
                          value={accountData.location}
                          onChange={(e) => handleAccountChange('location', e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Enter your location"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Language
                        </label>
                        <select className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Time Zone
                        </label>
                        <select className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                          <option>UTC-8 (Pacific Time)</option>
                          <option>UTC-5 (Eastern Time)</option>
                          <option>UTC+0 (GMT)</option>
                          <option>UTC+1 (Central European Time)</option>
                          <option>UTC+5:30 (India Standard Time)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                          <Info className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-blue-900">Account Type</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          You are currently registered as a <span className="font-medium">{user.userType === 'jobseeker' ? 'Job Seeker' : 'Employer'}</span>. 
                          Contact support to change your account type.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                      <p className="text-gray-600 mt-1">Choose how you want to be notified</p>
                    </div>
                    <button
                      onClick={saveSettings}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Save Changes
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Email Notifications */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center mb-6">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                          <p className="text-sm text-gray-600">Manage your email notification preferences</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {[
                          { key: 'emailNotifications', label: 'Email notifications', desc: 'Receive notifications via email' },
                          { key: 'jobAlerts', label: 'Job alerts', desc: 'Get notified about new job matches' },
                          { key: 'applicationUpdates', label: 'Application updates', desc: 'Updates on your job applications' },
                          { key: 'marketingEmails', label: 'Marketing emails', desc: 'Promotional emails and newsletters' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">{item.label}</h4>
                              <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications[item.key]}
                                onChange={() => handleNotificationChange(item.key)}
                                className="sr-only peer"
                              />
                              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 transition-all duration-300"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center mb-6">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mr-3">
                          <Bell className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
                          <p className="text-sm text-gray-600">Get instant notifications on your device</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">Push notifications</h4>
                          <p className="text-sm text-gray-600 mt-1">Receive push notifications on your device</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.pushNotifications}
                            onChange={() => handleNotificationChange('pushNotifications')}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 transition-all duration-300"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy */}
              {activeTab === 'privacy' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Privacy</h2>
                      <p className="text-gray-600 mt-1">Control your privacy and data sharing settings</p>
                    </div>
                    <button
                      onClick={saveSettings}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Save Changes
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Profile Visibility */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center mb-6">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mr-3">
                          <Eye className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Profile Visibility</h3>
                          <p className="text-sm text-gray-600">Choose who can see your profile</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { value: 'public', label: 'Public', desc: 'Anyone can view your profile' },
                          { value: 'registered', label: 'Registered users only', desc: 'Only logged-in users can view your profile' },
                          { value: 'private', label: 'Private', desc: 'Only you can view your profile' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-all duration-300 hover:shadow-md transform hover:scale-[1.01]">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value={option.value}
                              checked={privacy.profileVisibility === option.value}
                              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                              className="mt-1 text-blue-600 focus:ring-blue-500 transition-all duration-300 focus:ring-2 focus:ring-offset-2"
                            />
                            <div>
                              <span className="text-sm font-semibold text-gray-900">{option.label}</span>
                              <p className="text-sm text-gray-600 mt-1">{option.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center mb-6">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mr-3">
                          <Mail className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                          <p className="text-sm text-gray-600">Manage who can see your contact details</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">Show email address</h4>
                            <p className="text-sm text-gray-600 mt-1">Allow others to see your email</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacy.showEmail}
                              onChange={() => handlePrivacyChange('showEmail', !privacy.showEmail)}
                              className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">Show phone number</h4>
                            <p className="text-sm text-gray-600 mt-1">Allow others to see your phone number</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacy.showPhone}
                              onChange={() => handlePrivacyChange('showPhone', !privacy.showPhone)}
                              className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">Allow messages</h4>
                            <p className="text-sm text-gray-600 mt-1">Let others send you messages</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacy.allowMessages}
                              onChange={() => handlePrivacyChange('allowMessages', !privacy.allowMessages)}
                              className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <div className="p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Security & Password</h2>
                    <p className="text-gray-600 mt-1">Manage your password and security preferences</p>
                  </div>

                  <div className="space-y-8">
                    {/* Change Password */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center mb-6">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3">
                          <Lock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                          <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter new password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                      <div className="mt-6">
                        <button
                          onClick={changePassword}
                          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mr-3">
                            <Shield className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={twoFactorEnabled}
                            onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-blue-900">Enhanced Security</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              When enabled, you'll need to enter a verification code from your mobile device 
                              when signing in to your account.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Account */}
              {activeTab === 'delete' && (
                <div className="p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Delete Account</h2>
                    <p className="text-gray-600 mt-1">Permanently delete your account and all data</p>
                  </div>

                  <div className="bg-red-50 rounded-xl p-8 border-2 border-red-200">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
                        <p className="text-red-700 mt-2">
                          This action cannot be undone. This will permanently delete your account, 
                          profile, applications, and remove all your data from our servers.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                        <p className="text-sm text-red-700">All your profile information will be deleted</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                        <p className="text-sm text-red-700">Your job applications will be removed</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                        <p className="text-sm text-red-700">Saved jobs and preferences will be lost</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                        <p className="text-sm text-red-700">This action cannot be reversed</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full bg-red-600 text-white py-4 px-6 rounded-xl hover:bg-red-700 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center animate-pulse hover:animate-none"
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 flex items-center space-x-3 px-6 py-4 rounded-xl shadow-lg transition-all duration-500 transform animate-slide-in ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Delete Account</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Are you sure you want to delete your account? This action cannot be undone and will permanently delete your profile, applications, and all associated data.
              </p>
              
              {/* Password Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Enter your password to confirm deletion
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="Enter your current password"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={deleteAccount}
                  disabled={loading || !passwordData.currentPassword}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${loading || !passwordData.currentPassword ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting Account...
                    </>
                  ) : (
                    'Yes, Delete Account'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPasswordData(prev => ({ ...prev, currentPassword: '' }));
                  }}
                  disabled={loading}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Confirmation Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Confirm Password Change</h3>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Are you sure you want to change your password? You will need to use your new password the next time you log in.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={confirmPasswordChange}
                  disabled={loading}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {loading ? 'Changing...' : 'Yes, Change Password'}
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;