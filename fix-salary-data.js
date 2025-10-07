// Script to fix jobs with invalid salary data
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/joblink')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Import Job model
const Job = require('./Backend/models/Job');

async function fixSalaryData() {
  try {
    console.log('🔍 Checking for jobs with invalid salary data...');
    
    // Find all jobs
    const jobs = await Job.find({});
    console.log(`📊 Found ${jobs.length} total jobs`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const job of jobs) {
      try {
        // Check if salary data is valid
        if (!job.salary || 
            typeof job.salary !== 'object' ||
            typeof job.salary.min !== 'number' || 
            typeof job.salary.max !== 'number' ||
            isNaN(job.salary.min) || 
            isNaN(job.salary.max)) {
          
          console.log(`🔧 Fixing job: ${job.title} (ID: ${job._id})`);
          console.log(`   Current salary:`, job.salary);
          
          // Set default salary if invalid
          job.salary = {
            min: job.salary?.min || 50000,
            max: job.salary?.max || 100000,
            currency: job.salary?.currency || 'USD',
            period: job.salary?.period || 'yearly'
          };
          
          await job.save();
          fixedCount++;
          console.log(`   ✅ Fixed salary:`, job.salary);
        }
      } catch (error) {
        console.error(`❌ Error fixing job ${job._id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total jobs: ${jobs.length}`);
    console.log(`   Fixed jobs: ${fixedCount}`);
    console.log(`   Errors: ${errorCount}`);
    
    if (fixedCount > 0) {
      console.log('\n✅ Salary data has been fixed! The dashboard should now work properly.');
    } else {
      console.log('\n✅ No salary data issues found.');
    }
    
  } catch (error) {
    console.error('❌ Error during salary data fix:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixSalaryData();
