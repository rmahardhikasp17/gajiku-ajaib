import { icons } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryIconProps {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}

const CategoryIconComponent = ({ name, color, size = 20, className }: CategoryIconProps) => {
  const IconComp = icons[name as keyof typeof icons];
  if (!IconComp) return null;
  return (
    <IconComp
      size={size}
      className={cn(className)}
      style={color ? { color: `hsl(${color})` } : undefined}
    />
  );
};

export default CategoryIconComponent;
