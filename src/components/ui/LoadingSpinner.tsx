// In your LoadingSpinner component file (likely in src/components/ui/LoadingSpinner.tsx)
interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg'; // Add this line if you want size prop
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className, size }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className={`border-2 border-slate-600 rounded-full ${size ? sizeClasses[size] : 'w-6 h-6'}`}></div>
        <div className={`border-2 border-amber-400 rounded-full animate-spin absolute inset-0 border-t-transparent ${size ? sizeClasses[size] : 'w-6 h-6'}`}></div>
      </div>
    </div>
  );
};