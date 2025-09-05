import { BrowserRouter, Routes, Route } from "react-router-dom";
import SiteLayout from "./layouts/SiteLayout";
import LoginPage from "./pages/loginpage";
import Signup from "./pages/SignUp";
import ExploreBlogs from "./pages/explore";
import AuthSuccess from "./pages/AuthSuccess";
import About from "./pages/About";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CreateBlog from "./pages/postblog";
import EditBlog from "./pages/EditBlog";
import BlogDetail from "./pages/BlogDetail";
import Profile from "./pages/profile";
import UserProfile from "./pages/UserProfile";
import LoadingPage from "./components/LoadingPage";
import { ToastProvider } from "./contexts/ToastContext";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/SignUp" element={<Signup />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/loading" element={<LoadingPage />} />

        {/* Protected routes inside SiteLayout */}
        <Route element={<SiteLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:id" element={<UserProfile />} /> {/* public user profile */}
          <Route path="/blogs/:id" element={<BlogDetail />} /> {/* blog detail by ID - legacy */}
          <Route path="/blog/:slug" element={<BlogDetail />} /> {/* blog detail by slug */}
          <Route path="/createblog" element={<CreateBlog />} />
          <Route path="/editblog/:id" element={<EditBlog />} />
          <Route path="/" element={<Index />} />
          <Route path="/explore" element={<ExploreBlogs />} />
          <Route path="/about" element={<About />} />
        

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
