// src/components/StatCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  onClick?: () => void; // NEW: Optional click handler
  hoverable?: boolean; // NEW: Optional hover effect
}

export const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  color,
  onClick,
  hoverable = false
}) => {
  const baseClasses = "bg-gray-800 rounded-xl p-6 transition-all duration-200";
  const hoverClasses = hoverable || onClick 
    ? "hover:shadow-lg hover:scale-[1.02] cursor-pointer hover:bg-gray-700" 
    : "";
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-100 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-20 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};