import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { testimonials, whyJobslink } from '../data/sampleData';

const Home = () => {
  const { user } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to fetch from backend
      const response = await apiService.getFeaturedJobs();
      if (response && response.data && response.data.jobs) {
        setFeaturedJobs(response.data.jobs);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching featured jobs:', err);
      // If backend is not available, use sample data
      setFeaturedJobs([
        {
          _id: 1,
          title: "Senior Software Engineer",
          company: "TechCorp Solutions",
          location: "San Francisco, CA",
          salary: { min: 120000, max: 150000, currency: "USD" },
          category: "Technology",
          type: "Full-time",
          experienceLevel: "Senior Level",
          description: "We're looking for an experienced software engineer to join our growing team...",
          requirements: ["5+ years React experience", "Node.js proficiency", "Team leadership skills"],
          skills: ["React", "Node.js", "JavaScript", "Leadership", "MongoDB"],
          posted: "2 days ago",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 2,
          title: "Marketing Manager",
          company: "Brand Innovators",
          location: "New York, NY",
          salary: { min: 80000, max: 100000, currency: "USD" },
          category: "Marketing",
          type: "Full-time",
          experienceLevel: "Mid Level",
          description: "Lead our marketing initiatives and drive brand awareness across multiple channels...",
          requirements: ["Marketing degree", "5+ years experience", "Digital marketing expertise"],
          skills: ["Digital Marketing", "SEO", "Content Strategy", "Analytics", "Social Media"],
          posted: "1 week ago",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 3,
          title: "UX Designer",
          company: "Creative Studio",
          location: "Los Angeles, CA",
          salary: { min: 90000, max: 110000, currency: "USD" },
          category: "Design",
          type: "Full-time",
          experienceLevel: "Mid Level",
          description: "Create beautiful and intuitive user experiences for our digital products...",
          requirements: ["3+ years UX design", "Figma proficiency", "User research skills"],
          skills: ["Figma", "User Research", "Prototyping", "UI/UX", "Design Systems"],
          posted: "3 days ago",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 4,
          title: "Data Scientist",
          company: "Analytics Pro",
          location: "Seattle, WA",
          salary: { min: 130000, max: 160000, currency: "USD" },
          category: "Technology",
          type: "Full-time",
          experienceLevel: "Senior Level",
          description: "Build machine learning models and analyze large datasets to drive business insights...",
          requirements: ["PhD in Data Science", "5+ years ML experience", "Python expertise"],
          skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Statistics"],
          posted: "1 day ago",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleSearch = (searchParams) => {
    console.log('Search params:', searchParams);
    // Navigate to jobs page with search parameters
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Connecting <span className="text-yellow-300">Talent</span> with{' '}
            <span className="text-yellow-300">Opportunity</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
            Discover your dream career or find the perfect candidate. Join thousands of professionals who trust Jobslink Inc.
          </p>
          
          <div className="mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              // Show different buttons based on user type
              user.userType === 'employer' ? (
                <>
                  <Link
                    to="/post-job"
                    className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors duration-200"
                  >
                    Post a Job
                  </Link>
                  <Link
                    to="/employers"
                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
                  >
                    Employer Portal
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/jobs"
                    className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors duration-200"
                  >
                    Browse All Jobs
                  </Link>
                  <Link
                    to="/applications"
                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
                  >
                    My Applications
                  </Link>
                </>
              )
            ) : (
              // Show default buttons for non-logged in users
              <>
                <Link
                  to="/jobs"
                  className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors duration-200"
                >
                  Browse All Jobs
                </Link>
                <Link
                  to="/employers"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
                >
                  Post a Job
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Jobs</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover handpicked opportunities from top employers looking for exceptional talent
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading featured jobs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading jobs: {error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {featuredJobs.slice(0, 4).map((job) => (
                <JobCard key={job._id} job={job} featured={true} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/jobs"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              View All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Why Jobslink Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Jobslink Inc.?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're more than just a job portal - we're your career success partners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyJobslink.map((item, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from professionals who found their perfect match through Jobslink Inc.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
              <div className="flex items-center justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-lg md:text-xl text-gray-800 text-center mb-8 italic">
                "{testimonials[currentTestimonial].content}"
              </blockquote>

              <div className="flex items-center justify-center space-x-4">
                <img
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</div>
                  <div className="text-gray-600">{testimonials[currentTestimonial].role}</div>
                  <div className="text-blue-600 font-medium">{testimonials[currentTestimonial].company}</div>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Testimonial indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take the Next Step?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of professionals who have found their perfect career match
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/jobs"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Find Your Dream Job
            </Link>
            <Link
              to="/employers"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              Hire Top Talent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;