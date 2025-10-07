import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Clock, Building, Briefcase, Users } from 'lucide-react';
import ApplicationForm from './ApplicationForm';

const JobCard = ({ job, featured = false }) => {
  const [showApplicationForm, setShowApplicationForm] = React.useState(false);
  
  return (
    <div className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border ${
      featured 
        ? 'border-blue-200 bg-gradient-to-br from-blue-50 via-white to-white shadow-md hover:shadow-2xl' 
        : 'border-gray-100 hover:border-blue-200 hover:shadow-lg'
    }`}>
      {featured && (
        <div className="absolute top-1 right-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
          <Briefcase className="h-3 w-3 mr-1" />
          Featured
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
            <Link to={`/job/${job._id || job.id}`} className="hover:underline">{job.title}</Link>
          </h3>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Building className="h-4 w-4 mr-2 text-blue-500" />
            <span className="font-medium text-gray-700">
              {typeof job.company === 'object' && job.company !== null 
                ? job.company.name 
                : job.company || job.companyName || 'Unknown Company'
              }
            </span>
            {job.companySize && (
              <>
                <span className="mx-2 text-gray-300">•</span>
                <Users className="h-4 w-4 mr-1 text-gray-400" />
                <span>{job.companySize}</span>
              </>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-500 flex items-center bg-gray-50 px-2 py-1 rounded-full">
          <Clock className="h-3 w-3 mr-1" />
          {job.posted}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
        
        <div className="flex items-center text-sm font-semibold text-green-600">
          <DollarSign className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>
            {typeof job.salary === 'object' && job.salary !== null
              ? `$${job.salary.min?.toLocaleString() || 0} - $${job.salary.max?.toLocaleString() || 0} ${job.salary.currency || 'USD'}`
              : job.salary || 'Salary not specified'
            }
          </span>
        </div>
        
        {(job.jobType || job.type) && (
          <div className="flex items-center text-sm text-gray-600">
            <Briefcase className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
            <span>{job.jobType || job.type}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {job.category}
        </span>
        <button
          onClick={() => setShowApplicationForm(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 text-sm"
        >
          Apply Now
        </button>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowApplicationForm(false)}
              className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
            >
              ×
            </button>
            <ApplicationForm 
              job={job} 
              onClose={() => setShowApplicationForm(false)}
              onSubmit={() => {
                setShowApplicationForm(false);
                // Optionally show success message or redirect
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;