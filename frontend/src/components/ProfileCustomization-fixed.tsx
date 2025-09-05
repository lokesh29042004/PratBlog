import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X, Save } from "lucide-react";
import { useAuth } from "@/pages/AuthContext";
import { useParams } from "react-router-dom";

interface ProfileData {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  twitter: string;
  linkedin: string;
  skills: string[];
  avatar: string;
  coverImage: string;
}

export default function ProfileCustomization() {
  const { user } = useAuth();
  const { k } = useParams();
  console.log("User:", user);
  const [profile, setProfile] = useState<ProfileData>({
    displayName: "",
    bio: "",
    location: "",
    website: "",
    twitter: "",
    linkedin: "",
    skills: [],
    avatar: "/default-avatar.svg",
    coverImage: "/default-cover.jpg"
  });

  const [newSkill, setNewSkill] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          const user = data.user;
          setProfile({
            displayName: user.display_name || "",
            bio: user.bio || "",
            location: user.location || "",
            website: user.website || "",
            twitter: user.twitter || "",
            linkedin: user.linkedin || "",
            skills: user.skills ? user.skills.split(',').filter(s => s.trim()) : [],
            avatar: (user.avatar_data || user.has_avatar) ? `${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}/avatar?t=${Date.now()}` : (user.picture?.startsWith('http') ? user.picture : "/default-avatar.svg"),
            coverImage: (user.cover_image || user.has_cover) ? `${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}/cover?t=${Date.now()}` : "/default-cover.jpg"
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          display_name: profile.displayName,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          twitter: profile.twitter,
          linkedin: profile.linkedin,
          skills: profile.skills.join(',')
        })
      });
      const data = await response.json();
      if (data.success) {
        setIsEditing(false);
        alert('Profile updated successfully!');
        // Refresh profile data
        window.location.reload();
      } else {
        alert('Error updating profile: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    }
  };

  const handleImageUpload = (type: 'avatar' | 'coverImage') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !user) return;
      
      const formData = new FormData();
      if (type === 'avatar') {
        formData.append('avatar', file);
      } else {
        formData.append('cover', file);
      }
      
      try {
        const endpoint = type === 'avatar' ? 'avatar' : 'cover';
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}/${endpoint}`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        
        const data = await response.json();
        if (data.success) {
          // Force immediate re-fetch of profile data
          const fetchUpdatedProfile = async () => {
            try {
              const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}`, {
                credentials: 'include'
              });
              const data = await response.json();
              if (data.success) {
                const user = data.user;
                console.log('Updated user data:', user);
                console.log('Has avatar:', user.has_avatar, 'Has cover:', user.has_cover);
                const timestamp = Date.now();
                setProfile({
                  displayName: user.display_name || "",
                  bio: user.bio || "",
                  location: user.location || "",
                  website: user.website || "",
                  twitter: user.twitter || "",
                  linkedin: user.linkedin || "",
                  skills: user.skills ? user.skills.split(',').filter(s => s.trim()) : [],
                  avatar: (user.avatar_data || user.has_avatar) ? `${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}/avatar?t=${timestamp}` : (user.picture?.startsWith('http') ? user.picture : "/default-avatar.svg"),
                  coverImage: (user.cover_image || user.has_cover) ? `${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}/cover?t=${timestamp}` : "/default-cover.jpg"
                });
              }
            } catch (error) {
              console.error('Error refreshing profile:', error);
            }
          };
          
          alert(`${type === 'avatar' ? 'Profile picture' : 'Cover image'} updated successfully!`);
          fetchUpdatedProfile();
        } else {
          alert('Error uploading image: ' + data.message);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image');
      }
    };
    input.click();
  };

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Cover Image */}
      <Card>
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover rounded-t-lg"
            onError={(e) => {
              e.currentTarget.src = '/default-cover.jpg';
              e.currentTarget.style.display = 'block';
            }}
          />
          {isEditing && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 gap-2"
              onClick={() => handleImageUpload('coverImage')}
            >
              <Camera className="h-4 w-4" />
              Change Cover
            </Button>
          )}
        </div>
        
        {/* Avatar */}
        <div className="relative -mt-16 ml-6">
          <div className="relative">
            <img
              src={profile.avatar}
              alt="Avatar"
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              onError={(e) => (e.currentTarget.src = "/default-avatar.svg")}
            />
            {isEditing && (
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-0 right-0 rounded-full p-2"
                onClick={() => handleImageUpload('avatar')}
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile Information</CardTitle>
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className="gap-2"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            ) : (
              "Edit Profile"
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={profile.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                disabled={!isEditing}
                placeholder="Your display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!isEditing}
                placeholder="Your location"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              className="min-h-[100px]"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-medium">Social Links</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={profile.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={profile.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  disabled={!isEditing}
                  placeholder="@yourusername"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={profile.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/yourusername"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h4 className="font-medium">Skills & Interests</h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  {isEditing && (
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    />
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}