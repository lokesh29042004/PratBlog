import { Link, NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Menu } from "lucide-react"; // hamburger icon
import UserMenu from "@/pages/UserMenu";
import CreateBlogModal from "@/pages/postblog";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 shadow-sm bg-gray-100 ">
      <nav className="  mx-5 flex h-16 items-center justify-between max-w">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img
            src="src/assets/ChatGPT_Image_Aug_14__2025__02_37_44_PM-removebg-preview.png"
            alt="PratBlog Logo"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-zinc-200 text-zinc-900"
                  : "hover:bg-zinc-200 hover:text-zinc-900"
              }`
            }
          >
            Explore Blogs
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-zinc-200 text-zinc-900"
                  : "hover:bg-zinc-200 hover:text-zinc-900"
              }`
            }
          >
            About
          </NavLink>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          {/* Create Blog */}
          <CreateBlogModal />

          {/* User Menu */}
          <UserMenu />

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden relative" ref={menuRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-gray-200"
            >
              <Menu className="h-6 w-6" />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-50">
                <NavLink
                  to="/explore"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Explore Blogs
                </NavLink>
                <NavLink
                  to="/about"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
