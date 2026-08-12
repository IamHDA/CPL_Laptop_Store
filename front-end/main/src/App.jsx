import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage.jsx";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage.jsx";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";
import AdminVouchersPage from "./pages/admin/AdminVouchersPage.jsx";
import AdminFlashSalesPage from "./pages/admin/AdminFlashSalesPage.jsx";
import AdminBannersPage from "./pages/admin/AdminBannersPage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminHomepageSettingsPage from "./pages/admin/AdminHomepageSettingsPage.jsx";
import AdminReturnRequestsPage from "./pages/admin/AdminReturnRequestsPage.jsx";

// Customer Pages
import HomePage from "./pages/HomePage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import ComparePage from "./pages/ComparePage.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import PaymentResultPage from "./pages/PaymentResultPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

/**
 * Đưa trang về đầu khi đổi route. Không có nó thì vị trí cuộn của trang cũ được
 * giữ nguyên: đang ở cuối /products bấm "So sánh" là trang mới mở ra ở giữa,
 * mất cả tiêu đề lẫn bộ lọc.
 *
 * Chỉ cuộn khi điều hướng kiểu PUSH/REPLACE. Với POP (nút back/forward) thì để
 * yên, vì lúc đó người dùng mong quay lại đúng chỗ mình đã rời đi.
 *
 * ScrollRestoration của React Router chỉ dùng được với data router
 * (createBrowserRouter), app này đang dùng BrowserRouter + Routes nên tự làm.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  React.useEffect(() => {
    if (navigationType === "POP") return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, navigationType]);

  return null;
}

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

/** Route Guard kiểm tra đăng nhập cho Khách hàng */
const CustomerRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Customer Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
        <Route path="/payment-result" element={<PaymentResultPage />} />
        <Route path="/payment/result" element={<PaymentResultPage />} />

        {/* Protected Customer Routes */}
        <Route
          path="/checkout"
          element={
            <CustomerRoute>
              <CheckoutPage />
            </CustomerRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <CustomerRoute>
              <OrdersPage />
            </CustomerRoute>
          }
        />
        <Route
          path="/account"
          element={
            <CustomerRoute>
              <AccountPage />
            </CustomerRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <CustomerRoute>
              <WishlistPage />
            </CustomerRoute>
          }
        />

        {/* Protected Admin Routes */}
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
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="flash-sales" element={<AdminFlashSalesPage />} />
          <Route path="vouchers" element={<AdminVouchersPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="return-requests" element={<AdminReturnRequestsPage />} />
          <Route path="homepage-settings" element={<AdminHomepageSettingsPage />} />
        </Route>

        {/* 404 Catch All Route */}
        <Route path="*" element={<NotFoundPage />} />
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
