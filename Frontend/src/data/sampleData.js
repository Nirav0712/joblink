export const featuredJobs = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "TechCorp Solutions",
    location: "San Francisco, CA",
    salary: "$120,000 - $150,000",
    category: "Technology",
    type: "Full-time",
    experienceLevel: "Senior Level",
    companySize: "Large (500+)",
    description: "We're looking for an experienced software engineer to join our growing team...",
    requirements: ["5+ years React experience", "Node.js proficiency", "Team leadership skills"],
    skills: ["React", "Node.js", "JavaScript", "Leadership", "MongoDB"],
    posted: "2 days ago",
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    id: 2,
    title: "Marketing Manager",
    company: "Brand Innovators",
    location: "New York, NY",
    salary: "$80,000 - $100,000",
    category: "Marketing",
    type: "Full-time",
    experienceLevel: "Mid Level",
    companySize: "Medium (51-500)",
    description: "Lead our marketing initiatives and drive brand awareness across multiple channels...",
    requirements: ["Marketing degree", "5+ years experience", "Digital marketing expertise"],
    skills: ["Digital Marketing", "SEO", "Content Strategy", "Analytics", "Social Media"],
    posted: "1 week ago",
    postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "Analytics Pro",
    location: "Austin, TX",
    salary: "$70,000 - $85,000",
    category: "Data Science",
    type: "Full-time",
    experienceLevel: "Mid Level",
    companySize: "Medium (51-500)",
    description: "Join our data team to transform raw data into actionable business insights...",
    requirements: ["SQL proficiency", "Python/R experience", "Data visualization skills"],
    skills: ["SQL", "Python", "R", "Tableau", "Excel", "Statistics"],
    posted: "3 days ago",
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    id: 4,
    title: "UX Designer",
    company: "Design Studios",
    location: "Los Angeles, CA",
    salary: "$75,000 - $95,000",
    category: "Design",
    type: "Full-time",
    experienceLevel: "Mid Level",
    companySize: "Startup (1-50)",
    description: "Create amazing user experiences for our digital products...",
    requirements: ["Figma expertise", "User research experience", "Portfolio required"],
    skills: ["Figma", "Sketch", "User Research", "Prototyping", "UI Design"],
    posted: "5 days ago",
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  }
];

export const allJobs = [
  ...featuredJobs,
  {
    id: 5,
    title: "Project Manager",
    company: "Agile Works",
    location: "Seattle, WA",
    salary: "$90,000 - $110,000",
    category: "Management",
    type: "Full-time",
    experienceLevel: "Senior Level",
    companySize: "Large (500+)",
    description: "Lead cross-functional teams and deliver projects on time and within budget...",
    requirements: ["PMP certification preferred", "Agile methodology", "Team management"],
    skills: ["Project Management", "Agile", "Scrum", "Leadership", "Risk Management"],
    posted: "1 week ago",
    postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
  },
  {
    id: 6,
    title: "Sales Representative",
    company: "Growth Dynamics",
    location: "Chicago, IL",
    salary: "$60,000 - $80,000",
    category: "Sales",
    type: "Full-time",
    experienceLevel: "Entry Level",
    companySize: "Medium (51-500)",
    description: "Drive sales growth and build lasting relationships with clients...",
    requirements: ["Sales experience", "CRM proficiency", "Communication skills"],
    skills: ["Sales", "CRM", "Communication", "Negotiation", "Customer Service"],
    posted: "4 days ago",
    postedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
  },
  {
    id: 7,
    title: "Frontend Developer",
    company: "WebCraft Inc",
    location: "Austin, TX",
    salary: "$85,000 - $105,000",
    category: "Technology",
    type: "Remote",
    experienceLevel: "Mid Level",
    companySize: "Startup (1-50)",
    description: "Build responsive and interactive web applications using modern technologies...",
    requirements: ["React expertise", "CSS/SASS proficiency", "Responsive design"],
    skills: ["React", "JavaScript", "CSS", "SASS", "Responsive Design", "Git"],
    posted: "1 day ago",
    postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: 8,
    title: "Content Writer",
    company: "Creative Content Co",
    location: "New York, NY",
    salary: "$50,000 - $65,000",
    category: "Marketing",
    type: "Part-time",
    experienceLevel: "Entry Level",
    companySize: "Startup (1-50)",
    description: "Create engaging content for blogs, websites, and social media platforms...",
    requirements: ["Writing portfolio", "SEO knowledge", "Content management systems"],
    skills: ["Content Writing", "SEO", "WordPress", "Research", "Social Media"],
    posted: "6 days ago",
    postedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
  },
  {
    id: 9,
    title: "DevOps Engineer",
    company: "CloudTech Solutions",
    location: "Seattle, WA",
    salary: "$110,000 - $140,000",
    category: "Technology",
    type: "Contract",
    experienceLevel: "Senior Level",
    companySize: "Enterprise (1000+)",
    description: "Manage cloud infrastructure and automate deployment processes...",
    requirements: ["AWS/Azure experience", "Docker/Kubernetes", "CI/CD pipelines"],
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Terraform"],
    posted: "2 weeks ago",
    postedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 2 weeks ago
  },
  {
    id: 10,
    title: "Graphic Designer",
    company: "Visual Arts Studio",
    location: "Los Angeles, CA",
    salary: "$55,000 - $70,000",
    category: "Design",
    type: "Freelance",
    experienceLevel: "Entry Level",
    companySize: "Startup (1-50)",
    description: "Create visual designs for print and digital media...",
    requirements: ["Adobe Creative Suite", "Portfolio required", "Brand design experience"],
    skills: ["Photoshop", "Illustrator", "InDesign", "Brand Design", "Typography"],
    posted: "3 weeks ago",
    postedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) // 3 weeks ago
  }
];


