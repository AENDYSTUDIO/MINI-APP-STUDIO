import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const UploadTrack = ({ onUploadComplete }: { onUploadComplete?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file || !title || !artist) {
      toast({
        title: "Заполните все поля",
        description: "Укажите название, исполнителя и выберите файл",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Необходима авторизация");

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('tracks')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tracks')
        .getPublicUrl(filePath);

      // Get audio duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      
      await new Promise((resolve) => {
        audio.onloadedmetadata = () => {
          resolve(audio.duration);
        };
      });

      // Insert track record
      const { error: insertError } = await supabase
        .from('tracks')
        .insert({
          user_id: user.id,
          title,
          artist,
          duration: Math.floor(audio.duration),
          file_path: publicUrl,
          cover_color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        });

      if (insertError) throw insertError;

      toast({
        title: "Трек загружен",
        description: "Ваш трек успешно добавлен",
      });

      setTitle("");
      setArtist("");
      setFile(null);
      setOpen(false);
      onUploadComplete?.();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Ошибка загрузки",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="telegram-button w-full">
          <Upload className="h-4 w-4 mr-2" />
          Загрузить трек
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Загрузка трека</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название трека"
            />
          </div>
          <div>
            <Label htmlFor="artist">Исполнитель</Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Введите имя исполнителя"
            />
          </div>
          <div>
            <Label htmlFor="file">Аудиофайл</Label>
            <Input
              id="file"
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button
            onClick={handleUpload}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Загрузка..." : "Загрузить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadTrack;
