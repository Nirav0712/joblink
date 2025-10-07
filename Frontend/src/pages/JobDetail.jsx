import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, DollarSign, Clock, Building, ArrowLeft, CheckCircle, Share2, Heart, Users, Award, TrendingUp, FileText } from 'lucide-react';
import apiService from '../services/api';
import ApplicationForm from '../components/ApplicationForm';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getJobById(id);
      console.log('📥 Job details response:', response);
      console.log('📋 Job data:', response.data.job);
      setJob(response.data.job);
      setHasApplied(response.data.hasApplied);
    } catch (err) {
      setError('Failed to load job details. Please try again.');
      console.error('Error fetching job:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Job</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/jobs"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/jobs"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/jobs"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-all duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Jobs
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-300">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {job.title}
                  </h1>
                  <div className="flex items-center space-x-2 lg:hidden">
                    <button className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                      <Heart className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                      <Share2 className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <div className="p-2 bg-blue-50 rounded-lg mr-3">
                      <Building className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">
                      {typeof job.company === 'object' && job.company !== null 
                        ? job.company.name 
                        : job.company || job.companyName || 'Unknown Company'
                      }
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="p-2 bg-green-50 rounded-lg mr-3">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-green-700 font-semibold">
                    <div className="p-2 bg-green-50 rounded-lg mr-3">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <span>
                      {typeof job.salary === 'object' && job.salary !== null
                        ? `$${job.salary.min?.toLocaleString() || 0} - $${job.salary.max?.toLocaleString() || 0} ${job.salary.currency || 'USD'}`
                        : job.salary || 'Salary not specified'
                      }
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <div className="p-2 bg-gray-50 rounded-lg mr-3">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <span>
                      Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:space-y-0 sm:space-x-3 space-y-3 lg:w-auto w-full">
                {hasApplied ? (
                  <button 
                    disabled
                    className="bg-gray-400 text-white px-8 py-3 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Already Applied
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowApplicationForm(true)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Apply Now
                  </button>
                )}
                <button className="bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 border border-gray-200 flex items-center justify-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Save Job
                </button>
                <div className="hidden lg:flex items-center justify-center space-x-2 mt-2">
                  <button className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 mt-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <Award className="h-3 w-3 mr-1" />
                {job.category}
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                <Clock className="h-3 w-3 mr-1" />
                {job.type}
              </span>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-50 rounded-xl mr-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Job Description</h2>
              </div>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {job.description}
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We are seeking a highly motivated and experienced professional to join our dynamic team. 
                  This role offers excellent growth opportunities and the chance to work with cutting-edge 
                  technologies in a collaborative environment.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  The successful candidate will be responsible for driving key initiatives, collaborating 
                  with cross-functional teams, and contributing to our company's continued success. We offer 
                  competitive compensation, comprehensive benefits, and a supportive work environment.
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-green-50 rounded-xl mr-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Requirements</h2>
              </div>
              <ul className="space-y-4">
                {job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0 ? (
                  job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <div className="p-1 bg-green-100 rounded-lg mr-3 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 italic">No specific requirements listed</li>
                )}
                <li className="flex items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="p-1 bg-green-100 rounded-lg mr-3 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Excellent communication and interpersonal skills</span>
                </li>
                <li className="flex items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="p-1 bg-green-100 rounded-lg mr-3 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Strong problem-solving and analytical abilities</span>
                </li>
              </ul>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-purple-50 rounded-xl mr-3">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Benefits & Perks</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-200">
                  <div className="p-1 bg-purple-100 rounded-lg mr-3">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700">Health, dental, and vision insurance</span>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-200">
                  <div className="p-1 bg-purple-100 rounded-lg mr-3">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700">401(k) retirement plan</span>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-200">
                  <div className="p-1 bg-purple-100 rounded-lg mr-3">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700">Flexible work arrangements</span>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-200">
                  <div className="p-1 bg-purple-100 rounded-lg mr-3">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700">Professional development opportunities</span>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-200">
                  <div className="p-1 bg-purple-100 rounded-lg mr-3">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700">Paid time off and holidays</span>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-200">
                  <div className="p-1 bg-purple-100 rounded-lg mr-3">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700">Team building activities</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 xl:order-last">
            <div className="sticky top-24 space-y-6">
              {/* Quick Apply */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-50 rounded-xl mr-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Quick Apply</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Apply now and we'll get back to you within 24 hours.
                </p>
                {hasApplied ? (
                  <button 
                    disabled
                    className="w-full bg-gray-400 text-white py-3 rounded-xl font-semibold cursor-not-allowed mb-3 flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Already Applied
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowApplicationForm(true)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 mb-3 shadow-sm hover:shadow-md flex items-center justify-center"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Apply Now
                  </button>
                )}
                <button className="w-full bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 border border-gray-200 flex items-center justify-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Save for Later
                </button>
              </div>

              {/* Company Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-indigo-50 rounded-xl mr-3">
                    <Building className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    About {typeof job.company === 'object' && job.company !== null 
                      ? job.company.name 
                      : job.company || job.companyName || 'This Company'
                    }
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  {typeof job.company === 'object' && job.company !== null 
                    ? job.company.name 
                    : job.company || job.companyName || 'This Company'
                  } is a leading company in the {job.category.toLowerCase()} industry, 
                  committed to innovation and excellence.
                </p>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    500+ employees
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Award className="h-4 w-4 mr-1" />
                    Industry Leader
                  </div>
                </div>
                <Link
                  to="/employers"
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center transition-colors duration-200"
                >
                  View Company Profile
                  <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                </Link>
              </div>

              {/* Share Job */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-50 rounded-xl mr-3">
                    <Share2 className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Share This Job</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <button className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center font-medium">
                    <Share2 className="h-4 w-4 mr-2" />
                    LinkedIn
                  </button>
                  <button className="bg-gray-800 text-white px-4 py-3 rounded-xl hover:bg-gray-900 transition-all duration-200 flex items-center justify-center font-medium">
                    <Share2 className="h-4 w-4 mr-2" />
                    Twitter
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center font-medium border border-gray-200">
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <ApplicationForm 
            job={job} 
            onClose={() => setShowApplicationForm(false)}
            onSubmit={() => {
              setShowApplicationForm(false);
              // Optionally show success message or redirect
            }}
          />
        </div>
      )}
      </div>
    </div>
  );
};

export default JobDetail;