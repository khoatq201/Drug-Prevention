import React, { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Setup axios interceptors
  useEffect(() => {
    // Request interceptor to add token
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        // Use token from localStorage or state
        const token = state.token || localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(
          "🔍 Axios request with token:",
          token ? "exists" : "missing"
        );
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken =
              state.refreshToken || localStorage.getItem("refreshToken");
            if (refreshToken) {
              const response = await axios.post(
                `${API_BASE_URL}/auth/refresh-token`,
                { refreshToken }
              );

              const { token, refreshToken } = response.data;

              dispatch({
                type: "LOGIN_SUCCESS",
                payload: {
                  user: state.user,
                  token,
                  refreshToken,
                },
              });

              localStorage.setItem("token", token);
              localStorage.setItem("refreshToken", refreshToken);

              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            dispatch({ type: "LOGOUT" });
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            toast.error("Phiên đăng nhập đã hết hạn");
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [state.token, state.refreshToken, state.user]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check if we're on Google OAuth success page
      if (window.location.pathname === "/auth/google/success") {
        console.log("🔍 Skipping auth check on Google success page");
        return;
      }

      const token = localStorage.getItem("token");
      if (token) {
        try {
          dispatch({ type: "SET_LOADING", payload: true });
          const response = await api.get("/auth/profile");
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              user: response.data.user,
              token,
              refreshToken: localStorage.getItem("refreshToken"),
            },
          });
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          dispatch({ type: "LOGOUT" });
        } finally {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      }
    };

    checkAuth();
  }, []);

  // Auth actions
  const login = async (email, password) => {
    try {
      dispatch({ type: "LOGIN_START" });

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { user, token, refreshToken } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token, refreshToken },
      });

      // Set flag to show welcome toast
      sessionStorage.setItem("justLoggedIn", "true");
      toast.success("Đăng nhập thành công!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Đăng nhập thất bại";
      dispatch({ type: "LOGIN_FAILURE", payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: "LOGIN_START" });

      const response = await api.post("/auth/register", userData);
      const { user, token, refreshToken } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token, refreshToken },
      });

      toast.success("Đăng ký thành công!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Đăng ký thất bại";
      dispatch({ type: "LOGIN_FAILURE", payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    dispatch({ type: "LOGOUT" });
    toast.success("Đăng xuất thành công");
  };

  const updateProfile = async (updates) => {
    try {
      const response = await api.put("/auth/profile", updates);
      dispatch({ type: "UPDATE_USER", payload: response.data.user });
      toast.success("Cập nhật profile thành công");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Cập nhật thất bại";
      toast.error(message);
      return { success: false, message };
    }
  };

  const loginWithGoogle = (userData) => {
    try {
      const { user, token, refreshToken } = userData;
      console.log("🔍 loginWithGoogle called with:", {
        user,
        tokenExists: !!token,
        refreshTokenExists: !!refreshToken,
      });

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

      console.log("✅ loginWithGoogle dispatch completed");
      toast.success("Đăng nhập Google thành công!");
      return { success: true };
    } catch (error) {
      console.error("❌ loginWithGoogle error:", error);
      const message = "Đăng nhập Google thất bại";
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    loginWithGoogle, // Add Google login method
    dispatch, // Export dispatch for direct state management
    api, // Export api instance for use in other components
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
