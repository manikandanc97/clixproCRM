"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  Save, 
  Loader2, 
  AlertTriangle, 
  Trash2,
  ImagePlus,
  Camera
} from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { useAuth } from "@/features/auth/components/auth-provider";
import { CRMCard } from "@/shared/components/crm";
import { useMutation } from "@tanstack/react-query";
import { updateProfile, uploadUserAvatar } from "@/shared/lib/api/auth";
import { ImageCropperModal } from "@/shared/components/ImageCropperModal";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function formatRole(role?: string) {
  if (!role) return "";
  return role
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getInitials(name?: string) {
  if (!name) return "CR";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

const ProfileSettings = () => {
  const { user, refreshUser } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedRawFile, setSelectedRawFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const initials = getInitials(user?.name);
  
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      void refreshUser();
      toast.success("Profile details updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update profile");
    }
  });

  const completion = useMemo(() => {
    let score = 0;
    if (user?.name) score += 25;
    if (user?.email) score += 25;
    if (user?.role) score += 20;
    if (user?.phone) score += 15;
    if (user?.avatar) score += 15;
    return score;
  }, [user]);

  const handleSelectRawFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, or WebP)");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    setSelectedRawFile(file);
    setCropModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSelectRawFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleSelectRawFile(file);
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    setUploadingAvatar(true);
    try {
      const result = await uploadUserAvatar(croppedFile);
      if (result?.avatar) {
        await refreshUser();
        toast.success("Profile photo updated successfully!");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to upload profile photo"
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      await updateProfile({ avatar: null });
      await refreshUser();
      toast.success("Profile photo removed successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to remove profile photo"
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = () => {
    mutation.mutate(formData);
  };

  const hasChanges =
    formData.name !== (user?.name || "") ||
    formData.email !== (user?.email || "") ||
    formData.phone !== (user?.phone || "");

  return (
    <div className="space-y-5">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Image Cropper Modal */}
      <ImageCropperModal
        open={cropModalOpen}
        onOpenChange={setCropModalOpen}
        imageFile={selectedRawFile}
        onCropComplete={(croppedFile) => {
          void handleCropComplete(croppedFile);
        }}
        title="Crop & Align Profile Photo"
        description="Position and crop your photo with proper 1:1 aspect ratio for optimal display across the CRM."
      />

      {/* Profile Identity Card */}
      <CRMCard>
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          {/* Avatar Upload Dropzone Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
            className={`relative group cursor-pointer w-20 h-20 sm:w-22 sm:h-22 rounded-2xl border-2 transition-all flex items-center justify-center overflow-hidden bg-card/80 backdrop-blur-sm shadow-inner shrink-0 ${
              isDragging
                ? "border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.02]"
                : "border-dashed border-border/80 hover:border-primary/60 hover:bg-muted/40"
            }`}
          >
            {uploadingAvatar ? (
              <div className="flex flex-col items-center justify-center p-2 text-center gap-1">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-[9px] font-semibold text-muted-foreground">Uploading...</span>
              </div>
            ) : user?.avatar ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar}
                  alt={user.name || "Profile Photo"}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white rounded-2xl gap-0.5">
                  <ImagePlus className="w-4 h-4" />
                  <span className="text-[9px] font-semibold">Change</span>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xl font-bold w-full h-full rounded-2xl flex items-center justify-center select-none">
                  {initials}
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white rounded-2xl gap-0.5">
                  <Camera className="w-4 h-4" />
                  <span className="text-[9px] font-semibold">Upload</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
            <div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground truncate">
                  {user?.name || "User Name"}
                </h2>
                {completion === 100 && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-none rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-medium truncate">{user?.email}</p>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 pt-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                {formatRole(user?.role)}
              </div>

              <div className="h-3 w-px bg-border/60 hidden sm:block" />

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs font-semibold px-2.5 rounded-lg border-border/60 hover:bg-muted/60"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  <ImagePlus className="w-3.5 h-3.5 mr-1 text-primary" />
                  {user?.avatar ? "Change Photo" : "Upload Photo"}
                </Button>
                {user?.avatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs font-semibold px-2.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <p className="text-[10.5px] text-muted-foreground pt-0.5">
              PNG, JPG, or WebP (max 5MB)
            </p>
          </div>
        </div>
      </CRMCard>

      {/* Personal Details */}
      <CRMCard>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold tracking-tight text-foreground">Personal Details</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Update your personal information and how it&apos;s displayed.
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={!hasChanges || mutation.isPending}
            className="flex items-center gap-2 font-semibold shadow-sm"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Display Name</Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
                className="pl-9 h-10 rounded-lg border-border/60 bg-muted/30 focus:bg-card focus:border-primary/30 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@company.com"
                className="pl-9 h-10 rounded-lg border-border/60 bg-muted/30 focus:bg-card focus:border-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Phone Number</Label>
            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 000-0000"
                className="pl-9 h-10 rounded-lg border-border/60 bg-muted/30 focus:bg-card focus:border-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Workspace Role</Label>
            <div className="relative group">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors" />
              <Input
                value={formatRole(user?.role)}
                readOnly
                className="pl-9 h-10 rounded-lg border-border/60 cursor-not-allowed text-muted-foreground italic bg-muted/50"
              />
            </div>
          </div>
        </div>
      </CRMCard>

      {/* Completion Widget */}
      <CRMCard className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm tracking-tight">Profile Completion</h4>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Your profile is {completion}% complete.{completion < 100 ? " Add missing details to reach 100%." : ""}
            </p>
          </div>
        </div>
        <div className="hidden md:block w-28 shrink-0">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="bg-primary rounded-full h-full transition-all duration-500" style={{ width: `${completion}%` }} />
          </div>
          <p className="text-right text-[9px] font-bold text-primary mt-1">{completion}%</p>
        </div>
      </CRMCard>

      {/* Danger Zone */}
      <CRMCard className="border-destructive/30 bg-destructive/5 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Danger Zone
              </h3>
              <Badge variant="destructive" className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5">
                Irreversible
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Permanently delete your account, workspace, and all associated CRM records.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="font-bold text-xs gap-2 shrink-0 h-9 px-4 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </div>
      </CRMCard>

      <DeleteAccountModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
      />
    </div>
  );
};

export default ProfileSettings;
