import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Inex from "@/pages/getstarted";
import { useAuth } from "@/pages/AuthContext";

const SiteLayout = () => {
  const { login, loading } = useAuth();

  if (loading) {
    return (
      <p className="text-center mt-10">Loading...</p>
    ); // or a spinner component
  }

  if (!login) {
    return <Inex />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default SiteLayout;
