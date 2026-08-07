import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLayout from "./pages/admin/AdminLayout";

/** Route Guard kiểm tra quyền Admin từ Server */
const AdminRoute = ({ children }) => {
  const [status, setStatus] = React.useState("loading");

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("denied");
      return;
    }
    import("./lib/api").then(({ default: axiosClient }) => {
      axiosClient
          .get("/api/users/profile")
          .then(({ data }) => {
            const role = data.data?.role || data.user?.role || data.role;
            setStatus(role === "admin" ? "ok" : "denied");
          })
          .catch(() => setStatus("denied"));
    });
  }, []);

  if (status === "loading") {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
          <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }
  if (status === "denied") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PagePlaceholder = ({ name }) => (
    <div className="rounded-2xl border border-dashed border-black/[0.12] bg-white p-8 text-center">
      <p className="text-sm text-[#8e8e93]">Màn hình đang phát triển:</p>
      <p className="mt-1 text-lg font-semibold text-[#1d1d1f]">{name}</p>
    </div>
);

export default function App() {
  return (
      <Router>
        <Routes>
          {/* Điều hướng mặc định thẳng vào trang Admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route
              path="/login"
              element={
                <div className="min-h-screen flex items-center justify-center text-sm text-[#6e6e73]">
                  Màn hình Đăng nhập (Thuộc Thành viên 5)
                </div>
              }
          />

          <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
          >
            <Route index element={<PagePlaceholder name="Dashboard Thống kê" />} />
          </Route>

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>

        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            pauseOnHover
            draggable
            closeOnClick
            theme="colored"
        />
      </Router>
  );
}