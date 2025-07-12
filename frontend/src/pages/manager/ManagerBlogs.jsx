import React from "react";
import ManagerSidebar from "../../components/layout/ManagerSidebar";
import ManagerHeader from "../../components/layout/ManagerHeader";
import BlogManager from "../admin/BlogManager";

const ManagerBlogs = () => {
  return (
    <BlogManager
      role="manager"
      Sidebar={ManagerSidebar}
      Header={ManagerHeader}
    />
  );
};

export default ManagerBlogs; 