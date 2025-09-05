import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState("Tech");
  const [customCategory, setCustomCategory] = useState("");
  const [fileKey, setFileKey] = useState(Date.now());
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/blogs/${id}`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          setTitle(data.blog.title);
          setDescription(data.blog.description);
          setCategory(data.blog.category);
          setContent(data.blog.content);
          if (data.blog.image_url) {
            setPreview(`${import.meta.env.VITE_API_BASE_URL}${data.blog.image_url}`);
          }
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setImage(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setFileKey(Date.now());
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setImage(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === "Custom" ? customCategory : category;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", finalCategory);
    formData.append("content", content);
    if (image) formData.append("image", image);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${id}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.text();
      })
      .then(() => {
        toast({ 
          title: "✅ Success", 
          description: "Blog updated successfully!" 
        });
        navigate(-1);
      })
      .catch((err) => {
        toast({
          title: "❌ Error",
          description: err.message || "Failed to update blog",
        });
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#131313] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center">Edit Blog</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload / Preview */}
          {!preview ? (
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-10 cursor-pointer text-center hover:bg-gray-50 transition"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <p className="mb-2">Drag photos here</p>
              <Button
                className="bg-[#131313] hover:bg-[#333333]"
                asChild
                type="button"
              >
                <label>
                  Select from device
                  <input
                    key={fileKey}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </label>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <img
                src={preview}
                alt="Preview"
                className="rounded-lg max-h-72 object-contain mb-4"
              />
              <Button
                variant="outline"
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                }}
              >
                Remove Image
              </Button>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-semibold mb-1">Blog Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:shadow-inner"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write your blog description here..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:shadow-inner"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block font-semibold mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog content here..."
              rows={12}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-1 focus:ring-black focus:shadow-inner"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-semibold mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:shadow-inner"
            >
              <option value="Tech">Tech</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              <option value="Custom">Custom</option>
            </select>
            {category === "Custom" && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category..."
                className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:shadow-inner"
                required
              />
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#131313] hover:bg-[#333333] px-8"
            >
              Update Blog
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}