import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import UserPreview from "@/components/UserPreview";
import { useAuth } from "@/pages/AuthContext";
import { Heart } from "lucide-react";
export default function BlogFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
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
        
        // Update posts count
        setPosts(prev => prev.map(post => 
          post.id.toString() === blogId 
            ? { ...post, likes_count: data.liked ? (post.likes_count || 0) + 1 : Math.max(0, (post.likes_count || 0) - 1) }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/blogs`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();
        if (data.success) {
          setPosts(Array.isArray(data.blogs) ? data.blogs : []);
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
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

    fetchPosts();
    fetchLikedPosts();
  }, [login, user]);

  return (
    <div className="min-h-screen bg-gray-50 py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-gray-900 text-center">
           Latest Blogs
        </h1>

        {posts.length === 0 ? (
          <p className="text-gray-500 text-center">No blogs available.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => (
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

    {/* Mobile Overlay (always visible) */}
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
