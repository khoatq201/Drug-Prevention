import React from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import AdminHeader from "../../components/layout/AdminHeader";
import CourseManager from "./CourseManager";

const AdminCourses = () => {
  return (
    <CourseManager
      role="admin"
      Sidebar={AdminSidebar}
      Header={AdminHeader}
      addCourseLink="/admin/courses/new"
      editCourseLink={(id) => `/admin/courses/edit/${id}`}
    />
  );
};

export default AdminCourses; 