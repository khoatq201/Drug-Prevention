const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drug_prevention');

const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Counselor = require('../models/Counselor');

async function fixAppointmentCounselorIds() {
  try {
    // Get all counselors
    const counselors = await Counselor.find();
    console.log('Available counselors:');
    counselors.forEach(counselor => {
      console.log(`  ${counselor._id} - User: ${counselor.userId}`);
    });
    
    // Get appointments with invalid counselor IDs
    const appointments = await Appointment.find();
    console.log('\nAppointments needing counselor ID fix:');
    
    for (const appointment of appointments) {
      const counselorExists = await Counselor.findById(appointment.counselorId);
      if (!counselorExists) {
        console.log(`  Appointment ${appointment._id} has invalid counselor ID: ${appointment.counselorId}`);
        
        // Assign to first available counselor
        if (counselors.length > 0) {
          const newCounselorId = counselors[0]._id;
          await Appointment.findByIdAndUpdate(appointment._id, {
            counselorId: newCounselorId
          });
          console.log(`    -> Updated to use counselor ${newCounselorId}`);
        }
      }
    }
    
    // Now update counselor stats
    console.log('\nUpdating counselor performance stats...');
    for (const counselor of counselors) {
      const totalSessions = await Appointment.countDocuments({ 
        counselorId: counselor._id,
        status: 'completed'
      });
      
      const totalAppointments = await Appointment.countDocuments({ 
        counselorId: counselor._id
      });
      
      console.log(`Counselor ${counselor._id}: ${totalSessions} completed / ${totalAppointments} total`);
      
      // Update performance stats
      await Counselor.findByIdAndUpdate(counselor._id, {
        $set: {
          'performance.totalSessions': totalSessions,
          'performance.totalClients': totalSessions
        }
      });
    }
    
    console.log('\nDone! Counselor stats have been updated.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAppointmentCounselorIds();