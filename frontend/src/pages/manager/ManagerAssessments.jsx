import React from "react";
import ManagerSidebar from "../../components/layout/ManagerSidebar";
import ManagerHeader from "../../components/layout/ManagerHeader";
import AssessmentManager from "../admin/AssessmentManager";

const ManagerAssessments = () => {
  return (
    <AssessmentManager
      role="manager"
      Sidebar={ManagerSidebar}
      Header={ManagerHeader}
    />
  );
};

export default ManagerAssessments; 