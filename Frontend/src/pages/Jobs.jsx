import React, { useState, useEffect } from 'react';
import { Filter, Search, Calendar, Users, Briefcase, Award } from 'lucide-react';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import apiService from '../services/api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    query: '',
    location: '',
    category: '',
    salary: '',
    jobType: '',
    experienceLevel: '',
    companySize: '',
    datePosted: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All Categories', 'Technology', 'Marketing', 'Data Science', 'Design', 'Management', 'Sales'];
  const locations = ['All Locations', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Los Angeles, CA', 'Seattle, WA', 'Chicago, IL'];
  const salaryRanges = ['Any Salary', '$30,000 - $50,000', '$50,000 - $75,000', '$75,000 - $100,000', '$100,000+'];
  const jobTypes = ['All Types', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Freelance'];
  const experienceLevels = ['All Levels', 'Entry Level', 'Mid Level', 'Senior Level', 'Executive'];
  // const companySizes = ['All Sizes', 'Startup (1-50)', 'Medium (51-500)', 'Large (500+)', 'Enterprise (1000+)'];
  const datePostedOptions = ['Any Time', 'Last 24 hours', 'Last 3 days', 'Last week', 'Last month'];

  // Load jobs from API
  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter jobs when search filters change
  useEffect(() => {
    filterJobs();
  }, [searchFilters, jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getJobs({ limit: 50 });
      setJobs(response.data.jobs);
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchFilters.query) {
      filtered = filtered.filter(job => {
        const companyName = typeof job.company === 'object' && job.company !== null 
          ? job.company.name 
          : job.company || job.companyName || '';
        
        return job.title.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
          companyName.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
          (job.skills && job.skills.some(skill => 
            skill.toLowerCase().includes(searchFilters.query.toLowerCase())
          ));
      });
    }

    if (searchFilters.location && searchFilters.location !== 'All Locations') {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(searchFilters.location.toLowerCase())
      );
    }

    if (searchFilters.category && searchFilters.category !== 'All Categories') {
      filtered = filtered.filter(job =>
        job.category.toLowerCase() === searchFilters.category.toLowerCase()
      );
    }

    if (searchFilters.salary && searchFilters.salary !== 'Any Salary') {
      filtered = filtered.filter(job => {
        if (typeof job.salary === 'object' && job.salary !== null) {
          const minSalary = job.salary.min || 0;
          const salaryRange = searchFilters.salary.split(' - ')[0].replace('$', '').replace(',', '');
          return minSalary >= parseInt(salaryRange);
        }
        return false;
      });
    }

    if (searchFilters.jobType && searchFilters.jobType !== 'All Types') {
      filtered = filtered.filter(job =>
        job.type && job.type.toLowerCase() === searchFilters.jobType.toLowerCase()
      );
    }

    if (searchFilters.experienceLevel && searchFilters.experienceLevel !== 'All Levels') {
      filtered = filtered.filter(job =>
        job.experienceLevel && job.experienceLevel.toLowerCase() === searchFilters.experienceLevel.toLowerCase()
      );
    }

    if (searchFilters.companySize && searchFilters.companySize !== 'All Sizes') {
      filtered = filtered.filter(job =>
        job.companySize && job.companySize === searchFilters.companySize
      );
    }

    if (searchFilters.datePosted && searchFilters.datePosted !== 'Any Time') {
      const now = new Date();
      const filterDays = {
        'Last 24 hours': 1,
        'Last 3 days': 3,
        'Last week': 7,
        'Last month': 30
      };
      
      const daysAgo = filterDays[searchFilters.datePosted];
      if (daysAgo) {
        filtered = filtered.filter(job => {
          const jobDate = new Date(job.postedDate || now);
          const daysDiff = Math.floor((now - jobDate) / (1000 * 60 * 60 * 24));
          return daysDiff <= daysAgo;
        });
      }
    }

    setFilteredJobs(filtered);
  };

  const handleSearch = async (filters) => {
    try {
      setLoading(true);
      setError('');
      
      // Build API search parameters
      const searchParams = {};
      if (filters.query) searchParams.q = filters.query;
      if (filters.location) searchParams.location = filters.location;
      if (filters.category && filters.category !== 'All Categories') searchParams.category = filters.category;
      if (filters.jobType && filters.jobType !== 'All Types') searchParams.type = filters.jobType;
      if (filters.experienceLevel && filters.experienceLevel !== 'All Levels') searchParams.experienceLevel = filters.experienceLevel;
      if (filters.salary && filters.salary !== 'Any Salary') {
        // Parse salary range
        const salaryMatch = filters.salary.match(/\$?([0-9,]+)/);
        if (salaryMatch) {
          searchParams.minSalary = parseInt(salaryMatch[1].replace(',', ''));
        }
      }
      
      const response = await apiService.getJobs({ ...searchParams, limit: 50 });
      setJobs(response.data.jobs);
      
      // Update local filters for UI
      setSearchFilters(prev => ({
        ...prev,
        ...filters
      }));
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Error searching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setSearchFilters({
      query: '',
      location: '',
      category: '',
      salary: '',
      jobType: '',
      experienceLevel: '',
      companySize: '',
      datePosted: ''
    });
  };

  const activeFiltersCount = Object.values(searchFilters).filter(value => value && value !== '').length;

  return (
    <div className="pt-16">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Job</h1>
            <p className="text-xl text-blue-100">
              Discover opportunities that match your skills and aspirations
            </p>
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Jobs Listing */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          )}

          {/* Results Header */}
          {!loading && (
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {filteredJobs.length} Jobs Found
                </h2>
                <p className="text-gray-600">
                  Showing the best opportunities for your search
                </p>
              </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center mt-4 relative"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Filter Jobs</h3>
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {activeFiltersCount} active
                    </span>
                  )}
                </div>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="h-4 w-4 inline mr-1" />
                    Category
                  </label>
                  <select
                    value={searchFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category === 'All Categories' ? '' : category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Type Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Filter className="h-4 w-4 inline mr-1" />
                    Job Type
                  </label>
                  <select
                    value={searchFilters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {jobTypes.map((type) => (
                      <option key={type} value={type === 'All Types' ? '' : type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience Level Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Award className="h-4 w-4 inline mr-1" />
                    Experience Level
                  </label>
                  <select
                    value={searchFilters.experienceLevel}
                    onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {experienceLevels.map((level) => (
                      <option key={level} value={level === 'All Levels' ? '' : level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={searchFilters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {locations.map((location) => (
                      <option key={location} value={location === 'All Locations' ? '' : location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Company Size Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="h-4 w-4 inline mr-1" />
                    Company Size
                  </label>
                  {/* <select
                    value={searchFilters.companySize}
                    onChange={(e) => handleFilterChange('companySize', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {companySizes.map((size) => (
                      <option key={size} value={size === 'All Sizes' ? '' : size}>
                        {size}
                      </option>
                    ))}
                  </select> */}
                </div>

                {/* Salary Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                  <select
                    value={searchFilters.salary}
                    onChange={(e) => handleFilterChange('salary', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {salaryRanges.map((range) => (
                      <option key={range} value={range === 'Any Salary' ? '' : range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Posted Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Date Posted
                  </label>
                  <select
                    value={searchFilters.datePosted}
                    onChange={(e) => handleFilterChange('datePosted', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {datePostedOptions.map((option) => (
                      <option key={option} value={option === 'Any Time' ? '' : option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={clearAllFilters}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                  disabled={activeFiltersCount === 0}
                >
                  Clear All Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="lg:w-3/4">
              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700">Active filters:</span>
                    {Object.entries(searchFilters).map(([key, value]) => {
                      if (value && value !== '') {
                        return (
                          <span
                            key={key}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                          >
                            {key === 'query' ? `"${value}"` : value}
                            <button
                              onClick={() => handleFilterChange(key, '')}
                              className="ml-2 hover:text-blue-600"
                            >
                              ×
                            </button>
                          </span>
                        );
                      }
                      return null;
                    })}
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-red-600 hover:text-red-700 font-medium ml-2"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}

              {!loading && filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredJobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>
              ) : !loading ? (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or removing some filters
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Jobs;