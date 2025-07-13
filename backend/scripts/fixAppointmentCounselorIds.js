const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drug_prevention');

const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Counselor = require('../models/Counselor');

async function fixAppointmentCounselorIds() {
  try {
    console.log('=== FIXING APPOINTMENT COUNSELOR IDS ===\n');
    
    // Find all appointments
    const appointments = await Appointment.find();
    console.log(`Found ${appointments.length} appointments to check\n`);
    
    for (const appointment of appointments) {
      console.log(`Checking appointment ${appointment._id}:`);
      console.log(`  Current counselorId: ${appointment.counselorId}`);
      
      // Check if counselorId points to User table
      const userMatch = await User.findById(appointment.counselorId);
      const counselorMatch = await Counselor.findById(appointment.counselorId);
      
      if (userMatch && !counselorMatch) {
        console.log(`  ❌ Points to User: ${userMatch.firstName} ${userMatch.lastName}`);
        
        // Find the corresponding Counselor record
        const correctCounselor = await Counselor.findOne({ userId: appointment.counselorId });
        
        if (correctCounselor) {
          console.log(`  ✅ Found correct Counselor ID: ${correctCounselor._id}`);
          
          // Update the appointment
          await Appointment.findByIdAndUpdate(appointment._id, {
            counselorId: correctCounselor._id
          });
          
          console.log(`  ✅ Updated appointment to use Counselor ID`);
        } else {
          console.log(`  ❌ No corresponding Counselor record found`);
        }
      } else if (counselorMatch) {
        console.log(`  ✅ Already points to Counselor - OK`);
      } else {
        console.log(`  ❌ Points to neither User nor Counselor - INVALID`);
      }
      
      console.log('');
    }
    
    // Now update all counselor stats
    console.log('=== UPDATING ALL COUNSELOR STATS ===\n');
    const counselors = await Counselor.find();
    
    for (const counselor of counselors) {
      const totalSessions = await Appointment.countDocuments({ 
        counselorId: counselor._id,
        status: 'completed'
      });
      
      const totalAppointments = await Appointment.countDocuments({ 
        counselorId: counselor._id
      });
      
      const completionRate = totalAppointments > 0 ? Math.round((totalSessions / totalAppointments) * 100) : 0;
      
      await Counselor.findByIdAndUpdate(counselor._id, {
        $set: {
          'performance.totalSessions': totalSessions,
          'performance.totalClients': totalSessions,
          'performance.completionRate': completionRate
        }
      });
      
      console.log(`Counselor ${counselor._id}: ${totalSessions}/${totalAppointments} sessions (${completionRate}%)`);
    }
    
    console.log('\n✅ All done! Appointment counselor IDs fixed and stats updated.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAppointmentCounselorIds();