'use client';

import React from 'react';

interface PixelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function PixelButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: PixelButtonProps) {
  const baseStyles = `
    relative font-bold uppercase tracking-wider
    border-4 cursor-pointer transition-all
    active:translate-y-1 active:shadow-none
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0
    [image-rendering:pixelated]
  `;
  
  const variantStyles = {
    primary: 'bg-green-600 border-green-800 text-white hover:bg-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]',
    secondary: 'bg-blue-600 border-blue-800 text-white hover:bg-blue-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]',
    danger: 'bg-red-600 border-red-800 text-white hover:bg-red-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]',
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
    >
      {children}
    </button>
  );
}
