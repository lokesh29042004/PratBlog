import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  aspectRatio?: number;
  allowedRatios?: Array<{ label: string; value: number | undefined }>;
}

const ASPECT_RATIOS = [
  { label: '16:9 (Landscape)', value: 16 / 9 },
  { label: '2:1 (Blog Optimal)', value: 2 / 1 },
  { label: '3:2 (Classic)', value: 3 / 2 },
  { label: '1:1 (Square)', value: 1 },
  { label: 'Free', value: undefined },
];

export const AVATAR_RATIOS = [{ label: '1:1 (Square)', value: 1 }];

export const COVER_RATIOS = [
  { label: '4.7:1 (Perfect Fit)', value: 4.67 },
  { label: '5:1 (Wide Banner)', value: 5 / 1 },
  { label: '4:1 (Banner)', value: 4 / 1 },
];

export default function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio: initialAspectRatio = 1,
  allowedRatios = ASPECT_RATIOS,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(
    allowedRatios.length > 0 ? allowedRatios[0].value : initialAspectRatio
  );
  const imgRef = useRef<HTMLImageElement>(null);

  // Calculate initial crop based on aspect ratio
  const updateCropForAspectRatio = useCallback(() => {
    if (!imgRef.current) return;

    const { width, height } = imgRef.current;
    const imageAspect = width / height;

    let cropWidth = 60;
    let cropHeight = 60;

    if (aspectRatio) {
      if (aspectRatio === 1) {
        // ✅ Force perfect square
        const side = 60; // square size (% of image)
        cropWidth = side;
        cropHeight = side;
      } else if (aspectRatio > imageAspect) {
        cropWidth = 80;
        cropHeight = cropWidth / aspectRatio;
      } else {
        cropHeight = 80;
        cropWidth = cropHeight * aspectRatio;
      }
    }

    const newCrop: Crop = {
      unit: '%',
      width: Math.min(cropWidth, 80),
      height: Math.min(cropHeight, 80),
      x: (100 - Math.min(cropWidth, 80)) / 2,
      y: (100 - Math.min(cropHeight, 80)) / 2,
    };

    setCrop(newCrop);
  }, [aspectRatio]);

  const onImageLoad = useCallback(() => {
    updateCropForAspectRatio();
  }, [updateCropForAspectRatio]);

  // Update crop when aspect ratio changes
  useEffect(() => {
    if (isOpen && imgRef.current) {
      updateCropForAspectRatio();
    }
  }, [aspectRatio, isOpen, updateCropForAspectRatio]);

  // Reset aspect ratio when allowedRatios change or modal opens (only for avatar)
  useEffect(() => {
    if (allowedRatios.length === 1 && isOpen && allowedRatios[0].value === 1) {
      setAspectRatio(allowedRatios[0].value);
      setTimeout(() => {
        updateCropForAspectRatio();
      }, 100);
    }
  }, [allowedRatios, isOpen, updateCropForAspectRatio]);

  // Always keep completedCrop in sync with crop
  useEffect(() => {
    if (!imgRef.current || !crop.width || !crop.height) return;

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelCrop: PixelCrop = {
      x: (crop.x || 0) * (image.width / 100) * scaleX,
      y: (crop.y || 0) * (image.height / 100) * scaleY,
      width: (crop.width || 0) * (image.width / 100) * scaleX,
      height: (crop.height || 0) * (image.height / 100) * scaleY,
      unit: 'px',
    };

    setCompletedCrop(pixelCrop);
  }, [crop]);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x,
      completedCrop.y,
      completedCrop.width,
      completedCrop.height,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  }, [completedCrop]);

  const handleCropComplete = async () => {
    const croppedImageBlob = await getCroppedImg();
    if (croppedImageBlob) {
      onCropComplete(croppedImageBlob);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>
            Select an aspect ratio and adjust the crop area to fit your image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Aspect Ratio Selector */}
          <div className="flex gap-2 flex-wrap">
            {allowedRatios.map((ratio) => (
              <Button
                key={ratio.label}
                variant={
                  Math.abs((aspectRatio || 0) - (ratio.value || 0)) < 0.01
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                onClick={() => {
                  setAspectRatio(ratio.value);
                  setTimeout(() => {
                    updateCropForAspectRatio();
                  }, 50);
                }}
                className={`text-xs transition-all duration-200 ${
                  Math.abs((aspectRatio || 0) - (ratio.value || 0)) < 0.01
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                {ratio.label}
              </Button>
            ))}
          </div>

          {/* Crop Area */}
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              aspect={aspectRatio}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={imageSrc}
                onLoad={onImageLoad}
                className="max-w-full max-h-96 object-contain"
              />
            </ReactCrop>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-black hover:bg-[#333333]"
              onClick={handleCropComplete}
              disabled={!completedCrop}
            >
              Apply Crop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
