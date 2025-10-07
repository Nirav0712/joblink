import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Edit3, 
  Save, 
  X,
  Plus,
  Trash2,
  Upload,
  Settings,
  FileText,
  Star,
  Bookmark,
  Linkedin,
  Github,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import JobCard from '../components/JobCard';

const Profile = () => {
  const { user, updateProfile, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [jobsSubTab, setJobsSubTab] = useState('applied'); // 'applied' or 'saved'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    location: user?.profile?.location || '',
    bio: user?.profile?.bio || '',
    skills: user?.profile?.skills || [],
    experience: user?.profile?.experience || '',
    education: user?.profile?.education || '',
    linkedin: user?.profile?.linkedin || '',
    github: user?.profile?.github || '',
    resume: user?.profile?.resume || null
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sync formData with user data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        location: user.profile?.location || '',
        bio: user.profile?.bio || '',
        skills: user.profile?.skills || [],
        experience: user.profile?.experience || '',
        education: user.profile?.education || '',
        linkedin: user.profile?.linkedin || '',
        github: user.profile?.github || '',
        resume: user.profile?.resume || null
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md mx-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
          <p className="text-gray-600 mb-6">Access your profile and manage your job search journey</p>
          <Link
            to="/login"
            className="bg-gradient-to-r from-[#2563EB] to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl inline-block"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const profileData = {
        name: formData.name,
        profile: {
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          skills: formData.skills,
          experience: formData.experience,
          education: formData.education,
          linkedin: formData.linkedin,
          github: formData.github,
          resume: formData.resume
        }
      };
      
      // Handle resume upload if a new file is selected
      if (resumeFile) {
        // Check file size (2MB max)
        if (resumeFile.size > 2 * 1024 * 1024) {
          setError('Resume file size must be less than 2MB');
          setLoading(false);
          return;
        }
        
        // Here you would typically upload the file to your backend
        // For now, we'll just store the file name
        profileData.profile.resume = resumeFile.name;
      }
      
      console.log('🔄 Starting profile save...');
      console.log('📝 Form data:', formData);
      console.log('🔑 Token exists:', !!token);
      console.log('📤 Sending profile data:', profileData);
      
      const result = await updateProfile(profileData);
      
      console.log('✅ Profile update result:', result);
      
      // Force a small delay to ensure state updates properly
      setTimeout(() => {
        console.log('🔄 Setting isEditing to false...');
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        console.log('✅ Edit state should now be false, showing Edit Profile button');
      }, 100);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('❌ Profile update error:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
      // Make sure to exit edit mode even on error
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setError('Resume file size must be less than 2MB');
        return;
      }
      
      // Check file type (PDF, DOC, DOCX)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      
      setResumeFile(file);
      setError('');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError('Please enter your password to confirm account deletion');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Call API to delete account
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://www.astroshivaurica.com/api'}/users/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: deletePassword })
      });
      
      if (response.ok) {
        // Logout user and redirect
        const { logout } = useAuth();
        logout();
        window.location.href = '/';
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete account');
      }
      
    } catch (err) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
      showToastMessage('Resume uploaded successfully!');
    }
  };

  const calculateProfileCompletion = () => {
    const fields = [
      formData.phone,
      formData.location,
      formData.bio,
      formData.skills.length > 0,
      formData.experience,
      formData.education,
      formData.resume
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const getCompletionHints = () => {
    const hints = [];
    if (!formData.phone) hints.push('Add phone number');
    if (!formData.location) hints.push('Add location');
    if (!formData.bio) hints.push('Write a bio');
    if (formData.skills.length === 0) hints.push('Add skills');
    if (!formData.experience) hints.push('Add experience');
    if (!formData.education) hints.push('Add education');
    if (!formData.resume) hints.push('Upload resume');
    return hints;
  };

  // Mock data for applied and saved jobs
  const mockAppliedJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$120k - $150k',
      jobType: 'Full-time',
      category: 'Technology',
      posted: '2 days ago',
      status: 'Applied'
    },
    {
      id: 2,
      title: 'React Developer',
      company: 'StartupXYZ',
      location: 'Remote',
      salary: '$80k - $100k',
      jobType: 'Full-time',
      category: 'Technology',
      posted: '1 week ago',
      status: 'Interview'
    }
  ];

  const mockSavedJobs = [
    {
      id: 3,
      title: 'Full Stack Engineer',
      company: 'BigTech Co.',
      location: 'New York, NY',
      salary: '$130k - $160k',
      jobType: 'Full-time',
      category: 'Technology',
      posted: '3 days ago'
    }
  ];

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.profile?.phone || '',
      location: user.profile?.location || '',
      bio: user.profile?.bio || '',
      skills: user.profile?.skills || [],
      experience: user.profile?.experience || '',
      education: user.profile?.education || '',
      linkedin: user.profile?.linkedin || '',
      github: user.profile?.github || '',
      resume: user.profile?.resume || null
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16 pb-12">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section with Gradient Banner */}
        <div className="relative bg-gradient-to-r from-[#2563EB] to-blue-600 rounded-2xl p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center space-x-6 mb-6 md:mb-0">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-24 w-24 rounded-full border-4 border-white shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
                </div>
                <div className="text-white">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="text-3xl font-bold bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/70 mb-2 backdrop-blur-sm"
                      placeholder="Your name"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold mb-2">{formData.name || user.name}</h1>
                  )}
                  <p className="text-blue-100 text-lg capitalize mb-1">{user.userType}</p>
                  <div className="flex items-center text-blue-100">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{formData.location || 'Location not set'}</span>
                  </div>
                </div>
              </div>
              {console.log('🔍 Rendering buttons - isEditing:', isEditing) || isEditing ? (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔄 Cancel clicked, setting isEditing to false');
                      setIsEditing(false);
                      setError('');
                      setResumeFile(null);
                    }}
                    className="bg-gray-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    console.log('🔄 Edit Profile clicked, setting isEditing to true');
                    setIsEditing(true);
                  }}
                  className="bg-white text-[#2563EB] px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Profile Completion
            </h3>
            <span className="text-2xl font-bold text-[#2563EB]">{calculateProfileCompletion()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-[#2563EB] to-blue-600 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${calculateProfileCompletion()}%` }}
            ></div>
          </div>
          {getCompletionHints().length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Complete your profile:
              </p>
              <div className="flex flex-wrap gap-2">
                {getCompletionHints().map((hint, index) => (
                  <span key={index} className="bg-white text-blue-700 px-3 py-1 rounded-full text-xs border border-blue-200">
                    {hint}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
              <div className="flex flex-wrap border-b border-gray-200">
                {[
                  { id: 'personal', label: 'Personal Info', icon: User },
                  { id: 'resume', label: 'Resume & Skills', icon: FileText },
                  { id: 'experience', label: 'Experience', icon: Briefcase },
                  { id: 'jobs', label: 'My Jobs', icon: Star },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      console.log('🔄 Switching to tab:', tab.id);
                      setActiveTab(tab.id);
                    }}
                    className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'text-[#2563EB] border-b-2 border-[#2563EB] bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200"
                              placeholder="Your full name"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-xl">
                              <span className="text-gray-900">{formData.name}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <div className="px-4 py-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-900">{user.email}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200"
                              placeholder="Your phone number"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-xl">
                              <span className="text-gray-900">{formData.phone || 'Not provided'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200"
                              placeholder="Your location"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-xl">
                              <span className="text-gray-900">{formData.location || 'Not provided'}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                          {isEditing ? (
                            <input
                              type="url"
                              name="linkedin"
                              value={formData.linkedin}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200"
                              placeholder="https://linkedin.com/in/yourprofile"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-xl">
                              {formData.linkedin ? (
                                <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:underline flex items-center">
                                  <Linkedin className="h-4 w-4 mr-2" />
                                  LinkedIn Profile
                                </a>
                              ) : (
                                <span className="text-gray-500">Not provided</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Profile</label>
                          {isEditing ? (
                            <input
                              type="url"
                              name="github"
                              value={formData.github}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200"
                              placeholder="https://github.com/yourusername"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-xl">
                              {formData.github ? (
                                <a href={formData.github} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:underline flex items-center">
                                  <Github className="h-4 w-4 mr-2" />
                                  GitHub Profile
                                </a>
                              ) : (
                                <span className="text-gray-500">Not provided</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200"
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <span className="text-gray-900">{formData.bio || 'No bio provided yet.'}</span>
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex space-x-4">
                        <button
                          onClick={handleSave}
                          className="bg-gradient-to-r from-[#2563EB] to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center space-x-2"
                        >
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Resume & Skills Tab */}
                {activeTab === 'resume' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Resume Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-[#2563EB] transition-all duration-200">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Resume</h3>
                      <p className="text-gray-600 mb-4">Upload your resume in PDF or DOC format</p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="bg-gradient-to-r from-[#2563EB] to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 cursor-pointer inline-block"
                      >
                        Choose File
                      </label>
                      {(formData.resume || resumeFile) && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-green-700 text-sm">
                            {resumeFile ? `Selected: ${resumeFile.name}` : `Current: ${formData.resume}`}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">Maximum file size: 2MB</p>
                    </div>

                    {/* Skills */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-3">
                            {formData.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="bg-[#2563EB]/10 text-[#2563EB] px-4 py-2 rounded-full text-sm font-medium flex items-center"
                              >
                                {skill}
                                <button
                                  onClick={() => removeSkill(skill)}
                                  className="ml-2 text-[#2563EB] hover:text-blue-700"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex space-x-3">
                            <input
                              type="text"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200"
                              placeholder="Add a skill..."
                            />
                            <button
                              onClick={addSkill}
                              className="bg-[#2563EB] text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {formData.skills.length > 0 ? (
                            formData.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Briefcase className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p>No skills added yet. Click "Edit Profile" to add skills.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-[#2563EB]" />
                        Work Experience
                      </h3>
                      {isEditing ? (
                        <textarea
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200"
                          placeholder="Describe your work experience..."
                        />
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <span className="text-gray-900">{formData.experience || 'No experience information provided yet.'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <GraduationCap className="h-5 w-5 mr-2 text-[#2563EB]" />
                        Education
                      </h3>
                      {isEditing ? (
                        <textarea
                          name="education"
                          value={formData.education}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200"
                          placeholder="Describe your educational background..."
                        />
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <span className="text-gray-900">{formData.education || 'No education information provided yet.'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* My Jobs Tab */}
                {console.log('🔍 Checking My Jobs tab - activeTab:', activeTab, 'is jobs?', activeTab === 'jobs') || activeTab === 'jobs' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex space-x-4 border-b border-gray-200">
                      <button 
                        onClick={() => {
                          console.log('🔄 Switching to Applied Jobs');
                          setJobsSubTab('applied');
                        }}
                        className={`px-4 py-2 font-medium transition-all duration-200 ${
                          jobsSubTab === 'applied'
                            ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Applied Jobs ({mockAppliedJobs.length})
                      </button>
                      <button 
                        onClick={() => {
                          console.log('🔄 Switching to Saved Jobs');
                          setJobsSubTab('saved');
                        }}
                        className={`px-4 py-2 font-medium transition-all duration-200 ${
                          jobsSubTab === 'saved'
                            ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Saved Jobs ({mockSavedJobs.length})
                      </button>
                    </div>

                    <div className="space-y-4">
                      {jobsSubTab === 'applied' ? (
                        mockAppliedJobs.length > 0 ? (
                          mockAppliedJobs.map((job) => (
                          <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{job.title}</h4>
                                <p className="text-gray-600 text-sm mb-2">{job.company}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {job.location}
                                  </span>
                                  <span className="flex items-center">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    {job.salary}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  job.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                                  job.status === 'Interview' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {job.status}
                                </span>
                                <span className="text-xs text-gray-500">{job.posted}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs applied yet</h3>
                          <p className="text-gray-600 mb-4">Start exploring and applying for jobs that match your skills</p>
                          <Link
                            to="/jobs"
                            className="bg-gradient-to-r from-[#2563EB] to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 inline-block"
                          >
                            Browse Jobs
                          </Link>
                        </div>
                      )
                    ) : (
                      // Saved Jobs Section
                      mockSavedJobs.length > 0 ? (
                        mockSavedJobs.map((job) => (
                          <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{job.title}</h4>
                                <p className="text-gray-600 text-sm mb-2">{job.company}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {job.location}
                                  </span>
                                  <span className="flex items-center">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    {job.salary}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  {job.jobType}
                                </span>
                                <button className="text-red-500 hover:text-red-700 p-1">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>{job.category}</span>
                                <span>Saved {job.posted}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Bookmark className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved jobs yet</h3>
                          <p className="text-gray-600 mb-4">Save jobs you're interested in for later</p>
                          <Link
                            to="/jobs"
                            className="bg-gradient-to-r from-[#2563EB] to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 inline-block"
                          >
                            Browse Jobs
                          </Link>
                        </div>
                      )
                    )}
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Email Notifications</h4>
                            <p className="text-sm text-gray-600">Receive email updates about your applications</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Profile Visibility</h4>
                            <p className="text-sm text-gray-600">Make your profile visible to employers</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                      <div className="space-y-4">
                        <button className="w-full text-left p-4 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors duration-200">
                          <h4 className="font-medium text-red-900">Change Password</h4>
                          <p className="text-sm text-red-600">Update your account password</p>
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(true)}
                          className="w-full text-left p-4 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors duration-200"
                        >
                          <h4 className="font-medium text-red-900">Delete Account</h4>
                          <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setActiveTab('resume');
                    setIsEditing(true);
                  }}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  <Upload className="h-5 w-5 text-[#2563EB]" />
                  <span className="text-gray-700 font-medium">Upload Resume</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('personal');
                    setIsEditing(true);
                  }}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  <Edit3 className="h-5 w-5 text-[#2563EB]" />
                  <span className="text-gray-700 font-medium">Update Info</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('resume');
                    setIsEditing(true);
                  }}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  <Plus className="h-5 w-5 text-[#2563EB]" />
                  <span className="text-gray-700 font-medium">Add Skill</span>
                </button>
              </div>
            </div>

            {/* Suggested Jobs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Jobs</h3>
              <div className="space-y-4">
                {mockSavedJobs.slice(0, 2).map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">{job.title}</h4>
                    <p className="text-gray-600 text-xs mb-2">{job.company}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{job.location}</span>
                      <Bookmark className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
                <Link
                  to="/jobs"
                  className="block text-center text-[#2563EB] hover:text-blue-700 font-medium text-sm py-2"
                >
                  View All Jobs →
                </Link>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="bg-gradient-to-br from-[#2563EB] to-blue-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Profile Views</span>
                  <span className="font-semibold">247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Applications Sent</span>
                  <span className="font-semibold">{mockAppliedJobs.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Jobs Saved</span>
                  <span className="font-semibold">{mockSavedJobs.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Profile Score</span>
                  <span className="font-semibold">{calculateProfileCompletion()}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-full mr-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 font-medium mb-2">This will permanently delete:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Your profile and personal information</li>
                  <li>• All job applications</li>
                  <li>• Saved jobs and preferences</li>
                  <li>• Account settings and history</li>
                </ul>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your password to confirm:
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Your current password"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Profile;