import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

const DeleteJobModal = ({ isOpen, onClose, onConfirm, job, loading }) => {
  console.log('🗑️ DeleteJobModal render:', { isOpen, job: job?.title, loading });
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          console.log('🖱️ Backdrop clicked - closing modal');
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
            Delete Job Posting
          </h2>
          <button
            onClick={() => {
              console.log('🚪 Modal close button clicked');
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this job posting? This action cannot be undone.
            </p>
            
            {job && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                <p className="text-sm text-gray-600 mb-1">{job.companyName}</p>
                <p className="text-sm text-gray-600">{job.location}</p>
                {job.applicationCount > 0 && (
                  <p className="text-sm text-orange-600 mt-2 font-medium">
                    ⚠️ This job has {job.applicationCount} application{job.applicationCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">Warning</h4>
                <p className="text-sm text-red-700">
                  Deleting this job will:
                </p>
                <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                  <li>Remove the job from public listings</li>
                  <li>Hide it from job searches</li>
                  <li>Preserve existing applications for review</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              console.log('✅ Delete confirm button clicked');
              onConfirm();
            }}
            disabled={loading}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Job
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteJobModal;
