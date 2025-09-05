import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, Heart, Reply } from "lucide-react";
import { useAuth } from "@/pages/AuthContext";
import { useNavigate } from "react-router-dom";
import UserPreview from "@/components/UserPreview";
import { useToastContext } from "@/contexts/ToastContext";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  parent_id: number | null;
  likes_count: number;
  display_name: string;
  picture: string;
  picture_url: string;
  email: string;
  user_id: number;
  replies?: Comment[];
}

interface CommentSystemProps {
  blogId: string;
}

export default function CommentSystem({ blogId }: CommentSystemProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToastContext();

  // Fetch comments from API
  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blogId}/comments`);
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    if (!login) {
      if (confirm('You need to login to post comments. Go to login page?')) {
        navigate('/login');
      }
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: newComment }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        fetchComments();
        setNewComment("");
      } else {
        throw new Error(data.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Error posting comment: ' + error.message);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!login) {
      if (confirm('You need to login to post replies. Go to login page?')) {
        navigate('/login');
      }
      return;
    }
    
    if (!replyContent.trim()) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: replyContent, parentId }),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchComments(); // Refresh comments
        setReplyContent("");
        setReplyTo(null);
      } else {
        console.error('Error posting reply:', data.message);
        toast.error(data.message || 'Error posting reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Error posting reply');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: editContent }),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchComments();
        setEditingComment(null);
        setEditContent("");
      } else {
        toast.error(data.message || 'Error updating comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Error updating comment');
    }
  };

  const handleLikeComment = async (commentId: number) => {
    if (!login) {
      if (confirm('You need to login to like comments. Go to login page?')) {
        navigate('/login');
      }
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/comments/${commentId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        fetchComments();
      } else {
        throw new Error(data.message || 'Failed to like comment');
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Error liking comment: ' + error.message);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await response.json();
      if (data.success) {
        fetchComments();
        toast.success('Comment deleted successfully');
      } else {
        toast.error(data.message || 'Error deleting comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error deleting comment');
    }
  };

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-6 w-6" />
        <h3 className="text-2xl font-bold">Comments ({comments.length})</h3>
      </div>

      {/* Add Comment */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <Textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-4 min-h-[100px] bg-zinc-100 hover:bg-zinc-200 focus-visible:ring-1 focus-visible:ring-[#333333]"
          />
          <Button onClick={handleSubmitComment} className="gap-2 bg-black hover:bg-[#333333]">
            <Send className="h-4 w-4" />
            Post Comment
          </Button>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <UserPreview userId={comment.user_id.toString()}>
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/api/users/${comment.user_id}/avatar`}
                    alt={comment.display_name}
                    className="w-10 h-10 rounded-full object-cover bg-gray-100 cursor-pointer"
                    onClick={() => navigate(`/user/${comment.user_id}`)}
                    onError={(e) => {
                      if (comment.picture?.startsWith('http')) {
                        e.currentTarget.src = comment.picture;
                      } else {
                        e.currentTarget.src = "/default-avatar.svg";
                      }
                    }}
                  />
                </UserPreview>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span 
                      className="font-semibold cursor-pointer hover:text-blue-600"
                      onClick={() => navigate(`/user/${comment.user_id}`)}
                    >
                      {comment.display_name}
                    </span>
                    <span className="text-sm text-muted-foreground">{formatDate(comment.created_at)}</span>
                  </div>
                  {editingComment === comment.id ? (
                    <div className="mb-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="mb-2 bg-zinc-100 hover:bg-zinc-200 focus-visible:ring-1 focus-visible:ring-[#333333]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEditComment(comment.id)} className="bg-black hover:bg-[#333333] text-white">
                          Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingComment(null)} className="hover:bg-zinc-100">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 mb-3">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1 text-muted-foreground hover:text-red-500"
                          onClick={() => handleLikeComment(comment.id)}
                        >
                          <Heart className="h-4 w-4" />
                          {comment.likes_count}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1 text-muted-foreground hover:bg-zinc-100"
                          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        >
                          <Reply className="h-4 w-4" />
                          Reply
                        </Button>
                        {login && user && comment.user_id === user.id && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-1 text-muted-foreground hover:bg-zinc-100"
                              onClick={() => {
                                setEditingComment(comment.id);
                                setEditContent(comment.content);
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-1 text-muted-foreground hover:bg-zinc-100"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}

                  {/* Reply Form */}
                  {replyTo === comment.id && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="mb-2 bg-zinc-100 hover:bg-zinc-200 focus-visible:ring-1 focus-visible:ring-[#333333]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSubmitReply(comment.id)} className="bg-black hover:bg-[#333333] text-white">
                          Reply
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="hover:bg-zinc-100">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <UserPreview userId={reply.user_id.toString()}>
                            <img
                              src={`${import.meta.env.VITE_API_BASE_URL}/api/users/${reply.user_id}/avatar`}
                              alt={reply.display_name}
                              className="w-8 h-8 rounded-full object-cover bg-gray-100 cursor-pointer"
                              onClick={() => navigate(`/user/${reply.user_id}`)}
                              onError={(e) => {
                                if (reply.picture?.startsWith('http')) {
                                  e.currentTarget.src = reply.picture;
                                } else {
                                  e.currentTarget.src = "/default-avatar.svg";
                                }
                              }}
                            />
                          </UserPreview>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span 
                                className="font-semibold text-sm cursor-pointer hover:text-blue-600"
                                onClick={() => navigate(`/user/${reply.user_id}`)}
                              >
                                {reply.display_name}
                              </span>
                              <span className="text-xs text-muted-foreground">{formatDate(reply.created_at)}</span>
                            </div>
                            <p className="text-gray-700 text-sm mb-2">{reply.content}</p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-1 text-muted-foreground hover:text-red-500 text-xs"
                              onClick={() => handleLikeComment(reply.id)}
                            >
                              <Heart className="h-3 w-3" />
                              {reply.likes_count}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}