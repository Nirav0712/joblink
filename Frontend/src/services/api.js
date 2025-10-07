// API Service for JobLink Frontend
const API_BASE_URL = 'https://www.astroshivaurica.com/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders(token) {
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Generic API call method
  async apiCall(endpoint, options = {}, token = null) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(token),
      ...options
    };

    // Debug logging
    console.log('🌐 API Call:', url);
    console.log('🔑 Token provided:', token ? 'Yes' : 'No');
    console.log('📤 Headers:', config.headers);

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      console.log('📡 Response status:', response.status);
      console.log('📥 Response data:', data);

      if (!response.ok) {
        // Handle authentication errors specifically
        if (response.status === 401) {
          console.error('❌ Authentication failed - token may be expired');
          throw new Error('Authentication failed. Please log in again.');
        }
        
        // Handle authorization errors (403)
        if (response.status === 403) {
          console.error('❌ Access denied - insufficient permissions');
          throw new Error(data.message || 'Access denied. You do not have permission to access this resource.');
        }
        
        // Handle server errors (500)
        if (response.status === 500) {
          console.error('❌ Server error:', data.message);
          throw new Error(data.message || 'Server error. Please try again later.');
        }
        
        // Show detailed validation errors
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors.map(err => err.msg || err.message || err).join(', ');
          console.error('❌ Validation errors:', data.errors);
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Authentication APIs
  async login(email, password) {
    return this.apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(email, password, name, userType) {
    return this.apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, userType })
    });
  }

  async getCurrentUser(token) {
    return this.apiCall('/auth/me', {}, token);
  }

  // Job APIs
  async getJobs(params = {}, token = null) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/jobs?${queryString}` : '/jobs';
    return this.apiCall(endpoint, {}, token);
  }

  async getFeaturedJobs(token = null) {
    return this.apiCall('/jobs/featured', {}, token);
  }

  async getJobCategories() {
    return this.apiCall('/jobs/categories');
  }

  async getJobById(id, token = null) {
    return this.apiCall(`/jobs/${id}`, {}, token);
  }

  async createJob(jobData, token) {
    return this.apiCall('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    }, token);
  }

  async updateJob(id, jobData, token) {
    return this.apiCall(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData)
    }, token);
  }

  async deleteJob(id, token) {
    return this.apiCall(`/jobs/${id}`, {
      method: 'DELETE'
    }, token);
  }

  async getJobApplications(jobId, params = {}, token) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/applications/job/${jobId}?${queryString}` : `/applications/job/${jobId}`;
    return this.apiCall(endpoint, {}, token);
  }

  // Application APIs
  async applyForJob(applicationData, token) {
    return this.apiCall('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData)
    }, token);
  }

  async getMyApplications(params = {}, token) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/applications/my-applications?${queryString}` : '/applications/my-applications';
    return this.apiCall(endpoint, {}, token);
  }

  async getUserApplications(userId, params = {}, token) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/applications/user/${userId}?${queryString}` : `/applications/user/${userId}`;
    return this.apiCall(endpoint, {}, token);
  }

  async getApplicationById(id, token) {
    return this.apiCall(`/applications/${id}`, {}, token);
  }

  async updateApplicationStatus(id, status, notes, token) {
    return this.apiCall(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    }, token);
  }

  async withdrawApplication(id, token) {
    return this.apiCall(`/applications/${id}/withdraw`, {
      method: 'POST'
    }, token);
  }

  // User APIs
  async getUserProfile(token) {
    return this.apiCall('/users/profile', {}, token);
  }

  async updateUserProfile(profileData, token) {
    return this.apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }, token);
  }

  async getUserById(id) {
    return this.apiCall(`/users/${id}`);
  }

  async getUserDashboardStats(token) {
    return this.apiCall('/users/dashboard/stats', {}, token);
  }

  // Company APIs
  async getCompanies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/companies?${queryString}` : '/companies';
    return this.apiCall(endpoint);
  }

  async getCompanyById(id) {
    return this.apiCall(`/companies/${id}`);
  }

  async getCompanyJobs(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/companies/${id}/jobs?${queryString}` : `/companies/${id}/jobs`;
    return this.apiCall(endpoint);
  }

  async createCompany(companyData, token) {
    return this.apiCall('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData)
    }, token);
  }

  async updateCompany(id, companyData, token) {
    return this.apiCall(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData)
    }, token);
  }

  // Health check
  async healthCheck() {
    return this.apiCall('/health');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
