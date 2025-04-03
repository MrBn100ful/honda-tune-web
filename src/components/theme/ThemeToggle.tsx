
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark relative overflow-hidden"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun size={16} className="absolute transform transition-all scale-100" />
      ) : (
        <Moon size={16} className="absolute transform transition-all scale-100" />
      )}
      <span className={`absolute transform transition-all ${theme === 'dark' ? 'scale-0' : 'scale-100'}`}>
        <Moon size={16} />
      </span>
      <span className={`absolute transform transition-all ${theme === 'dark' ? 'scale-100' : 'scale-0'}`}>
        <Sun size={16} />
      </span>
    </Button>
  );
};
