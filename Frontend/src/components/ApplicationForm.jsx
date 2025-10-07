import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Upload, FileText, X, Plus, CheckCircle, User, Globe, Github, Linkedin, DollarSign, Calendar } from 'lucide-react';

const ApplicationForm = ({ job, onClose, onSubmit }) => {
  const { user, token } = useAuth();
  
  // Debug authentication
  console.log('🔐 ApplicationForm - User:', user);
  console.log('🔑 ApplicationForm - Token:', token ? 'Token exists' : 'No token');
  console.log('📋 ApplicationForm - Job:', job);
  const [formData, setFormData] = useState({
    coverLetter: '',
    resume: null,
    portfolio: '',
    linkedin: '',
    github: '',
    website: '',
    availability: '',
    expectedSalary: '',
    additionalInfo: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setFormData(prev => ({ ...prev, resume: file.name }));
    }
  };

  const removeResume = () => {
    setResumeFile(null);
    setFormData(prev => ({ ...prev, resume: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user || !token) {
      alert('You must be logged in to apply for jobs. Please log in and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const applicationData = {
        jobId: job._id || job.id,
        coverLetter: formData.coverLetter,
        resume: formData.resume || 'Resume uploaded',
        expectedSalary: formData.expectedSalary ? parseInt(formData.expectedSalary.replace(/[^0-9]/g, '')) : undefined,
        portfolio: formData.portfolio && formData.portfolio.trim() !== '' ? formData.portfolio : undefined,
        linkedin: formData.linkedin && formData.linkedin.trim() !== '' ? formData.linkedin : undefined,
        github: formData.github && formData.github.trim() !== '' ? formData.github : undefined,
        website: formData.website && formData.website.trim() !== '' ? formData.website : undefined,
        availability: formData.availability,
        additionalInfo: formData.additionalInfo
      };

      console.log('📤 Application data:', applicationData);
      console.log('🔑 Token:', token ? 'Token exists' : 'No token');
      console.log('📋 Job data:', job);

      await apiService.applyForJob(applicationData, token);
      
      setIsSubmitting(false);
      setSubmitted(true);
      
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-2xl mx-auto border border-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Thank you for applying to <span className="font-semibold text-blue-600">{job.title}</span> at <span className="font-semibold">
              {typeof job.company === 'object' && job.company !== null 
                ? job.company.name 
                : job.company || job.companyName || 'this company'
              }
            </span>. 
          </p>
          <p className="text-gray-500 mb-8">
            We've received your application and will review it shortly. You'll receive a confirmation email shortly.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 mb-8">
            <p className="text-sm text-blue-700">
              You can track the status of your application in your dashboard under "My Applications".
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Back to Job
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl mx-auto max-h-[90vh] overflow-y-auto border border-gray-100">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3">
              <User className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h2>
          </div>
          <p className="text-gray-600 ml-11">
            {typeof job.company === 'object' && job.company !== null 
              ? job.company.name 
              : job.company || job.companyName || 'Company'
            } • {job.location}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 group"
        >
          <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <FileText className="h-4 w-4 mr-2 text-blue-600" />
            Resume/CV *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 bg-gray-50">
            {resumeFile ? (
              <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium text-gray-900">{resumeFile.name}</span>
                    <p className="text-xs text-gray-500">Resume uploaded successfully</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeResume}
                  className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-gray-700 mb-2 font-medium">
                  Drop your resume here or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Upload your resume in PDF, DOC, or DOCX format
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                  required
                />
                <label
                  htmlFor="resume-upload"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-200 cursor-pointer inline-flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </label>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
          </p>
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <FileText className="h-4 w-4 mr-2 text-blue-600" />
            Cover Letter
          </label>
          <textarea
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleChange}
            rows={5}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
            placeholder="Tell us why you're interested in this position and why you'd be a great fit. Highlight your relevant experience and skills..."
          />
        </div>

        {/* Portfolio Links */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Globe className="h-4 w-4 mr-2 text-blue-600" />
            Portfolio & Social Links
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="https://yourportfolio.com"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Linkedin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Github className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="https://github.com/yourusername"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        {/* Availability and Salary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              Availability to Start
            </label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200 text-gray-900"
              required
            >
              <option value="">Select availability</option>
              <option value="immediately">Immediately</option>
              <option value="2-weeks">2 weeks notice</option>
              <option value="1-month">1 month notice</option>
              <option value="2-months">2 months notice</option>
              <option value="3-months">3+ months</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
              Expected Salary
            </label>
            <input
              type="text"
              name="expectedSalary"
              value={formData.expectedSalary}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
              placeholder="e.g., $80,000 - $100,000"
            />
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <FileText className="h-4 w-4 mr-2 text-blue-600" />
            Additional Information
          </label>
          <textarea
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            rows={4}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
            placeholder="Any additional information you'd like to share with the hiring manager..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.resume}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
