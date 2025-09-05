import React, { useEffect, useState } from "react";
import { ArrowLeft, Clock, User, Tag, Share2, Heart, Bookmark } from "lucide-react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import SocialShare from "@/components/SocialShare";
import CommentSystem from "@/components/CommentSystem";
import SEOHead from "@/components/SEOHead";
import UserPreview from "@/components/UserPreview";
import { useAuth } from "@/pages/AuthContext";
import { useToastContext } from "@/contexts/ToastContext";
export default function BlogDetail() {
    // Mock data for demonstration - replace with your actual data fetching
    const [blog, setBlog] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const navigate = useNavigate();
    const { id, slug } = useParams();
    const [readProgress, setReadProgress] = useState(0);
    const { login } = useAuth();
    const { toast } = useToastContext();
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                // Use slug if available, otherwise use ID
                const endpoint = slug ? `${import.meta.env.VITE_API_BASE_URL}/blog/${slug}` : `${import.meta.env.VITE_API_BASE_URL}/blogs/${id}`;
                const res = await fetch(endpoint, {
                    credentials: "include",
                });
                const data = await res.json();
                console.log(data);
                if (data.success) {
                    setBlog(data.blog);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching blog:", error);
            }
        };
        
        const fetchLikes = async () => {
            try {
                // Use blog ID for likes (we'll get it from the blog data)
                if (!blog?.id) return;
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blog.id}/likes`, {
                    credentials: "include",
                });
                const data = await res.json();
                if (data.success) {
                    setLikesCount(data.likesCount);
                    setLiked(data.userLiked);
                }
            } catch (error) {
                console.error("Error fetching likes:", error);
            }
        };
        
        const fetchBookmark = async () => {
            try {
                if (!blog?.id) return;
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blog.id}/bookmark`, {
                    credentials: "include",
                });
                const data = await res.json();
                if (data.success) {
                    setBookmarked(data.bookmarked);
                }
            } catch (error) {
                console.error("Error fetching bookmark:", error);
            }
        };
        
        fetchBlog();
    }, [id, slug]);
    
    // Fetch likes and bookmarks after blog is loaded
    useEffect(() => {
        if (blog?.id) {
            const fetchLikes = async () => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blog.id}/likes`, {
                        credentials: "include",
                    });
                    const data = await res.json();
                    if (data.success) {
                        setLikesCount(data.likesCount);
                        setLiked(data.userLiked);
                    }
                } catch (error) {
                    console.error("Error fetching likes:", error);
                }
            };
            
            const fetchBookmark = async () => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blog.id}/bookmark`, {
                        credentials: "include",
                    });
                    const data = await res.json();
                    if (data.success) {
                        setBookmarked(data.bookmarked);
                    }
                } catch (error) {
                    console.error("Error fetching bookmark:", error);
                }
            };
            
            fetchLikes();
            fetchBookmark();
        }
    }, [blog?.id]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const estimateReadTime = (content: string) => {
        const wordsPerMinute = 200;
        const wordCount = content?.split(' ').length || 0;
        return Math.ceil(wordCount / wordsPerMinute) || 1;
    };

    const handleBack = () => {
        navigate(-1);
    };
    
    const handleLike = async () => {
        if (!login) {
            if (confirm('You need to login to like blogs. Go to login page?')) {
                navigate('/login');
            }
            return;
        }
        
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blog.id}/like`, {
                method: 'POST',
                credentials: "include",
            });
            
            if (res.status === 401) {
                if (confirm('Your session has expired. Please login again.')) {
                    navigate('/login');
                }
                return;
            }
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            if (data.success) {
                setLiked(data.liked);
                setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
            } else {
                throw new Error(data.message || 'Failed to like blog');
            }
        } catch (error) {
            console.error("Error liking blog:", error);
            toast.error('Error liking blog: ' + error.message);
        }
    };
    
    const handleBookmark = async () => {
        if (!login) {
            if (confirm('You need to login to save blogs. Go to login page?')) {
                navigate('/login');
            }
            return;
        }
        
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blog.id}/bookmark`, {
                method: 'POST',
                credentials: "include",
            });
            
            if (res.status === 401) {
                if (confirm('Your session has expired. Please login again.')) {
                    navigate('/login');
                }
                return;
            }
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            if (data.success) {
                setBookmarked(data.bookmarked);
            } else {
                throw new Error(data.message || 'Failed to save blog');
            }
        } catch (error) {
            console.error("Error bookmarking blog:", error);
            toast.error('Error saving blog: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading blog...</p>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h2>
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Blogs
                    </button>
                </div>
            </div>
        );
    }

    return (
         <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <SEOHead
        title={blog.title}
        description={blog.description || `Read ${blog.title} on PratBlog`}
        image={blog.image_url ? `${import.meta.env.VITE_API_BASE_URL}${blog.image_url}` : undefined}
        author={blog.display_name}
        publishedTime={blog.created_at}
        keywords={`${blog.category}, blog, ${blog.display_name}`}
      />
      {/* ✅ Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 mx-0">
        <div className=" mx-auto px-6 py-3 flex items-center justify-between">
          {/* Back */}
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          
          {/* Like, Save, Share */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`p-2 rounded-lg transition-all ${
                liked
                  ? "text-red-500"
                  : "text-gray-600 hover:text-red-500"
              }`}
            >
              <Heart className={`w-6 h-6 hover:scale-110 transition-transform ${liked ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-all ${
                bookmarked
                  ? "text-blue-500"
                  : "text-gray-600 hover:text-blue-500"
              }`}
            >
              <Bookmark
                className={`w-6 h-6 hover:scale-110 transition-transform ${bookmarked ? "fill-current" : ""}`}
              />
            </button>
            <SocialShare 
              title={blog.title}
              url={window.location.href}
              description={blog.description}
            />
          </div>
        </div>
      </div>
        
        

      {/* ✅ Hero Image */}
      <div className="max-w-4xl mx-auto px-6 pb-8 pt-4">
       {/* ✅ Author + Meta + Stats */}
<div className="max-w-4xl mx-auto px-6">
  <div className="flex items-center justify-between mt-5 pb-1.5 text-sm text-gray-600">
    <div className="flex items-center gap-3">
      <UserPreview userId={blog.user_id}>
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}/api/users/${blog.user_id}/avatar`}
            alt="author"
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
            onClick={() => navigate(`/user/${blog.user_id}`)}
            onError={(e) => {
              if (blog.picture?.startsWith('http')) {
                e.currentTarget.src = blog.picture;
              } else {
                e.currentTarget.src = "/default-avatar.svg";
              }
            }}
          />
          <span 
            className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
            onClick={() => navigate(`/user/${blog.user_id}`)}
          >
            {blog.display_name || "Unknown"}
          </span>
        </div>
      </UserPreview>
      
      <span>{formatDate(blog.created_at)}</span>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10.7408 2C13.0889 2 14.6667 4.235 14.6667 6.32C14.6667 10.5425 8.11856 14 8.00004 14C7.88152 14 1.33337 10.5425 1.33337 6.32C1.33337 4.235 2.91115 2 5.2593 2C6.60745 2 7.48893 2.6825 8.00004 3.2825C8.51115 2.6825 9.39263 2 10.7408 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{likesCount} </span>
      </div>
      <div className="flex items-center gap-1">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3C4.36992 3 1.98789 6.21774 1.18763 7.49059C1.09079 7.64462 1.04237 7.72163 1.01527 7.84042C0.99491 7.92964 0.99491 8.07036 1.01527 8.15958C1.04237 8.27837 1.09079 8.35539 1.18763 8.50941C1.98789 9.78226 4.36992 13 8 13C11.6301 13 14.0121 9.78226 14.8124 8.50941L14.8124 8.50939C14.9092 8.35538 14.9576 8.27837 14.9847 8.15958C15.0051 8.07036 15.0051 7.92964 14.9847 7.84042C14.9576 7.72163 14.9092 7.64462 14.8124 7.4906L14.8124 7.49059C14.0121 6.21774 11.6301 3 8 3Z" fill="currentColor" />
          <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" fill="white" />
        </svg>
        <span>{blog.views_count || 0} </span>
      </div>
    </div>
  </div>
</div>

{/* ✅ Hero Image */}
<div className="max-w-4xl mx-auto px-6 pb-8">
  <div className="rounded-2xl overflow-hidden shadow-md">
    {blog.image_url ? (
      <img
        src={`${import.meta.env.VITE_API_BASE_URL}${blog.image_url}`}
        alt={blog.title}
        className="w-full h-[28rem] md:h-[32rem] object-cover"
      />
    ) : (
      <div className="h-80 bg-gray-200 flex items-center justify-center text-gray-500">
        No Image
      </div>
    )}
  </div>
</div>


        {/* ✅ Title + Description */}
        <div className="mt-6 text-center">
          <span className="inline-block mb-3 px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
            {blog.category || "General"}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            {blog.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {blog.description || "Discover insights and stories that matter."}
          </p>
        </div>

        {/* ✅ Blog Content */}
        <article className="prose prose-lg max-w-3xl mx-auto mt-10">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </article>

        {/* ✅ Social Share & Actions */}
        <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  liked
                    ? "text-red-500"
                    : "text-gray-600 hover:text-red-500"
                }`}
              >
                <Heart className={`w-6 h-6 hover:scale-110 transition-transform ${liked ? "fill-current" : ""}`} />
                {likesCount}
              </button>
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  bookmarked
                    ? "text-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <Bookmark className={`w-6 h-6 hover:scale-110 transition-transform ${bookmarked ? "fill-current" : ""}`} />
                {bookmarked ? "Saved" : "Save"}
              </button>
            </div>
            <SocialShare 
              title={blog.title}
              url={window.location.href}
              description={blog.description}
            />
          </div>
        </div>

        {/* ✅ Comment System */}
        <div className="max-w-3xl mx-auto">
          <CommentSystem blogId={blog.id} />
        </div>
      </div>
    </div>
    );
}