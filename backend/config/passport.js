const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
require("dotenv").config();

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? `${process.env.BACKEND_URL}/api/auth/google/callback`
          : "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile:", profile);

        // Kiểm tra user đã tồn tại chưa
        let existingUser = await User.findOne({
          $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
        });

        if (existingUser) {
          // Cập nhật googleId nếu chưa có
          if (!existingUser.googleId) {
            existingUser.googleId = profile.id;
          }
          // Cập nhật thông tin từ Google nếu cần
          if (!existingUser.avatar && profile.photos[0]?.value) {
            existingUser.avatar = profile.photos[0].value;
          }
          existingUser.lastLogin = new Date();
          await existingUser.save();
          return done(null, existingUser);
        }

        // Tạo user mới từ Google profile
        const displayName = profile.displayName || "";
        const names = displayName.split(" ");
        const firstName = names[0] || "";
        const lastName = names.slice(1).join(" ") || "";

        const newUser = new User({
          googleId: profile.id,
          firstName: firstName,
          lastName: lastName,
          email: profile.emails[0].value,
          password: "google_oauth_" + Math.random().toString(36).substring(7), // Tạo password tạm thời
          avatar: profile.photos[0]?.value || null,
          role: "member",
          ageGroup: "other", // Default value, có thể yêu cầu user cập nhật sau
          isEmailVerified: false, // Google đã verify email
          isActive: true,
          lastLogin: new Date(),
        });

        await newUser.save();
        console.log("New Google user created:", newUser);

        return done(null, newUser);
      } catch (error) {
        console.error("Error in Google strategy:", error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
