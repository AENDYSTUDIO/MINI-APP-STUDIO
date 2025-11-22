import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EditTrackDialogProps {
  trackId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTrackUpdated: () => void;
}

const EditTrackDialog = ({ trackId, open, onOpenChange, onTrackUpdated }: EditTrackDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    cover_url: ""
  });

  useEffect(() => {
    if (trackId && open) {
      loadTrack();
    }
  }, [trackId, open]);

  const loadTrack = async () => {
    if (!trackId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('id', trackId)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title,
        artist: data.artist,
        cover_url: data.cover_url || ""
      });
    } catch (error: any) {
      console.error("Load track error:", error);
      toast.error("Ошибка загрузки трека");
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Пожалуйста, выберите изображение");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Размер файла не должен превышать 5MB");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/track_${trackId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, cover_url: publicUrl }));
      toast.success("Обложка загружена");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Ошибка загрузки обложки");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('tracks')
        .update({
          title: formData.title,
          artist: formData.artist,
          cover_url: formData.cover_url || null
        })
        .eq('id', trackId);

      if (error) throw error;

      toast.success("Трек обновлен");
      onOpenChange(false);
      onTrackUpdated();
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error("Ошибка обновления");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!trackId) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId);

      if (error) throw error;

      toast.success("Трек удален");
      setShowDeleteAlert(false);
      onOpenChange(false);
      onTrackUpdated();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Ошибка удаления");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать трек</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formData.cover_url && (
              <div className="flex justify-center">
                <img
                  src={formData.cover_url}
                  alt="Cover"
                  className="h-32 w-32 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cover-upload">Обложка</Label>
              <div className="flex gap-2">
                <Label htmlFor="cover-upload" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 h-10 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span className="text-sm">Загрузить новую</span>
                  </div>
                  <Input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                    disabled={uploading}
                  />
                </Label>
                {formData.cover_url && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData(prev => ({ ...prev, cover_url: "" }))}
                  >
                    Удалить
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Исполнитель</Label>
              <Input
                id="artist"
                value={formData.artist}
                onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                required
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteAlert(true)}
                disabled={saving || deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Сохранить"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить трек?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Трек будет удален навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Удаление...
                </>
              ) : (
                "Удалить"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditTrackDialog;
