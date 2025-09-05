import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, User, Calendar, ArrowRight, Loader2, SlidersHorizontal, X, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UserPreview from "@/components/UserPreview";
import { useAuth } from "@/pages/AuthContext";

export default function ExploreBlogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>(["All", "Tech", "Travel", "Food", "Lifestyle", "Education", "Health"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const handleLike = async (e: React.MouseEvent, blogId: string) => {
    e.stopPropagation();
    if (!login) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blogId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        const newLikedPosts = new Set(likedPosts);
        if (data.liked) {
          newLikedPosts.add(blogId);
        } else {
          newLikedPosts.delete(blogId);
        }
        setLikedPosts(newLikedPosts);
        
        // Update posts count in both blogs and filteredBlogs
        const updatePosts = (posts: any[]) => posts.map(post => 
          post.id.toString() === blogId 
            ? { ...post, likes_count: data.liked ? (post.likes_count || 0) + 1 : Math.max(0, (post.likes_count || 0) - 1) }
            : post
        );
        
        setBlogs(prev => updatePosts(prev));
        setFilteredBlogs(prev => updatePosts(prev));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/blogs`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setBlogs(data.blogs || []);
          setFilteredBlogs(data.blogs || []);
        } else {
          setError("Failed to load blogs");
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    const fetchLikedPosts = async () => {
      if (!login || !user) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}/liked-blogs`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          const likedIds = new Set(data.blogs.map((blog: any) => blog.id.toString()));
          setLikedPosts(likedIds);
        }
      } catch (err) {
        console.error("Error fetching liked posts:", err);
      }
    };

    fetchBlogs();
    fetchLikedPosts();
  }, [login, user]);

  // Filtering and sorting logic
  useEffect(() => {
    let filtered = [...blogs];

    // Filter by categories
    if (!selectedCategories.includes("All")) {
      filtered = filtered.filter((b) => {
        const blogCategory = (b.category || "General").toLowerCase();
        return selectedCategories.some((cat) => {
          const selectedCat = cat.toLowerCase();
          // Check if blog category contains the selected category (for multi-category support)
          return blogCategory.includes(selectedCat);
        });
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.display_name?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q)
      );
    }

    // Sort blogs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime();
        case "oldest":
          return new Date(a.created_at || a.date || 0).getTime() - new Date(b.created_at || b.date || 0).getTime();
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "author":
          return (a.display_name || a.author || "").localeCompare(b.display_name || b.author || "");
        default:
          return 0;
      }
    });

    setFilteredBlogs(filtered);
  }, [searchQuery, selectedCategories, blogs, sortBy]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading amazing blogs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const toggleCategory = (cat: string) => {
    if (cat === "All") {
      setSelectedCategories(["All"]);
    } else {
      setSelectedCategories((prev) => {
        let updated = prev.includes("All") ? [] : [...prev];

        if (updated.includes(cat)) {
          updated = updated.filter((c) => c !== cat);
        } else {
          updated.push(cat);
        }

        return updated.length > 0 ? updated : ["All"];
      });
    }
  };

  return (
    <div className="min-h-screen bg-white from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-[#131313] from-blue-600 to-purple-700 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-white leading-tight">
            Discover Amazing Stories
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Explore our collection of insightful blogs from talented writers around the world
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search blogs, authors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 hover:bg-zinc-100 focus:ring-1 focus:ring-[#333333] focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-gray-800 " />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-white hover:bg-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="newest" className="hover:bg-white focus:bg-white">Newest First</SelectItem>
                  <SelectItem value="oldest" className="hover:bg-white focus:bg-white">Oldest First</SelectItem>
                  <SelectItem value="title" className="hover:bg-white focus:bg-white">Title A-Z</SelectItem>
                  <SelectItem value="author" className="hover:bg-white focus:bg-white">Author A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 mr-2">Categories:</span>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategories.includes(cat) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCategory(cat)}
                className={
                  selectedCategories.includes(cat)
                    ? "bg-zinc-200 hover:bg-zinc-200 text-gray-900"
                    : "hover:bg-zinc-100 hover:text-gray-900 hover:border-gray-300"
                }
              >
                {cat}
              </Button>
            ))}
          </div>

        </div>



        {/* Blog Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20">
            <div className="rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategories(["All"]);
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {filteredBlogs.map((post) => (
              <Card
                key={post.id}
                className="group relative overflow-hidden cursor-pointer transition-all duration-700 ease-out transform rounded-xl bg-white shadow-lg hover:shadow-[0_35px_60px_-12px_rgba(0,0,0,0.3)] border border-gray-100"
                onClick={() => navigate(`/blog/${post.slug || post.id}`)}
              >
                 {/* Blog Image */}
                 <figure className="relative overflow-hidden">
                   <img
                    src={`${import.meta.env.VITE_API_BASE_URL}${post.image_url}`}
                    alt={post.title}
                    className="w-full h-64 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 group-hover:saturate-125"
                    onError={(e) => (e.currentTarget.src = "/fallback-blog.jpg")}
                   />

                   {/* Hover Overlay for Desktop */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent 
                    opacity-0 group-hover:opacity-100 
                    transition-all duration-500 
                    hidden lg:flex flex-col justify-end">
                    <div className="p-4 space-y-1">
                      {/* Title */}
                      <h3 className="text-lg font-bold text-white line-clamp-1">
                        {post.title}
                      </h3>
                      {/* Description only on md+ */}
                      <p className="text-sm text-gray-200 line-clamp-2">
                        {post.description}
                      </p>
                    </div>
                  </div>

                  
                  {/* Mobile and iPad Overlay (always visible) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent 
                 flex flex-col justify-end p-4 space-y-1 lg:hidden">
                    {/* Title only at bottom */}
                    <h3 className="text-base font-bold text-white line-clamp-2">
                      {post.title}
                    </h3>
                  </div>

                  {/* Category Tag (always visible on mobile and iPad, hover-only on desktop) */}
                  <span
                    className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded 
             lg:opacity-0 lg:group-hover:opacity-100 lg:transition-all lg:duration-300"
                  >
                    {post.category || "General"}
                  </span>


                  {/* Category Tag (desktop hover only) */}
                  <span
                    className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded
                 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:inline-block"
                  >
                    {post.category || "General"}
                  </span>
                </figure>

                <CardContent className="p-4 relative">
                  {/* Author Section */}
                  <div className="flex items-center justify-between">
                    <UserPreview userId={post.user_id}>
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/${post.user_id}`);
                        }}
                      >
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}/api/users/${post.user_id}/avatar`}
                          alt="author"
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            // Fallback to OAuth picture if custom avatar fails
                            if (post.picture?.startsWith('http')) {
                              e.currentTarget.src = post.picture;
                            } else {
                              e.currentTarget.src = "/default-avatar.svg";
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700">
                          {post.display_name || "Unknown"}
                        </span>
                      </div>
                    </UserPreview>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {/* Likes */}
                      <div 
                        className="flex items-center gap-1 transition-all duration-300 cursor-pointer"
                        onClick={(e) => handleLike(e, post.id.toString())}
                      >
                        <Heart 
                          className={`w-4 h-4 transition-all duration-300 ${
                            likedPosts.has(post.id.toString()) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-gray-500 hover:text-red-500'
                          }`}
                        />
                        <span className="font-medium group-hover:font-bold transition-all duration-300">
                          {post.likes_count || 0}
                        </span>
                      </div>

                      {/* Views */}
                      <div className="flex items-center gap-1 transition-all duration-300">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M8 3C4.36992 3 1.98789 6.21774 1.18763 7.49059C1.09079 7.64462 1.04237 7.72163 1.01527 7.84042C0.99491 7.92964 0.99491 8.07036 1.01527 8.15958C1.04237 8.27837 1.09079 8.35539 1.18763 8.50941C1.98789 9.78226 4.36992 13 8 13C11.6301 13 14.0121 9.78226 14.8124 8.50941L14.8124 8.50939C14.9092 8.35538 14.9576 8.27837 14.9847 8.15958C15.0051 8.07036 15.0051 7.92964 14.9847 7.84042C14.9576 7.72163 14.9092 7.64462 14.8124 7.4906L14.8124 7.49059C14.0121 6.21774 11.6301 3 8 3Z"
                            fill="currentColor"
                          />
                          <path
                            d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
                            fill="white"
                          />
                        </svg>
                        <span className="font-medium group-hover:font-bold transition-all duration-300">
                          {post.views_count > 999 ? `${(post.views_count / 1000).toFixed(1)}k` : post.views_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}