import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ChatWidget from './components/common/ChatWidget';
import { Suspense, lazy } from 'react';

// Common Components (eager load)
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// ─── Lazy Load Pages with Preload Support ──────────────────────────────────────
// Each entry stores both the lazy component and the import function for prefetching.
const lazyWithPreload = (factory) => {
    const Component = lazy(factory);
    Component.preload = factory;
    return Component;
};

const LandingPage = lazyWithPreload(() => import('./pages/public/LandingPage'));
const RegisterPage = lazyWithPreload(() => import('./pages/public/RegisterPage'));
const CatalogPage = lazyWithPreload(() => import('./pages/public/CatalogPage'));
const AuthCallback = lazyWithPreload(() => import('./pages/public/AuthCallback'));
const ForgotPasswordPage = lazyWithPreload(() => import('./pages/public/ForgotPasswordPage'));
const ResetPasswordPage = lazyWithPreload(() => import('./pages/public/ResetPasswordPage'));
const BookDetailPage = lazyWithPreload(() => import('./pages/public/BookDetailPage'));

const MemberDashboard = lazyWithPreload(() => import('./pages/member/MemberDashboard'));
const MyBorrowsPage = lazyWithPreload(() => import('./pages/member/MyBorrowsPage'));
const MyReservationsPage = lazyWithPreload(() => import('./pages/member/MyReservationsPage'));
const MyFinesPage = lazyWithPreload(() => import('./pages/member/MyFinesPage'));
const ProfilePage = lazyWithPreload(() => import('./pages/member/ProfilePage'));
const NotificationsPage = lazyWithPreload(() => import('./pages/member/NotificationsPage'));
const MyReviewsPage = lazyWithPreload(() => import('./pages/member/MyReviewsPage'));
const MyWishlistPage = lazyWithPreload(() => import('./pages/member/MyWishlistPage'));

const LibrarianDashboard = lazyWithPreload(() => import('./pages/librarian/LibrarianDashboard'));
const ManageBooksPage = lazyWithPreload(() => import('./pages/librarian/ManageBooksPage'));
const IssueBookPage = lazyWithPreload(() => import('./pages/librarian/IssueBookPage'));
const ReturnBookPage = lazyWithPreload(() => import('./pages/librarian/ReturnBookPage'));

const AdminDashboard = lazyWithPreload(() => import('./pages/admin/AdminDashboard'));
const ManageUsersPage = lazyWithPreload(() => import('./pages/admin/ManageUsersPage'));
const ReportsPage = lazyWithPreload(() => import('./pages/admin/ReportsPage'));

// ─── Route → Component mapping for preloading ────────────────────────────────
export const routeComponentMap = {
    '/dashboard': MemberDashboard,
    '/dashboard/borrows': MyBorrowsPage,
    '/dashboard/reservations': MyReservationsPage,
    '/dashboard/fines': MyFinesPage,
    '/dashboard/profile': ProfilePage,
    '/dashboard/notifications': NotificationsPage,
    '/dashboard/reviews': MyReviewsPage,
    '/dashboard/wishlist': MyWishlistPage,
    '/librarian/dashboard': LibrarianDashboard,
    '/librarian/books': ManageBooksPage,
    '/librarian/issue': IssueBookPage,
    '/librarian/return': ReturnBookPage,
    '/admin': AdminDashboard,
    '/admin/users': ManageUsersPage,
    '/admin/reports': ReportsPage,
    '/admin/books': ManageBooksPage,
    '/admin/issue': IssueBookPage,
    '/admin/return': ReturnBookPage,
    '/catalog': CatalogPage,
};

const PageLoader = () => (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-12 h-12 border-4 border-[#0d5959]/20 border-t-[#0d5959] dark:border-teal-400/20 dark:border-t-teal-400 rounded-full animate-spin"></div>
    </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <ChatWidget />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LandingPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/books/:id" element={<BookDetailPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protected Member Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<MemberDashboard />} />
                <Route path="borrows" element={<MyBorrowsPage />} />
                <Route path="reservations" element={<MyReservationsPage />} />
                <Route path="fines" element={<MyFinesPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="reviews" element={<MyReviewsPage />} />
                <Route path="wishlist" element={<MyWishlistPage />} />
              </Route>

              {/* Protected Librarian Routes */}
              <Route path="/librarian" element={<ProtectedRoute roles={['librarian', 'admin']}><DashboardLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<LibrarianDashboard />} />
                <Route path="books" element={<ManageBooksPage />} />
                <Route path="issue" element={<IssueBookPage />} />
                <Route path="return" element={<ReturnBookPage />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<ManageUsersPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="books" element={<ManageBooksPage />} />
                <Route path="issue" element={<IssueBookPage />} />
                <Route path="return" element={<ReturnBookPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
