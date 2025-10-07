import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import JobseekerDashboard from './JobseekerDashboard';
import EmployerDashboard from './EmployerDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Debug logging
  console.log('🔍 Dashboard - Current user:', user);
  console.log('🔍 Dashboard - User type:', user?.userType);

  // Route to appropriate dashboard based on user type
  if (user.userType === 'jobseeker') {
    console.log('✅ Routing to JobseekerDashboard');
    return <JobseekerDashboard />;
  } else if (user.userType === 'employer') {
    console.log('✅ Routing to EmployerDashboard');
    return <EmployerDashboard />;
  }

  // Fallback for unknown user types
  console.log('❌ Unknown user type:', user.userType);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid user type</h2>
        <p className="text-gray-600 mb-4">User type: {user.userType || 'undefined'}</p>
        <p className="text-gray-600 mb-4">Please contact support for assistance.</p>
      </div>
    </div>
  );
};

export default Dashboard;