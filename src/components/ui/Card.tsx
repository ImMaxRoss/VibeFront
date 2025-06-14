import React, { ReactNode } from 'react';
import { styleClasses } from '../../styles/classes';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ className = '', children, hoverable = false, onClick }) => {
  const baseClasses = styleClasses.card;
  const hoverClasses = hoverable ? styleClasses.cardHover : '';
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};