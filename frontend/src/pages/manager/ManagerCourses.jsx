import React from "react";
import ManagerSidebar from "../../components/layout/ManagerSidebar";
import ManagerHeader from "../../components/layout/ManagerHeader";
import CourseManager from "../admin/CourseManager";

const ManagerCourses = () => {
  return (
    <CourseManager
      role="manager"
      Sidebar={ManagerSidebar}
      Header={ManagerHeader}
      addCourseLink="/manager/courses/new"
      editCourseLink={(id) => `/manager/courses/edit/${id}`}
    />
  );
};

export default ManagerCourses; 