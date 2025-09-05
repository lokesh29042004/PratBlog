import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToastContext } from "@/contexts/ToastContext";
import ImageCropModal from "@/components/ImageCropModal";
import {  Upload } from "lucide-react";

type Step = 'select' | 'crop' | 'details';

interface CreateBlogModalProps {
  showFullText?: boolean;
}

export default function CreateBlogModal({ showFullText = false }: CreateBlogModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('select');
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState("Tech");
  const [customCategory, setCustomCategory] = useState("");
  const [content, setContent] = useState("");
  const [cropModal, setCropModal] = useState<{
    isOpen: boolean;
    imageSrc: string;
  }>({ isOpen: false, imageSrc: '' });
  const { toast } = useToastContext();

  // Check if device is mobile or tablet
  const isMobileOrTablet = () => {
    return window.innerWidth <= 1024; // iPad and smaller devices
  };

  // Auto-trigger file selection on mobile/tablet when modal opens
  const handleModalOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && isMobileOrTablet()) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (e) => {
          const selectedFile = (e.target as HTMLInputElement).files?.[0];
          if (selectedFile) {
            const reader = new FileReader();
            reader.onload = () => {
              setCropModal({
                isOpen: true,
                imageSrc: reader.result as string
              });
            };
            reader.readAsDataURL(selectedFile);
          } else {
            // Close modal if no file selected on mobile
            setOpen(false);
          }
        };
        // Close modal if user cancels file selection
        fileInput.oncancel = () => {
          setOpen(false);
        };
        fileInput.click();
      }, 100);
    }
    if (!isOpen) resetForm();
  };

  const resetForm = () => {
    setStep('select');
    setTitle("");
    setDescription("");
    setCategory("Tech");
    setCustomCategory("");
    setImage(null);
    setPreview(null);
    setContent("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropModal({
          isOpen: true,
          imageSrc: reader.result as string
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropModal({
          isOpen: true,
          imageSrc: reader.result as string
        });
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleCropComplete = (croppedImageBlob: Blob) => {
    const croppedFile = new File([croppedImageBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
    setImage(croppedFile);
    setPreview(URL.createObjectURL(croppedImageBlob));
    setStep('details');
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

    fetch(`${import.meta.env.VITE_API_BASE_URL}/blog`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.text();
      })
      .then(() => {
        toast.success("Blog created successfully!");
        resetForm();
        setOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to create blog");
      });
  };

  const renderStepContent = () => {
    switch (step) {
      case 'select':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Select Image</h2>
              <p className="text-gray-600">Choose a photo for your blog post</p>
            </div>
            
            {/* Desktop: Show drag & drop interface */}
            <div className="hidden lg:block">
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-16 cursor-pointer text-center hover:bg-gray-50 transition-colors"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg mb-2 text-gray-700">Drag photos here</p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <Button
                  className="bg-black hover:bg-[#333333] text-white"
                  asChild
                  type="button"
                >
                  <label className="cursor-pointer">
                    Select from device
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFileChange}
                    />
                  </label>
                </Button>
              </div>
            </div>

            {/* Mobile/Tablet: Show only select button */}
            <div className="lg:hidden flex flex-col items-center justify-center p-16">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg mb-4 text-gray-700">Select a photo from your device</p>
              <Button
                className="bg-black hover:bg-[#333333] text-white"
                asChild
                type="button"
              >
                <label className="cursor-pointer">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </label>
              </Button>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="grid md:grid-cols-2 gap-6 h-full">
            {/* Image Preview */}
            <div className="flex items-center justify-center">
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                />
              )}
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Blog Details</h2>
                <p className="text-gray-600">Add title, description and content</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter blog title..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your blog content..."
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
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
                      className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                      required
                    />
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('select')}
                    className="flex-1"
                  >
                   
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-black hover:bg-[#333333] text-white"
                  >
                    Post Blog
                    
                  </Button>
                </div>
              </form>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleModalOpen}>
      <DialogTrigger asChild>
        <Button className="text-sm px-3 bg-[#131313] hover:bg-[#333333] py-2">
          {showFullText ? (
            "+ Create Blog"
          ) : (
            <>
              <span className="hidden sm:inline">+ Create Blog</span>
              <span className="sm:hidden">+</span>
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            Create New Blog
          </DialogTitle>
        </DialogHeader>
        
        {renderStepContent()}
        
        <ImageCropModal
          isOpen={cropModal.isOpen}
          onClose={() => setCropModal(prev => ({ ...prev, isOpen: false }))}
          imageSrc={cropModal.imageSrc}
          onCropComplete={handleCropComplete}
          aspectRatio={16/9}
        />
      </DialogContent>
    </Dialog>
  );
}