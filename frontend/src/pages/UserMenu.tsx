import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from './AuthContext';
import { LogOut, User, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

interface UserType {
  id: string;
  display_name: string;
  email: string;
  picture: string;
  avatar_data?: any;
}

const UserMenu = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newuser,setnewuser]=useState("")
  const { setLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/me`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();
        if (data.success) {
          setnewuser(data.user.picture);
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
          
          const pictureUrl = data.user.picture
            ? `${data.user.picture}?sz=200`
            : "";

          setUser({
            id: data.user.id,
            display_name: data.user.display_name || data.user.email,
            email: data.user.email,
            picture: pictureUrl,
            avatar_data: profileData?.success ? profileData.user.avatar_data : null,
          });
          setLogin(true);
        } else {
          setUser(null);
          setLogin(false);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
        setLogin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [setLogin]);



  const signOut = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setLogin(false);
        setUser(null);
        navigate("/login");
      }
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <a href="/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Login</a>
      </div>
    );
  }

  const userName = user.display_name || user.email || "User";
  const userInitials = userName
    .split(" ")
    .map((name: string) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);



  return (
    <DropdownMenu>
      {/* 👇 Trigger opens on hover */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 transition-all duration-300 ease-in-out hover:bg-zinc-200"
        >
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}/avatar?t=${Date.now()}`}
            alt={userName}
            className="h-10 w-10 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `data:image/svg+xml,<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="%236366f1"/><text x="20" y="28" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="white">${userInitials}</text></svg>`;
            }}
          />
        </Button>
      </DropdownMenuTrigger>

      {/* 👇 smooth dropdown with transitions */}
      <DropdownMenuContent
        className="w-56 bg-white border border-gray-200 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 ease-out data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-2"
        align="end"
        sideOffset={5}
      >
        {/* User Info */}
        <DropdownMenuLabel >
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="transition-colors duration-200 hover:!bg-zinc-200 focus:!bg-zinc-200 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); 
            navigate('/profile')
          }}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          className="transition-colors duration-200 hover:!bg-zinc-200 focus:!bg-zinc-200 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/profile#settings');
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Account Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          className="transition-colors duration-200 hover:!bg-zinc-200 focus:!bg-zinc-200 cursor-pointer"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
