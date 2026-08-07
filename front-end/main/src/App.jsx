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
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage.jsx";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage.jsx";
import AdminReturnRequestsPage from "./pages/admin/AdminReturnRequestsPage.jsx";
import LoginPage from "./pages/LoginPage";

/** Route Guard kiểm tra quyền Admin từ Server */
const AdminRoute = ({ children }) => {
    const [status, setStatus] = React.useState("loading");

    React.useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { setStatus("denied"); return; }
        import("./lib/api").then(({ default: axiosClient }) => {
            axiosClient.get("/api/users/profile")
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

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Điều hướng mặc định vào /login hoặc /admin */}
                <Route path="/login" element={<LoginPage />} />

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }
                >
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="return-requests" element={<AdminReturnRequestsPage />} />
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