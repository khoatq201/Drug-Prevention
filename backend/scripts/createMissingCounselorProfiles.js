const mongoose = require('mongoose');
const User = require('../models/User');
const Counselor = require('../models/Counselor');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drug_prevention', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const createMissingCounselorProfiles = async () => {
  try {
    await connectDB();

    // Find all users with consultant role
    const consultantUsers = await User.find({ role: 'consultant' });
    console.log(`Found ${consultantUsers.length} consultant users`);

    let createdCount = 0;
    let existingCount = 0;
    let verifiedCount = 0;

    for (const user of consultantUsers) {
      // Check if counselor profile already exists
      const existingCounselor = await Counselor.findOne({ userId: user._id });
      
      if (existingCounselor) {
        console.log(`✓ Counselor profile already exists for ${user.email}`);
        existingCount++;
        
        // Check if counselor needs to be verified
        if (!existingCounselor.verificationStatus.isVerified) {
          existingCounselor.verificationStatus.isVerified = true;
          existingCounselor.verificationStatus.verifiedAt = new Date();
          existingCounselor.settings.isPublicProfile = true;
          existingCounselor.settings.allowDirectBooking = true;
          await existingCounselor.save();
          console.log(`✅ Verified counselor profile for ${user.email}`);
          verifiedCount++;
        }
        
        continue;
      }

      // Create counselor profile
      const counselorProfile = new Counselor({
        userId: user._id,
        biography: "",
        specializations: [],
        languages: [{ language: "vi", proficiency: "native" }], // Default to Vietnamese
        experience: {
          totalYears: 0,
          workHistory: []
        },
        education: [],
        certifications: [],
        areasOfExpertise: [],
        availability: {
          workingHours: {
            monday: { isAvailable: false, slots: [] },
            tuesday: { isAvailable: false, slots: [] },
            wednesday: { isAvailable: false, slots: [] },
            thursday: { isAvailable: false, slots: [] },
            friday: { isAvailable: false, slots: [] },
            saturday: { isAvailable: false, slots: [] },
            sunday: { isAvailable: false, slots: [] },
          },
          exceptions: []
        },
        sessionSettings: {
          defaultDuration: 60,
          breakBetweenSessions: 15,
          maxAppointmentsPerDay: 8,
          advanceBookingDays: 30
        },
        contactPreferences: {
          preferredContactMethod: "email",
          businessEmail: user.email,
          businessPhone: user.phone || ""
        },
        settings: {
          isPublicProfile: true, // Allow managers to see new counselors
          allowOnlineConsultations: true // Allow online booking for new counselors
        },
        verificationStatus: {
          isVerified: false,
          documents: []
        },
        status: "active"
      });

      await counselorProfile.save();
      console.log(`✅ Created counselor profile for ${user.email}`);
      createdCount++;
    }

    console.log('\n=== Summary ===');
    console.log(`Total consultant users: ${consultantUsers.length}`);
    console.log(`Existing counselor profiles: ${existingCount}`);
    console.log(`New counselor profiles created: ${createdCount}`);
    console.log(`Counselor profiles verified: ${verifiedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating counselor profiles:', error);
    process.exit(1);
  }
};

// Run the script
createMissingCounselorProfiles();