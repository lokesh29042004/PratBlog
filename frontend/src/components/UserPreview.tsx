import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, FileText, Heart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserPreviewProps {
  userId: string;
  children: React.ReactNode;
  delay?: number;
}

interface UserData {
  id: string;
  display_name: string;
  bio: string;
  location: string;
  created_at: string;
  skills: string;
  blogCount: number;
  totalLikes: number;
  totalViews: number;
}

export default function UserPreview({ userId, children, delay = 500 }: UserPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    if (userData || loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${userId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        // Get user blogs count and stats
        const blogsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/${userId}/blogs`, {
          credentials: 'include'
        });
        const blogsData = await blogsResponse.json();
        
        const blogs = blogsData.success ? blogsData.rows : [];
        const totalLikes = blogs.reduce((sum: number, blog: any) => sum + (parseInt(blog.likes_count) || 0), 0);
        const totalViews = blogs.reduce((sum: number, blog: any) => sum + (parseInt(blog.views_count) || 0), 0);
        
        setUserData({
          ...data.user,
          blogCount: blogs.length,
          totalLikes,
          totalViews
        });
      }
    } catch (error) {
      console.error('Error fetching user preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    
    const timeout = setTimeout(() => {
      setShowPreview(true);
      fetchUserData();
    }, delay);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowPreview(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const skills = userData?.skills ? userData.skills.split(',').filter(s => s.trim()).slice(0, 3) : [];

  const tooltipContent = showPreview && (
    <div 
      className="fixed z-[9999] w-80"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <Card className="shadow-xl border-2 bg-white">
        <CardContent className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : userData ? (
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start gap-3">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}/api/users/${userId}/avatar`}
                  alt={userData.display_name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.svg";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 
                    className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/user/${userId}`)}
                  >
                    {userData.display_name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {userData.bio || 'No bio available'}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>{userData.blogCount} posts</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Heart className="w-4 h-4" />
                  <span>{userData.totalLikes} likes</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>{userData.totalViews} views</span>
                </div>
              </div>

              {/* Location & Join Date */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                {userData.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{userData.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {formatDate(userData.created_at)}</span>
                </div>
              </div>

              {/* Skills */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {skills.map((skill) => (
                    <Badge key={skill} className="text-xs text-black bg-zinc-200 hover:bg-zinc-200">
                      {skill}
                    </Badge>
                  ))}
                  {userData.skills.split(',').length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{userData.skills.split(',').length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2 text-gray-500 text-sm">
              Failed to load profile
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
        <div className="w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
      </div>
    </div>
  );

  return (
    <>
      <div 
        ref={elementRef}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      
      {typeof document !== 'undefined' && tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
}