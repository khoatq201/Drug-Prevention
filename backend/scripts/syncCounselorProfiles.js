/**
 * Script to ensure all consultant users have counselor profiles
 * Run this script to sync existing data
 */

const mongoose = require("mongoose");
const User = require("../models/User");
const Counselor = require("../models/Counselor");

// Load environment variables
require("dotenv").config();

const syncCounselorProfiles = async () => {
  try {
    console.log("🔄 Starting counselor profile sync...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all consultant users
    const consultantUsers = await User.find({ role: "consultant" });
    console.log(`📊 Found ${consultantUsers.length} consultant users`);

    // Find existing counselor profiles
    const existingCounselors = await Counselor.find().populate("userId");
    const existingCounselorUserIds = existingCounselors.map(c => c.userId._id.toString());
    console.log(`📊 Found ${existingCounselors.length} existing counselor profiles`);

    // Find consultants without counselor profiles
    const consultantsWithoutProfiles = consultantUsers.filter(
      user => !existingCounselorUserIds.includes(user._id.toString())
    );
    
    console.log(`🔍 Found ${consultantsWithoutProfiles.length} consultants without counselor profiles`);

    if (consultantsWithoutProfiles.length === 0) {
      console.log("✅ All consultant users already have counselor profiles!");
      return;
    }

    // Create counselor profiles for consultants without them
    let created = 0;
    for (const user of consultantsWithoutProfiles) {
      try {
        const counselorProfile = new Counselor({
          userId: user._id,
          biography: "",
          specializations: [],
          languages: [{ language: "vi", proficiency: "native" }],
          experience: {
            totalYears: 0,
            workHistory: []
          },
          education: [],
          certifications: [],
          areasOfExpertise: [],
          availability: {
            workingHours: {
              monday: { isAvailable: true, slots: [{ start: "09:00", end: "17:00" }] },
              tuesday: { isAvailable: true, slots: [{ start: "09:00", end: "17:00" }] },
              wednesday: { isAvailable: true, slots: [{ start: "09:00", end: "17:00" }] },
              thursday: { isAvailable: true, slots: [{ start: "09:00", end: "17:00" }] },
              friday: { isAvailable: true, slots: [{ start: "09:00", end: "17:00" }] },
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
            isPublicProfile: true,
            allowOnlineConsultations: true,
            autoConfirmAppointments: false,
            sendReminders: true
          },
          verificationStatus: {
            isVerified: true, // Auto-verify existing consultants
            verifiedAt: new Date(),
            verifiedBy: null, // System sync
            documents: []
          },
          status: "active"
        });
        
        await counselorProfile.save();
        created++;
        console.log(`✅ Created counselor profile for ${user.firstName} ${user.lastName} (${user.email})`);
      } catch (error) {
        console.error(`❌ Failed to create counselor profile for ${user.email}:`, error.message);
      }
    }

    console.log(`\n🎉 Sync completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Total consultant users: ${consultantUsers.length}`);
    console.log(`   - Existing counselor profiles: ${existingCounselors.length}`);
    console.log(`   - New profiles created: ${created}`);
    console.log(`   - Failed creations: ${consultantsWithoutProfiles.length - created}`);

  } catch (error) {
    console.error("❌ Sync failed:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("📝 Database connection closed");
    process.exit(0);
  }
};

// Run the sync
if (require.main === module) {
  syncCounselorProfiles();
}

module.exports = syncCounselorProfiles;