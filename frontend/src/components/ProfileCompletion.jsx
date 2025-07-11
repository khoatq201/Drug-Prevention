import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const ProfileCompletion = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Kiểm tra xem user có cần hoàn thiện profile không
      const needsCompletion =
        !user.ageGroup ||
        user.ageGroup === "other" ||
        !user.firstName ||
        !user.lastName;

      if (needsCompletion && window.location.pathname !== "/profile/complete") {
        toast.info("Vui lòng hoàn thiện thông tin cá nhân của bạn");
        navigate("/profile/complete");
      }
    }
  }, [user, isAuthenticated, navigate]);

  return children;
};

export default ProfileCompletion;
