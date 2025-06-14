import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { styleClasses } from '../../styles/classes';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false, 
  children, 
  disabled,
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 transform active:scale-95 flex items-center justify-center';
  const variants = {
    primary: styleClasses.buttonPrimary,
    secondary: styleClasses.buttonSecondary,
    ghost: styleClasses.buttonGhost,
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};