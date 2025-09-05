import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Twitter, Linkedin, Calendar, Heart, Eye } from "lucide-react";

interface UserType {
  id: string;
  display_name: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  twitter: string;
  linkedin: string;
  skills: string;
  picture: string;
  created_at: string;
}

interface BlogType {
  id: string;
  slug?: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  created_at: string;
  likes_count: number;
  views_count: number;
}

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [userBlogs, setUserBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("blogs");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('Fetching user profile for ID:', id);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${id}`, {
          credentials: "include",
        });
        const data = await response.json();
        console.log('User profile response:', data);
        if (data.success) {
          setUser(data.user);
        } else {
          console.error('Failed to fetch user:', data.message);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    const fetchUserBlogs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/${id}/blogs`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setUserBlogs(data.rows);
        }
      } catch (error) {
        console.error("Error fetching user blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserProfile();
      fetchUserBlogs();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-center py-10">User not found</div>;
  }

  const skills = user.skills ? user.skills.split(',').filter(s => s.trim()) : [];

  return (
    <div className="max-w-6xl bg-white mx-auto">
      {/* Cover Image */}
      <div className="relative h-32 md:h-48 bg-gradient-to-r from-blue-500 to-purple-600">
        {user.cover_image && (
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}/cover`}
            alt="Cover"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Profile Section */}
      <div className="px-4 md:px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar */}
          <div className="flex justify-center md:justify-start">
            <img
              src={user.avatar_data ? `${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}/avatar` : (user.picture?.startsWith('http') ? user.picture : "/default-avatar.svg")}
              alt={user.display_name}
              className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover"
              onError={(e) => (e.currentTarget.src = "/default-avatar.svg")}
            />
          </div>
          
          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{user.display_name}</h1>
            {user.bio && (
              <p className="text-gray-600 mb-4 line-clamp-3 break-words">{user.bio}</p>
            )}
            
            {/* Stats */}
            <div className="flex justify-center md:justify-start gap-6 text-sm text-gray-600">
              <div>
                <span className="font-semibold text-gray-900">{userBlogs.length}</span> articles
              </div>
              <div>
                <span className="font-semibold text-gray-900">
                  {userBlogs.reduce((sum, blog) => sum + parseInt(blog.likes_count || 0), 0)}
                </span> likes
              </div>
              <div>
                <span className="font-semibold text-gray-900">
                  {userBlogs.reduce((sum, blog) => sum + parseInt(blog.views_count || 0), 0)}
                </span> views
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="px-4 md:px-6 py-6 border-t">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - About */}
          <div className="md:col-span-1 space-y-6">
            {/* About */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">About</h3>
                <div className="space-y-3 text-sm">
                  {user.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="truncate">{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="truncate">Joined {formatDate(user.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            {(user.website || user.twitter || user.linkedin) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Connect</h3>
                  <div className="space-y-3">
                    {user.website && (
                      <a
                        href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <Globe className="h-4 w-4" />
                        <span className="text-sm">Website</span>
                      </a>
                    )}
                    {user.twitter && (
                      <a
                        href={`https://twitter.com/${user.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <Twitter className="h-4 w-4" />
                        <span className="text-sm">{user.twitter}</span>
                      </a>
                    )}
                    {user.linkedin && (
                      <a
                        href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Skills & Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Blogs */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <h3 className="text-xl font-semibold">Articles by {user.display_name}</h3>
              <p className="text-gray-600">{userBlogs.length} articles published</p>
            </div>

            {userBlogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No articles published yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {userBlogs.map((blog) => (
                  <Card
                    key={blog.id}
                    className="group relative overflow-hidden cursor-pointer transition-all duration-700 ease-out transform rounded-xl bg-white shadow-lg hover:shadow-[0_35px_60px_-12px_rgba(0,0,0,0.3)] border border-gray-100"
                    onClick={() => navigate(`/blog/${blog.slug || blog.id}`)}
                  >
                    <figure className="relative overflow-hidden">
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${blog.image_url}`}
                        alt={blog.title}
                        className="w-full h-64 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 group-hover:saturate-125"
                        onError={(e) => (e.currentTarget.src = "/fallback-blog.jpg")}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 hidden md:flex flex-col justify-end">
                        <div className="p-4 space-y-1">
                          <h3 className="text-lg font-bold text-white line-clamp-1">{blog.title}</h3>
                          <p className="text-sm text-gray-200 line-clamp-2">{blog.description}</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 space-y-1 md:hidden">
                        <h3 className="text-base font-bold text-white line-clamp-2">{blog.title}</h3>
                      </div>
                      <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded md:opacity-0 md:group-hover:opacity-100 md:transition-all md:duration-300">
                        {blog.category || "General"}
                      </span>
                    </figure>
                    
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}