// export const allJobs = [
//   ...featuredJobs,
//   {
//     id: 5,
//     title: "Project Manager",
//     company: "Agile Works",
//     location: "Seattle, WA",
//     salary: "$90,000 - $110,000",
//     category: "Management",
//     type: "Full-time",
//     description: "Lead cross-functional teams and deliver projects on time and within budget...",
//     requirements: ["PMP certification preferred", "Agile methodology", "Team management"],
//     posted: "1 week ago"
//   },
//   {
//     id: 6,
//     title: "Sales Representative",
//     company: "Growth Dynamics",
//     location: "Chicago, IL",
//     salary: "$60,000 - $80,000",
//     category: "Sales",
//     type: "Full-time",
//     description: "Drive sales growth and build lasting relationships with clients...",
//     requirements: ["Sales experience", "CRM proficiency", "Communication skills"],
//     posted: "4 days ago"
//   }
// ];

export const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Software Engineer",
    company: "TechCorp Solutions",
    type: "candidate",
    content: "Jobslink Inc. helped me find my dream job in just 2 weeks! Their platform is incredibly user-friendly and the support team was amazing throughout the process.",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "HR Director",
    company: "Brand Innovators",
    type: "employer",
    content: "We've hired 15 exceptional candidates through Jobslink Inc. this year. The quality of talent and the efficient screening process has been outstanding.",
    avatar: "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Marketing Specialist",
    company: "Creative Agency",
    type: "candidate",
    content: "The career guidance and resume building services were invaluable. I received multiple job offers within a month of using their platform.",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  }
];

export const services = {
  jobSeekers: [
    {
      id: 1,
      title: "Resume Building",
      description: "Professional resume writing and optimization services to make you stand out.",
      icon: "📄",
      features: ["ATS-optimized templates", "Professional writers", "Multiple revisions"]
    },
    {
      id: 2,
      title: "Career Training",
      description: "Skill development programs to enhance your career prospects.",
      icon: "🎓",
      features: ["Industry-specific training", "Certification programs", "Online/offline modes"]
    },
    {
      id: 3,
      title: "Placement Assistance",
      description: "Dedicated support throughout your job search journey.",
      icon: "🤝",
      features: ["Interview preparation", "Job matching", "Salary negotiation"]
    }
  ],
  employers: [
    {
      id: 1,
      title: "Job Posting",
      description: "Post jobs and reach thousands of qualified candidates instantly.",
      icon: "📝",
      features: ["Wide candidate reach", "Easy job management", "Application tracking"]
    },
    {
      id: 2,
      title: "Talent Sourcing",
      description: "Let our experts find the perfect candidates for your specific needs.",
      icon: "🔍",
      features: ["Expert screening", "Custom search", "Quality assurance"]
    },
    {
      id: 3,
      title: "HR Consulting",
      description: "Comprehensive HR solutions to optimize your hiring process.",
      icon: "💼",
      features: ["Process optimization", "Strategic planning", "Performance analysis"]
    }
  ]
};

export const whyJobslink = [
  {
    icon: "🏆",
    title: "Trusted Employers",
    description: "Partner with Fortune 500 companies and top startups"
  },
  {
    icon: "📈",
    title: "Career Growth",
    description: "Access opportunities that match your career aspirations"
  },
  {
    icon: "🕒",
    title: "24/7 Support",
    description: "Round-the-clock assistance for all your job search needs"
  },
  {
    icon: "🎯",
    title: "Smart Matching",
    description: "AI-powered job recommendations tailored to your profile"
  }
];

export const companyLogos = [
  "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop",
  "https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop",
  "https://images.pexels.com/photos/276452/pexels-photo-276452.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop",
  "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop",
  "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop",
  "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop"
];

export const teamMembers = [
  {
    name: "John Smith",
    role: "Chief Executive Officer",
    image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
    bio: "20+ years in HR and recruitment industry"
  },
  {
    name: "Jane Williams",
    role: "Head of Technology",
    image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
    bio: "Former Silicon Valley tech executive"
  },
  {
    name: "Robert Davis",
    role: "Director of Operations",
    image: "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
    bio: "Expert in scaling recruitment operations"
  }
];

export const milestones = [
  {
    year: "2018",
    title: "Company Founded",
    description: "Started with a vision to transform recruitment"
  },
  {
    year: "2019",
    title: "10,000+ Job Seekers",
    description: "Reached our first major milestone"
  },
  {
    year: "2020",
    title: "500+ Partner Companies",
    description: "Built strong employer network"
  },
  {
    year: "2021",
    title: "AI Integration",
    description: "Launched smart matching technology"
  },
  {
    year: "2023",
    title: "100,000+ Placements",
    description: "Celebrated successful placements milestone"
  }
];