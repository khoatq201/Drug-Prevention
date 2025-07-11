import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const GoogleOAuthHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { dispatch } = useAuth();

  useEffect(() => {
    const data = searchParams.get("data");
    const error = searchParams.get("error");

    if (data) {
      console.log("✅ Google OAuth success, processing data...");

      try {
        const authData = JSON.parse(decodeURIComponent(data));
        const { user, token, refreshToken } = authData;

        // Store tokens in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);

        // Dispatch login success
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user,
            token,
            refreshToken,
          },
        });

        console.log("✅ Google OAuth login success dispatched");
        toast.success("Đăng nhập Google thành công!");

        // Clean the URL by removing query params
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);

        // Navigate to dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } catch (error) {
        console.error("Error processing Google OAuth data:", error);
        toast.error("Lỗi xử lý dữ liệu đăng nhập!");
        navigate("/login");
      }
    } else if (error) {
      console.error("❌ Google OAuth error:", error);
      toast.error(decodeURIComponent(error));
      navigate("/login");
    }
  }, [searchParams, dispatch, navigate]);

  return null; // This component doesn't render anything
};

export default GoogleOAuthHandler;
