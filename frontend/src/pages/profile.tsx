import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/pages/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import ProfileCustomization from "@/components/ProfileCustomization";
import UserPreview from "@/components/UserPreview";
import { useToastContext } from "@/contexts/ToastContext";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import CreateBlogModal from "./postblog";
interface UserType {
  id: string;
  display_name: string;
  email: string;
  picture: string;
  avatar_data?: any;
}

interface BlogType {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  display_name: string;
  picture: string;
  user_id: string;
  likes: number;
  views: number;
}

const Profile = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [userBlogs, setUserBlogs] = useState<BlogType[]>([]);
  const [likedPosts, setLikedPosts] = useState<BlogType[]>([]);
  const [savedPosts, setSavedPosts] = useState<BlogType[]>([]);
  const [activeTab, setActiveTab] = useState(() => {
    // Check if URL has hash for settings tab
    return window.location.hash === '#settings' ? 'settings' : 'blogs';
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, blogId: '', blogTitle: '' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToastContext();

  const handleDeleteBlog = async (blogId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blogId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        // Remove from local state
        setUserBlogs(prev => prev.filter(blog => blog.id !== blogId));
        toast.success('Blog deleted successfully!');
      } else {
        toast.error('Error deleting blog: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Error deleting blog');
    }
  };

  const openDeleteDialog = (blogId: string, blogTitle: string) => {
    setDeleteDialog({ open: true, blogId, blogTitle });
  };

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/me`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();
        if (data.success) {
          // Try to fetch full profile data to get avatar_data
          let profileData = null;
          try {
            const profileResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${data.user.id}`, {
              credentials: "include",
            });
            profileData = await profileResponse.json();
          } catch (error) {
            console.log('Profile data not available, using basic user data');
          }
          
          if (profileData?.success) {
            setUser({
              id: profileData.user.id,
              display_name: profileData.user.display_name || profileData.user.email,
              email: profileData.user.email,
              picture: profileData.user.picture,
              avatar_data: profileData.user.avatar_data,
            });
          } else {
            setUser({
              id: data.user.id,
              display_name: data.user.display_name || data.user.email,
              email: data.user.email,
              picture: data.user.picture,
              avatar_data: null,
            });
          }
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/login");
      }
    };

    if (login) fetchUser();
  }, [login, navigate]); // Remove activeTab dependency to prevent unnecessary re-renders

  // Handle hash changes to stay on correct tab
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#settings') {
        setActiveTab('settings');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
          menu.classList.add('hidden');
        });
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch user's blogs once user is loaded
  useEffect(() => {
    const fetchBlog = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/${user.id}/blogs`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setUserBlogs(data.rows);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };
    fetchBlog();
  }, [user]);

  // Fetch liked posts
  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}/liked-blogs`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setLikedPosts(data.blogs);
        }
      } catch (error) {
        console.error("Error fetching liked posts:", error);
      }
    };
    fetchLikedPosts();
  }, [user]);

  // Fetch saved posts
  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}/bookmarks`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setSavedPosts(data.blogs);
        }
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      }
    };
    fetchSavedPosts();
  }, [user]);

  if (!user) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="max-w-6xl bg-white mx-auto">
      {/* Banner */}
      <div className="relative h-32">
        <div className="absolute -bottom-16 left-10 flex items-center space-x-6">
          <img
            src={user.avatar_data ? `${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}/avatar?t=${Date.now()}` : user.picture}
            alt={user.display_name}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            onError={(e) => {
              const initials = (user.display_name || user.email || "User")
                .split(" ")
                .map(name => name[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              e.currentTarget.src = `data:image/svg+xml,<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="128" fill="%236366f1"/><text x="64" y="80" font-family="Arial" font-size="48" font-weight="bold" text-anchor="middle" fill="white">${initials}</text></svg>`;
            }}
          />
          <div>
            <h1 className="text-3xl font-bold text-[#131313]">
              {user.display_name}
            </h1>
            <p className="text-[#131313]">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-20 border-b flex justify-between items-center px-10">
        <div className="flex space-x-8">
          {[
            { key: "blogs", label: "My Blogs" },
            { key: "liked", label: "Liked Posts" },
            { key: "saved", label: "Saved Posts" },
            { key: "settings", label: "Profile Settings" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "text-black border-black"
                  : "text-gray-600 hover:text-black border-transparent hover:border-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="mt-10 px-10">
        {activeTab === "blogs" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
            {userBlogs.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs yet</h3>
                <p className="text-gray-600 mb-6">Start sharing your thoughts with the world!</p>
                <div className="flex justify-center">
                  <CreateBlogModal showFullText={true} />
                </div>
              </div>
            ) : (
              userBlogs.map((post) => (
          <Card
            key={post.id}
            className="group relative overflow-hidden cursor-pointer transition-all duration-700 ease-out transform rounded-xl bg-white shadow-lg hover:shadow-[0_35px_60px_-12px_rgba(0,0,0,0.3)] border border-gray-100"
            onClick={() => navigate(`/blogs/${post.id}`)}
          >
            {/* Edit/Delete Menu */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/editblog/${post.id}`);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this blog?')) {
                      handleDeleteBlog(post.id);
                    }
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </Button>
              </div>
            </div>
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
                      <h3 className="text-lg font-bold text-white line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-200 line-clamp-2">
                        {post.description}
                      </p>
                    </div>
                  </div>

                  {/* Mobile/iPad Overlay (always visible) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent 
                 flex flex-col justify-end p-4 space-y-1 lg:hidden">
                    <h3 className="text-base font-bold text-white line-clamp-2">
                      {post.title}
                    </h3>
                  </div>

                  {/* Category Tag */}
                  <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded lg:opacity-0 lg:group-hover:opacity-100 lg:transition-all lg:duration-300">
                    {post.category || "General"}
                  </span>
                </figure>

                {/* Three Dot Menu */}
                <div className="absolute top-3 right-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                  <div className="relative">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        const menu = e.currentTarget.nextElementSibling as HTMLElement;
                        const isHidden = menu.classList.contains('hidden');
                        
                        // Close all other menus first
                        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
                        
                        // Toggle current menu
                        if (isHidden) {
                          menu.classList.remove('hidden');
                        } else {
                          menu.classList.add('hidden');
                        }
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="12" cy="5" r="1"/>
                        <circle cx="12" cy="19" r="1"/>
                      </svg>
                    </Button>
                    <div className="dropdown-menu hidden absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 min-w-[120px] z-10">
                      <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Close menu
                          (e.currentTarget.parentElement as HTMLElement).classList.add('hidden');
                          navigate(`/editblog/${post.id}`);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Close menu
                          (e.currentTarget.parentElement as HTMLElement).classList.add('hidden');
                          openDeleteDialog(post.id, post.title);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

           
              </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "liked" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
            {likedPosts.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No liked posts yet</h3>
                <p className="text-gray-600 mb-6">Start exploring and liking posts you enjoy!</p>
                <Button className=" border border-[#333333] bg-white text-[#333333]" onClick={() => navigate("/explore")}>Explore Blogs</Button>
              </div>
            ) : (
              likedPosts.map((post) => (
                <Card
                  key={post.id}
                  className="group relative overflow-hidden cursor-pointer transition-all duration-700 ease-out transform rounded-xl bg-white shadow-lg hover:shadow-[0_35px_60px_-12px_rgba(0,0,0,0.3)] border border-gray-100"
                  onClick={() => navigate(`/blogs/${post.id}`)}
                >
                  <figure className="relative overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${post.image_url}`}
                      alt={post.title}
                      className="w-full h-64 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 group-hover:saturate-125"
                      onError={(e) => (e.currentTarget.src = "/fallback-blog.jpg")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 hidden lg:flex flex-col justify-end">
                      <div className="p-4 space-y-1">
                        <h3 className="text-lg font-bold text-white line-clamp-1">{post.title}</h3>
                        <p className="text-sm text-gray-200 line-clamp-2">{post.description}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 space-y-1 lg:hidden">
                      <h3 className="text-base font-bold text-white line-clamp-2">{post.title}</h3>
                    </div>
                    <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded lg:opacity-0 lg:group-hover:opacity-100 lg:transition-all lg:duration-300">
                      {post.category || "General"}
                    </span>
                  </figure>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <UserPreview userId={post.user_id}>
                        <div className="flex items-center gap-3">
                          <img
                            src={`${import.meta.env.VITE_API_BASE_URL}/api/users/${post.user_id}/avatar`}
                            alt="author"
                            className="w-8 h-8 rounded-full cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/user/${post.user_id}`);
                            }}
                            onError={(e) => {
                              if (post.picture?.startsWith('http')) {
                                e.currentTarget.src = post.picture;
                              } else {
                                e.currentTarget.src = "/default-avatar.svg";
                              }
                            }}
                          />
                          <span 
                            className="text-sm text-gray-700 cursor-pointer hover:text-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/user/${post.user_id}`);
                            }}
                          >
                            {post.display_name || "Unknown"}
                          </span>
                        </div>
                      </UserPreview>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
            {savedPosts.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved posts yet</h3>
                <p className="text-gray-600 mb-6">Start bookmarking posts you want to read later!</p>
                <Button className=" border border-[#333333] bg-white text-[#333333]" onClick={() => navigate("/explore")}>Explore Blogs</Button>
              </div>
            ) : (
              savedPosts.map((post) => (
                <Card
                  key={post.id}
                  className="group relative overflow-hidden cursor-pointer transition-all duration-700 ease-out transform rounded-xl bg-white shadow-lg hover:shadow-[0_35px_60px_-12px_rgba(0,0,0,0.3)] border border-gray-100"
                  onClick={() => navigate(`/blogs/${post.id}`)}
                >
                  <figure className="relative overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${post.image_url}`}
                      alt={post.title}
                      className="w-full h-64 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 group-hover:saturate-125"
                      onError={(e) => (e.currentTarget.src = "/fallback-blog.jpg")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 hidden lg:flex flex-col justify-end">
                      <div className="p-4 space-y-1">
                        <h3 className="text-lg font-bold text-white line-clamp-1">{post.title}</h3>
                        <p className="text-sm text-gray-200 line-clamp-2">{post.description}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 space-y-1 lg:hidden">
                      <h3 className="text-base font-bold text-white line-clamp-2">{post.title}</h3>
                    </div>
                    <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded lg:opacity-0 lg:group-hover:opacity-100 lg:transition-all lg:duration-300">
                      {post.category || "General"}
                    </span>
                  </figure>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <UserPreview userId={post.user_id}>
                        <div className="flex items-center gap-3">
                          <img
                            src={`${import.meta.env.VITE_API_BASE_URL}/api/users/${post.user_id}/avatar`}
                            alt="author"
                            className="w-8 h-8 rounded-full cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/user/${post.user_id}`);
                            }}
                            onError={(e) => {
                              if (post.picture?.startsWith('http')) {
                                e.currentTarget.src = post.picture;
                              } else {
                                e.currentTarget.src = "/default-avatar.svg";
                              }
                            }}
                          />
                          <span 
                            className="text-sm text-gray-700 cursor-pointer hover:text-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/user/${post.user_id}`);
                            }}
                          >
                            {post.display_name || "Unknown"}
                          </span>
                        </div>
                      </UserPreview>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <ProfileCustomization key={user?.id} />
        )}
      </div>
      
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        title="Delete Blog Post"
        description={`Are you sure you want to delete "${deleteDialog.blogTitle}"? This action cannot be undone.`}
        onConfirm={() => handleDeleteBlog(deleteDialog.blogId)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Profile;
