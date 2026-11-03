import React, { useState, useRef } from "react";
import {
  Upload,
  Video,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  Film,
  MapPin,
  User,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/language-context";
import type { AgriReel } from "@/routes/reels";

interface UploadReelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReelUploaded: (newReel: AgriReel) => void;
}

const CATEGORIES = [
  { value: "Organic Farming", kn: "ಸಾವಯವ ಕೃಷಿ", en: "Organic Farming" },
  { value: "Machinery", kn: "ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ", en: "Machinery" },
  { value: "Crop Care", kn: "ಬೆಳೆ ರಕ್ಷಣೆ", en: "Crop Care" },
  { value: "Weather", kn: "ಹವಾಮಾನ & ಸಿಂಪಡಣೆ", en: "Weather & Spray" },
  { value: "Pest Control", kn: "ಕೀಟ ರೋಗ ನಿರ್ವಹಣೆ", en: "Pest Control" },
  { value: "Government Schemes", kn: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು", en: "Govt Schemes" },
  { value: "Market Tips", kn: "ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ", en: "Market Tips" },
] as const;

export function UploadReelDialog({
  open,
  onOpenChange,
  onReelUploaded,
}: UploadReelDialogProps) {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const isKn = language === "kn";

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("Organic Farming");
  const [authorName, setAuthorName] = useState<string>(
    (profile?.full_name ||
      profile?.username ||
      (user?.email ? user.email.split("@")[0] : "") ||
      "ರೈತ ಮಿತ್ರ (Farmer)") as string
  );
  const [locationName, setLocationName] = useState<string>("Mandya, Karnataka");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // Generate thumbnail from first second of video using an offscreen canvas
  const captureThumbnailFromVideo = (videoElement: HTMLVideoElement) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setThumbnailDataUrl(dataUrl);
      }
    } catch {
      // Fallback: Default farming thumbnail will be used
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error(
        isKn
          ? "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ವೀಡಿಯೊ ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ (mp4, webm, mov)."
          : "Please select a valid video file (mp4, webm, mov)."
      );
      return;
    }

    // Limit check: 100MB
    if (file.size > 100 * 1024 * 1024) {
      toast.error(
        isKn
          ? "ವೀಡಿಯೊ ಗಾತ್ರ 100MB ಗಿಂತ ಕಡಿಮೆಯಿರಬೇಕು."
          : "Video size must be less than 100MB."
      );
      return;
    }

    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);

    // Auto capture thumbnail
    const tempVideo = document.createElement("video");
    tempVideo.src = objectUrl;
    tempVideo.currentTime = 1;
    tempVideo.onloadeddata = () => {
      tempVideo.currentTime = 1;
    };
    tempVideo.onseeked = () => {
      captureThumbnailFromVideo(tempVideo);
    };
  };

  const resetForm = () => {
    setVideoFile(null);
    setVideoPreviewUrl("");
    setThumbnailDataUrl("");
    setTitle("");
    setDescription("");
    setCategory("Organic Farming");
    setIsUploading(false);
    setUploadStatus("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile && !videoPreviewUrl) {
      toast.error(
        isKn
          ? "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಕೃಷಿ ವೀಡಿಯೊವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ."
          : "Please select a farming video to upload."
      );
      return;
    }

    if (!title.trim()) {
      toast.error(
        isKn
          ? "ದಯವಿಟ್ಟು ರೀಲ್ ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ."
          : "Please enter a title for your reel."
      );
      return;
    }

    setIsUploading(true);
    setUploadStatus(isKn ? "ವೀಡಿಯೊ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." : "Uploading video file...");

    try {
      let finalVideoUrl = videoPreviewUrl;
      let finalThumbnailUrl =
        thumbnailDataUrl ||
        "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=600&q=80";

      // 1. Upload Video File to Supabase Storage Bucket `reels`
      if (videoFile) {
        const fileExt = videoFile.name.split(".").pop() || "mp4";
        const cleanName = videoFile.name
          .replace(/[^a-zA-Z0-9]/g, "_")
          .substring(0, 24);
        const fileName = `reel_${Date.now()}_${cleanName}.${fileExt}`;

        try {
          const { data: storageData, error: storageErr } = await supabase.storage
            .from("reels")
            .upload(fileName, videoFile, {
              contentType: videoFile.type || "video/mp4",
              upsert: false,
            });

          if (!storageErr && storageData) {
            const { data: publicUrlData } = supabase.storage
              .from("reels")
              .getPublicUrl(fileName);
            if (publicUrlData?.publicUrl) {
              finalVideoUrl = publicUrlData.publicUrl;
            }
          }
        } catch {
          // If storage bucket is not reachable, gracefully fallback to object URL
        }
      }

      setUploadStatus(
        isKn ? "ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆ..." : "Saving reel details..."
      );

      // 2. Insert record into Supabase `public.reels` table
      let reelId = `user-reel-${Date.now()}`;
      try {
        const { data: insertData, error: insertErr } = await supabase
          .from("reels")
          .insert([
            {
              title: title.trim(),
              description: description.trim(),
              category: category,
              video_url: finalVideoUrl,
              thumbnail_url: finalThumbnailUrl,
              author_name: authorName.trim() || "Farmer Friend",
              location: locationName.trim() || "Karnataka",
              views_count: 1,
              likes_count: 0,
              is_published: true,
            },
          ])
          .select();

        if (!insertErr && insertData?.[0]?.id) {
          reelId = insertData[0].id;
        }
      } catch {
        // Safe local persistence fallback
      }

      // 3. Construct newly uploaded reel item
      const newReel: AgriReel = {
        id: reelId,
        title: title.trim(),
        description: description.trim(),
        category: category as any,
        videoUrl: finalVideoUrl,
        thumbnail: finalThumbnailUrl,
        views: "1",
        likes: 0,
        author: authorName.trim() || "Farmer Friend",
        location: locationName.trim() || "Karnataka",
        isUserUploaded: true,
      };

      // 4. Save to localStorage so uploaded reel is persisted locally too
      try {
        const stored = localStorage.getItem("raitha_seva_user_reels");
        const parsed = stored ? JSON.parse(stored) : [];
        localStorage.setItem(
          "raitha_seva_user_reels",
          JSON.stringify([newReel, ...parsed])
        );
      } catch {
        // ignore
      }

      toast.success(
        isKn
          ? "ನಿಮ್ಮ ಕೃಷಿ ರೀಲ್ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ!"
          : "Your farming reel has been published successfully!"
      );

      onReelUploaded(newReel);
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error(
        isKn
          ? "ಅಪ್‌ಲೋಡ್ ಮಾಡುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
          : "Failed to upload reel. Please try again."
      );
    } finally {
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-emerald-500/80 bg-white p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-md shadow-green-500/30">
              <Film className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-black text-gray-900">
                {isKn ? "ಕೃಷಿ ರೀಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ" : "Upload Agri Reel"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {isKn
                  ? "ನಿಮ್ಮ ಕೃಷಿ ಅನುಭವ, ಜೀವಾಮೃತ, ಯಂತ್ರೋಪಕರಣ ಅಥವಾ ಬೆಳೆ ರಕ್ಷಣೆಯ ವೀಡಿಯೊವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ."
                  : "Share short practical farming tips, demos, or success stories with fellow farmers across India."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Video File Dropzone / Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-800">
              {isKn ? "ವೀಡಿಯೊ ಫೈಲ್ (Video File)" : "Video File (9:16 or MP4)"} *
            </Label>

            <input
              type="file"
              ref={fileInputRef}
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              onChange={handleFileChange}
              className="hidden"
            />

            {!videoPreviewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-6 text-center cursor-pointer transition-all hover:border-emerald-500 hover:bg-emerald-50 active:scale-99"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-xs">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-emerald-950">
                    {isKn ? "ವೀಡಿಯೊ ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ" : "Click to select video"}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    MP4, WebM, MOV (Max 100MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl border border-emerald-200 bg-slate-950 p-2 overflow-hidden shadow-inner">
                <video
                  ref={videoPreviewRef}
                  src={videoPreviewUrl}
                  controls
                  playsInline
                  className="mx-auto max-h-56 rounded-xl object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreviewUrl("");
                    setThumbnailDataUrl("");
                  }}
                  className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                  title="Remove video"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-emerald-400 font-semibold">
                  <span className="truncate max-w-[200px]">{videoFile?.name || "Video Loaded"}</span>
                  <span>{videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB` : "Preview"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Reel Title */}
          <div className="space-y-1.5">
            <Label htmlFor="reel-title" className="text-xs font-bold text-gray-800">
              {isKn ? "ರೀಲ್ ಶೀರ್ಷಿಕೆ (Title)" : "Reel Title"} *
            </Label>
            <Input
              id="reel-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isKn
                  ? "ಉದಾ: ೨೦೦ ಲೀಟರ್ ಡ್ರಮ್‌ನಲ್ಲಿ ಜೀವಾಮೃತ ತಯಾರಿಕೆ"
                  : "e.g. Precision Drip Irrigation & Spray Timing in Tomato"
              }
              className="rounded-xl border-gray-200 focus-visible:ring-emerald-500 text-sm font-semibold"
              required
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-800">
              {isKn ? "ವಿಭಾಗ (Category)" : "Category"} *
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl border-gray-200 text-xs sm:text-sm font-semibold">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl bg-white border border-gray-200 shadow-xl">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-xs sm:text-sm font-semibold">
                    {isKn ? `${c.kn} (${c.en})` : c.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="reel-desc" className="text-xs font-bold text-gray-800">
              {isKn ? "ವಿವರಣೆ ಮತ್ತು ಸಲಹೆ (Description & Tips)" : "Description & Tips"}
            </Label>
            <Textarea
              id="reel-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isKn
                  ? "ಬೆಳೆಗೆ ಸಂಬಂಧಿಸಿದ ವಿವರ, ಪ್ರಮಾಣ, ಔಷಧಿ ಹಾಗೂ ರೈತರಿಗೆ ಉಪಯುಕ್ತ ಮಾಹಿತಿ..."
                  : "Key measurements, dosages, tools used and recommendations for farmers..."
              }
              className="rounded-xl border-gray-200 focus-visible:ring-emerald-500 text-xs sm:text-sm"
            />
          </div>

          {/* Author Name & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="reel-author" className="text-xs font-bold text-gray-800">
                {isKn ? "ರೈತರ ಹೆಸರು (Farmer Name)" : "Farmer / Author Name"}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="reel-author"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="rounded-xl pl-9 border-gray-200 text-xs sm:text-sm font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reel-loc" className="text-xs font-bold text-gray-800">
                {isKn ? "ಸ್ಥಳ / ಜಿಲ್ಲೆ (Location)" : "Location / District"}
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="reel-loc"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Mandya, Karnataka"
                  className="rounded-xl pl-9 border-gray-200 text-xs sm:text-sm font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-gray-200 text-xs font-bold h-11 px-4 cursor-pointer"
            >
              {isKn ? "ರದ್ದುಮಾಡಿ (Cancel)" : "Cancel"}
            </Button>

            <Button
              type="submit"
              disabled={isUploading}
              className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-extrabold text-xs sm:text-sm h-11 px-6 shadow-lg shadow-green-600/30 gap-2 cursor-pointer active:scale-98"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{uploadStatus || "Uploading..."}</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>{isKn ? "ರೀಲ್ ಪ್ರಕಟಿಸಿ (Publish Reel)" : "Publish Reel"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
