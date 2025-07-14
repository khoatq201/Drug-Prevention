const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drug_prevention');

const Appointment = require('../models/Appointment');
const Counselor = require('../models/Counselor');
const User = require('../models/User');

async function checkCurrentStats() {
  try {
    console.log('=== Current Database State ===');
    
    // Check all appointments
    const appointments = await Appointment.find().populate('counselorId', 'firstName lastName');
    console.log('\nAll appointments:');
    appointments.forEach(app => {
      console.log(`  ${app._id}: ${app.status} - Counselor: ${app.counselorId}`);
    });
    
    // Check all counselors and their actual stats
    const counselors = await Counselor.find().populate('userId', 'firstName lastName');
    console.log('\nAll counselors and their stats:');
    
    for (const counselor of counselors) {
      const totalSessions = await Appointment.countDocuments({ 
        counselorId: counselor._id,
        status: 'completed'
      });
      
      const totalAppointments = await Appointment.countDocuments({ 
        counselorId: counselor._id
      });
      
      console.log(`\nCounselor: ${counselor.userId?.firstName} ${counselor.userId?.lastName} (${counselor._id})`);
      console.log(`  Stored stats: totalSessions=${counselor.performance.totalSessions}, totalClients=${counselor.performance.totalClients}`);
      console.log(`  Actual counts: totalSessions=${totalSessions}, totalAppointments=${totalAppointments}`);
      
      if (counselor.performance.totalSessions !== totalSessions) {
        console.log(`  ❌ MISMATCH! Need to update stats`);
        
        // Update the stats
        await Counselor.findByIdAndUpdate(counselor._id, {
          $set: {
            'performance.totalSessions': totalSessions,
            'performance.totalClients': totalSessions,
            'performance.completionRate': totalAppointments > 0 ? Math.round((totalSessions / totalAppointments) * 100) : 0
          }
        });
        console.log(`  ✅ Updated stats`);
      } else {
        console.log(`  ✅ Stats are correct`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCurrentStats();