'use client';

import React from 'react';

interface CategoryPillsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 flex items-center gap-3 px-1">
      {categories.map((category) => {
        const isActive = selectedCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider whitespace-nowrap transition-all duration-300 ${
              isActive
                ? 'bg-gradient-to-r from-[#D4A853] to-[#C9B99A] text-[#0A0A0A] shadow-[0_4px_12px_rgba(212,168,83,0.35)] scale-105 border border-transparent'
                : 'bg-[#111111] border border-[#1F1C1A] text-[#C9B99A] hover:text-[#FAF0E6] hover:border-[#C9B99A]/30'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};
