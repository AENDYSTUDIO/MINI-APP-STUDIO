import { Music2 } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="flex h-14 items-center justify-center px-4">
        <div className="flex items-center gap-2">
          <Music2 className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">NORMAL DANCE</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
