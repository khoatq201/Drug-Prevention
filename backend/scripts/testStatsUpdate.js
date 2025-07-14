const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drug_prevention');

const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Counselor = require('../models/Counselor');

async function testStatsUpdate() {
  try {
    // Find a counselor and user
    const counselor = await Counselor.findOne();
    const user = await User.findOne({ role: 'member' });
    
    if (!counselor || !user) {
      console.log('Need both counselor and user for test');
      process.exit(1);
    }
    
    console.log('Before creating appointment:');
    console.log('Counselor stats:', counselor.performance);
    
    // Check current appointment counts
    const currentTotal = await Appointment.countDocuments({ counselorId: counselor._id });
    const currentCompleted = await Appointment.countDocuments({ 
      counselorId: counselor._id, 
      status: 'completed' 
    });
    
    console.log(`Current appointments: ${currentTotal} total, ${currentCompleted} completed`);
    
    // Create a test appointment
    const appointment = new Appointment({
      userId: user._id,
      counselorId: counselor._id,
      appointmentDate: new Date('2025-01-15'),
      appointmentTime: { start: '10:00', end: '11:00' },
      type: 'online',
      reason: 'Test appointment for stats update',
      urgency: 'medium',
      contactInfo: {
        email: user.email,
        phoneNumber: user.phone || '0123456789'
      }
    });
    
    await appointment.save();
    console.log('\nCreated appointment:', appointment._id);
    
    // Now update appointment to completed
    await Appointment.findByIdAndUpdate(appointment._id, { status: 'completed' });
    console.log('Updated appointment to completed');
    
    // Check final counts
    const finalTotal = await Appointment.countDocuments({ counselorId: counselor._id });
    const finalCompleted = await Appointment.countDocuments({ 
      counselorId: counselor._id, 
      status: 'completed' 
    });
    
    console.log(`Final appointments: ${finalTotal} total, ${finalCompleted} completed`);
    
    // Manual update of counselor stats (simulating what should happen automatically)
    const completionRate = finalTotal > 0 ? Math.round((finalCompleted / finalTotal) * 100) : 0;
    
    await Counselor.findByIdAndUpdate(counselor._id, {
      $set: {
        'performance.totalSessions': finalCompleted,
        'performance.totalClients': finalCompleted,
        'performance.completionRate': completionRate
      }
    });
    
    const updatedCounselor = await Counselor.findById(counselor._id);
    console.log('\nUpdated counselor stats:', updatedCounselor.performance);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testStatsUpdate();