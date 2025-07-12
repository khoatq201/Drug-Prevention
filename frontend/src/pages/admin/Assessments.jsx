import React from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import AdminHeader from "../../components/layout/AdminHeader";
import AssessmentManager from "./AssessmentManager";

const Assessments = () => {
  return (
    <AssessmentManager
      role="admin"
      Sidebar={AdminSidebar}
      Header={AdminHeader}
    />
  );
};

export default Assessments; 