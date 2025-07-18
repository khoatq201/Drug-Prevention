import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";
import { ManagerRoute, ConsultantRoute, NonConsultantRoute } from "./components/RoleProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RegisterComplete from "./pages/auth/RegisterComplete";
import OTPVerification from "./pages/auth/OTPVerification";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import GoogleAuthSuccess from "./pages/auth/GoogleAuthSuccess";
import ProfileComplete from "./pages/auth/ProfileComplete";
import Courses from "./pages/courses/Courses";
import CourseDetail from "./pages/courses/CourseDetail";
import Assessments from "./pages/assessments/Assessments";
import AssessmentDetail from "./pages/assessments/AssessmentDetail";
import AssessmentResult from "./pages/assessments/AssessmentResult";
import Blog from "./pages/blog/Blog";
import BlogPost from "./pages/blog/BlogPost";
import Appointments from "./pages/appointments/Appointments";
import AppointmentBooking from "./pages/appointments/AppointmentBooking";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import Users from "./pages/admin/Users";
import AdminCourses from "./pages/admin/AdminCourses";
import CourseForm from "./pages/admin/CourseForm";
import Blogs from "./pages/admin/Blogs";
import AdminAssessments from "./pages/admin/Assessments";
import AdminAssessmentDetail from "./pages/admin/AssessmentDetail";
import AdminCounselors from "./pages/admin/AdminCounselors";
import AdminAppointments from "./pages/admin/AdminAppointments";
import ManagerDashboard from "./pages/ManagerDashboard";
import Lesson from "./pages/courses/Lesson";
import ManagerCourses from "./pages/manager/ManagerCourses";
import ManagerAssessments from "./pages/manager/ManagerAssessments";
import ManagerBlogs from "./pages/manager/ManagerBlogs";
import ManagerCounselors from "./pages/manager/ManagerCounselors";
import CounselorDetail from "./pages/manager/CounselorDetail";
import AdminCounselorDetail from "./pages/admin/AdminCounselorDetail";
import CounselorForm from "./pages/manager/CounselorForm";
import ConsultantAppointments from "./pages/consultant/ConsultantAppointments";
import ConsultantSchedule from "./pages/consultant/ConsultantSchedule";
import ConsultantClients from "./pages/consultant/ConsultantClients";
import ConsultantProfile from "./pages/consultant/ConsultantProfile";
import ConsultantDashboard from "./pages/ConsultantDashboard";
import TestAuth from "./pages/TestAuth";
import AdminModulesLessons from "./pages/admin/AdminModulesLessons";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                }
              />
              <Route
                path="/register/complete"
                element={
                  <GuestRoute>
                    <RegisterComplete />
                  </GuestRoute>
                }
              />
              <Route
                path="/otp-verification"
                element={
                  <GuestRoute>
                    <OTPVerification />
                  </GuestRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <GuestRoute>
                    <ForgotPassword />
                  </GuestRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <GuestRoute>
                    <ResetPassword />
                  </GuestRoute>
                }
              />
              <Route
                path="/auth/google/success"
                element={<GoogleAuthSuccess />}
              />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route
                path="/assessments/:assessmentId/result/:resultId"
                element={<AssessmentResult />}
              />
              <Route path="/assessments/:id" element={<AssessmentDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/test-auth" element={<TestAuth />} />
              {/* Protected Routes */}
              <Route
                path="/profile/complete"
                element={
                  <ProtectedRoute>
                    <ProfileComplete />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <NonConsultantRoute>
                    <Appointments />
                  </NonConsultantRoute>
                }
              />
              <Route
                path="/appointments/book"
                element={
                  <NonConsultantRoute>
                    <AppointmentBooking />
                  </NonConsultantRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager"
                element={
                  <ManagerRoute>
                    <ManagerDashboard />
                  </ManagerRoute>
                }
              />
              <Route
                path="/manager/courses"
                element={
                  <ManagerRoute>
                    <ManagerCourses />
                  </ManagerRoute>
                }
              />
              <Route
                path="/manager/courses/new"
                element={
                  <ManagerRoute>
                    <CourseForm />
                  </ManagerRoute>
                }
              />
              <Route
                path="/manager/courses/edit/:id"
                element={
                  <ManagerRoute>
                    <CourseForm />
                  </ManagerRoute>
                }
              />
              <Route
                path="/manager/assessments"
                element={
                  <ManagerRoute>
                    <ManagerAssessments />
                  </ManagerRoute>
                }
              />
              <Route
                path="/manager/assessments/:id"
                element={
                  <ManagerRoute>
                    <AssessmentDetail />
                  </ManagerRoute>
                }
              />
              <Route
                path="/manager/blogs"
                element={
                  <ManagerRoute>
                    <ManagerBlogs />
                  </ManagerRoute>
                }
              />
              <Route
                path="/manager/counselors"
                element={
                  <ManagerRoute>
                    <ManagerCounselors />
                  </ManagerRoute>
                }
              />
              <Route
                path="/manager/counselors/new"
                element={
                  <ManagerRoute>
                    <CounselorForm />
                  </ManagerRoute>
                }
              />
              <Route
                path="/manager/counselors/:id"
                element={
                  <ManagerRoute>
                    <CounselorDetail />
                  </ManagerRoute>
                }
              />
              <Route
                path="/manager/counselors/:id/edit"
                element={
                  <ManagerRoute>
                    <CounselorForm />
                  </ManagerRoute>
                }
              />
              {/* Consultant Routes */}
              <Route
                path="/consultant"
                element={
                  <ProtectedRoute>
                    <ConsultantDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consultant/appointments"
                element={
                  <ProtectedRoute>
                    <ConsultantAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consultant/schedule"
                element={
                  <ProtectedRoute>
                    <ConsultantSchedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consultant/clients"
                element={
                  <ProtectedRoute>
                    <ConsultantClients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consultant/profile"
                element={
                  <ProtectedRoute>
                    <ConsultantProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <ProtectedRoute>
                    <AdminCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses/new"
                element={
                  <ProtectedRoute>
                    <CourseForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses/edit/:id"
                element={
                  <ProtectedRoute>
                    <CourseForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/blogs"
                element={
                  <ProtectedRoute>
                    <Blogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assessments"
                element={
                  <ProtectedRoute>
                    <AdminAssessments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assessments/:id"
                element={
                  <ProtectedRoute>
                    <AdminAssessmentDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/counselors"
                element={
                  <ProtectedRoute>
                    <AdminCounselors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/appointments"
                element={
                  <ProtectedRoute>
                    <AdminAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/counselors/:id"
                element={
                  <ProtectedRoute>
                    <AdminCounselorDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/counselors/:id/edit"
                element={
                  <ProtectedRoute>
                    <CounselorForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/counselors/new"
                element={
                  <ProtectedRoute>
                    <CounselorForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:id/lessons/:lessonId"
                element={<Lesson />}
              />
              <Route
                path="/admin/modules-lessons"
                element={
                  <ProtectedRoute>
                    <AdminModulesLessons />
                  </ProtectedRoute>
                }
              />
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "#374151",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              padding: "16px",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
