/**
 * Script to check data consistency between Users, Counselors, and Appointments
 * Run this script to verify all data relationships are correct
 */

const mongoose = require("mongoose");
const User = require("../models/User");
const Counselor = require("../models/Counselor");
const Appointment = require("../models/Appointment");

// Load environment variables
require("dotenv").config();

const checkDataConsistency = async () => {
  try {
    console.log("🔍 Starting data consistency check...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n" + "=".repeat(60));
    console.log("1. CHECKING USER-COUNSELOR RELATIONSHIPS");
    console.log("=".repeat(60));

    // Check consultant users without counselor profiles
    const consultantUsers = await User.find({ role: "consultant" });
    const counselors = await Counselor.find().populate("userId");
    const counselorUserIds = counselors.map(c => c.userId._id.toString());

    const consultantsWithoutProfiles = consultantUsers.filter(
      user => !counselorUserIds.includes(user._id.toString())
    );

    console.log(`📊 Total consultant users: ${consultantUsers.length}`);
    console.log(`📊 Total counselor profiles: ${counselors.length}`);
    console.log(`⚠️  Consultants without counselor profiles: ${consultantsWithoutProfiles.length}`);

    if (consultantsWithoutProfiles.length > 0) {
      console.log("❌ Found consultants without counselor profiles:");
      consultantsWithoutProfiles.forEach(user => {
        console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`);
      });
    }

    // Check counselor profiles with missing users
    const orphanedCounselors = counselors.filter(c => !c.userId);
    console.log(`⚠️  Orphaned counselor profiles (no user): ${orphanedCounselors.length}`);

    if (orphanedCounselors.length > 0) {
      console.log("❌ Found orphaned counselor profiles:");
      orphanedCounselors.forEach(counselor => {
        console.log(`   - Counselor ID: ${counselor._id}`);
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("2. CHECKING APPOINTMENT RELATIONSHIPS");
    console.log("=".repeat(60));

    const appointments = await Appointment.find()
      .populate("userId", "firstName lastName email role")
      .populate("counselorId", "firstName lastName email role");

    console.log(`📊 Total appointments: ${appointments.length}`);

    // Check appointments with missing users
    const appointmentsWithMissingUsers = appointments.filter(apt => !apt.userId);
    console.log(`⚠️  Appointments with missing users: ${appointmentsWithMissingUsers.length}`);

    // Check appointments with missing counselors
    const appointmentsWithMissingCounselors = appointments.filter(apt => !apt.counselorId);
    console.log(`⚠️  Appointments with missing counselors: ${appointmentsWithMissingCounselors.length}`);

    // Check appointments where counselorId doesn't have consultant role
    const appointmentsWithInvalidCounselors = appointments.filter(apt => 
      apt.counselorId && apt.counselorId.role !== "consultant"
    );
    console.log(`⚠️  Appointments with non-consultant counselors: ${appointmentsWithInvalidCounselors.length}`);

    if (appointmentsWithInvalidCounselors.length > 0) {
      console.log("❌ Found appointments with invalid counselors:");
      appointmentsWithInvalidCounselors.forEach(apt => {
        console.log(`   - Appointment ${apt._id}: counselor ${apt.counselorId.email} has role "${apt.counselorId.role}"`);
      });
    }

    // Check appointments where counselorId doesn't have a counselor profile
    const appointmentsWithoutCounselorProfiles = [];
    for (const apt of appointments) {
      if (apt.counselorId) {
        const counselorProfile = await Counselor.findOne({ userId: apt.counselorId._id });
        if (!counselorProfile) {
          appointmentsWithoutCounselorProfiles.push(apt);
        }
      }
    }
    console.log(`⚠️  Appointments where counselor has no profile: ${appointmentsWithoutCounselorProfiles.length}`);

    if (appointmentsWithoutCounselorProfiles.length > 0) {
      console.log("❌ Found appointments with counselors lacking profiles:");
      appointmentsWithoutCounselorProfiles.forEach(apt => {
        console.log(`   - Appointment ${apt._id}: counselor ${apt.counselorId.email} has no counselor profile`);
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("3. CHECKING COUNSELOR PROFILE INTEGRITY");
    console.log("=".repeat(60));

    // Check counselor verification status
    const verifiedCounselors = counselors.filter(c => c.verificationStatus?.isVerified);
    const unverifiedCounselors = counselors.filter(c => !c.verificationStatus?.isVerified);
    const publicCounselors = counselors.filter(c => c.settings?.isPublicProfile);

    console.log(`📊 Verified counselors: ${verifiedCounselors.length}`);
    console.log(`📊 Unverified counselors: ${unverifiedCounselors.length}`);
    console.log(`📊 Public profile counselors: ${publicCounselors.length}`);

    // Check counselors visible in appointment booking
    const bookableCounselors = counselors.filter(c => 
      c.status === "active" && 
      c.verificationStatus?.isVerified === true && 
      c.settings?.isPublicProfile === true
    );
    console.log(`📊 Counselors visible in booking: ${bookableCounselors.length}`);

    if (unverifiedCounselors.length > 0) {
      console.log("⚠️  Unverified counselors (won't appear in public booking):");
      unverifiedCounselors.forEach(counselor => {
        console.log(`   - ${counselor.userId?.firstName} ${counselor.userId?.lastName} (${counselor.userId?.email})`);
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("4. SUMMARY & RECOMMENDATIONS");
    console.log("=".repeat(60));

    let hasIssues = false;

    if (consultantsWithoutProfiles.length > 0) {
      console.log("🔧 RECOMMENDED ACTION: Run syncCounselorProfiles.js to create missing counselor profiles");
      hasIssues = true;
    }

    if (orphanedCounselors.length > 0) {
      console.log("🔧 RECOMMENDED ACTION: Manually review and fix orphaned counselor profiles");
      hasIssues = true;
    }

    if (appointmentsWithInvalidCounselors.length > 0) {
      console.log("🔧 RECOMMENDED ACTION: Update appointment counselorId references or user roles");
      hasIssues = true;
    }

    if (appointmentsWithoutCounselorProfiles.length > 0) {
      console.log("🔧 RECOMMENDED ACTION: Create counselor profiles for appointment counselors");
      hasIssues = true;
    }

    if (unverifiedCounselors.length > 0) {
      console.log("🔧 RECOMMENDED ACTION: Verify counselor profiles via admin panel");
      hasIssues = true;
    }

    if (!hasIssues) {
      console.log("✅ All data relationships are consistent!");
    }

    console.log(`\n📊 FINAL STATS:`);
    console.log(`   - Consultant users: ${consultantUsers.length}`);
    console.log(`   - Counselor profiles: ${counselors.length}`);
    console.log(`   - Appointments: ${appointments.length}`);
    console.log(`   - Bookable counselors: ${bookableCounselors.length}`);

  } catch (error) {
    console.error("❌ Consistency check failed:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("\n📝 Database connection closed");
    process.exit(0);
  }
};

// Run the check
if (require.main === module) {
  checkDataConsistency();
}

module.exports = checkDataConsistency;