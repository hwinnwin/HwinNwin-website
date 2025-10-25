import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Check, X, AlertTriangle, CheckCircle } from "lucide-react";

interface PhotoUploadProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
}

const requiredAngles = [
  "Front view",
  "Rear view", 
  "Left side",
  "Right side",
  "Close-up damage",
  "Interior (if damaged)"
];

export default function PhotoUpload({ photos, onPhotosChange }: PhotoUploadProps) {
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const validateFile = (file: File): string[] => {
    const errors: string[] = [];
    
    // Check file size (8MB limit)
    if (file.size > 8 * 1024 * 1024) {
      errors.push("File size exceeds 8MB limit");
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push("Only JPEG, PNG, and WebP images are allowed");
    }
    
    // Basic size check
    if (file.size < 10 * 1024) {
      errors.push("File too small, may be corrupted");
    }
    
    return errors;
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const errors: string[] = [];
    const validFiles: File[] = [];
    
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors: fileErrors }) => {
      fileErrors.forEach((error: any) => {
        errors.push(`${file.name}: ${error.message}`);
      });
    });
    
    // Validate accepted files
    acceptedFiles.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${fileErrors.join(', ')}`);
      }
    });
    
    setUploadErrors(errors);
    
    if (validFiles.length > 0) {
      onPhotosChange([...photos, ...validFiles]);
    }
  }, [photos, onPhotosChange]);

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 8 * 1024 * 1024,
    multiple: true
  });

  const getPhotoStatus = (photo: File) => {
    const errors = validateFile(photo);
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return (
    <div className="space-y-4">
      {/* Photo Requirements Checklist */}
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground mb-2"><strong>Required photos for accurate assessment:</strong></p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
          {requiredAngles.map((angle, index) => (
            <div key={angle} className="flex items-center">
              {index < photos.length ? (
                <CheckCircle className="text-green-500 mr-1" size={12} />
              ) : (
                <X className="text-destructive mr-1" size={12} />
              )}
              {angle}
            </div>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border bg-muted/30 hover:bg-muted/50'
          }`}
        data-testid="photo-upload-area"
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto text-4xl text-muted-foreground mb-4" size={48} />
        <h4 className="text-lg font-medium text-foreground mb-2">Drop photos here or click to upload</h4>
        <p className="text-sm text-muted-foreground mb-4">Maximum 8MB per file. Images must be at least 640px on the shorter side.</p>
        <Button type="button" data-testid="button-add-photos">
          <i className="fas fa-plus mr-2"></i>Add Photos
        </Button>
      </div>

      {/* Upload Errors */}
      {uploadErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {uploadErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Uploaded Photos Preview */}
      {photos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo, index) => {
            const status = getPhotoStatus(photo);
            return (
              <Card key={index} className="p-3" data-testid={`photo-preview-${index}`}>
                <img 
                  src={URL.createObjectURL(photo)} 
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded mb-2"
                  loading="lazy"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground truncate">{photo.name}</span>
                  <div className="flex items-center space-x-1">
                    {status.isValid ? (
                      <Badge variant="secondary" className="text-xs">
                        <Check size={12} className="mr-1" />
                        Valid
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle size={12} className="mr-1" />
                        Issues
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removePhoto(index)}
                      data-testid={`button-remove-photo-${index}`}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                </div>
                {!status.isValid && status.errors.length > 0 && (
                  <div className="mt-2 text-xs text-destructive">
                    {status.errors.join(', ')}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
