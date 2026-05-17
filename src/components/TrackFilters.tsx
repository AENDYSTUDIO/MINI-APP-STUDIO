import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sliders, X } from "lucide-react";

export interface TrackFilterValues {
  bpmRange: [number, number];
  energy: string; // "all" | "1" | "2" | ...
  key: string; // "all" or Camelot like "8A"
}

const CAMELOT_KEYS: string[] = [];
for (let i = 1; i <= 12; i++) {
  CAMELOT_KEYS.push(`${i}A`);
  CAMELOT_KEYS.push(`${i}B`);
}

interface TrackFiltersProps {
  value: TrackFilterValues;
  onChange: (v: TrackFilterValues) => void;
  onReset?: () => void;
}

export const defaultFilters: TrackFilterValues = {
  bpmRange: [120, 145],
  energy: "all",
  key: "all",
};

const TrackFilters = ({ value, onChange, onReset }: TrackFiltersProps) => {
  return (
    <div className="telegram-card p-4 space-y-4 border-primary/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sliders className="h-4 w-4 text-[hsl(var(--neon-pink))]" />
          Фильтры
        </div>
        {onReset && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-7 text-xs">
            <X className="h-3 w-3 mr-1" /> Сброс
          </Button>
        )}
      </div>

      {/* BPM */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">BPM</span>
          <span className="font-mono text-[hsl(var(--neon-blue))]">
            {value.bpmRange[0]} – {value.bpmRange[1]}
          </span>
        </div>
        <Slider
          min={60}
          max={200}
          step={1}
          value={value.bpmRange}
          onValueChange={(v) => onChange({ ...value, bpmRange: [v[0], v[1]] as [number, number] })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Energy */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Energy</label>
          <Select value={value.energy} onValueChange={(v) => onChange({ ...value, energy: v })}>
            <SelectTrigger className="h-9 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              {[1, 2, 3, 4, 5].map((e) => (
                <SelectItem key={e} value={String(e)}>
                  {"⚡".repeat(e)} {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Key (Camelot) */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Key (Camelot)</label>
          <Select value={value.key} onValueChange={(v) => onChange({ ...value, key: v })}>
            <SelectTrigger className="h-9 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value="all">Все</SelectItem>
              {CAMELOT_KEYS.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export { CAMELOT_KEYS };
export default TrackFilters;
