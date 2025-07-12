import React from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import AdminHeader from "../../components/layout/AdminHeader";
import BlogManager from "./BlogManager";

const Blogs = () => {
  return (
    <BlogManager
      role="admin"
      Sidebar={AdminSidebar}
      Header={AdminHeader}
    />
  );
};

export default Blogs; 