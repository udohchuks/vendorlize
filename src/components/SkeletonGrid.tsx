'use client';

import React from 'react';

export const SkeletonGrid: React.FC = () => {
  const skeletons = Array.from({ length: 4 });

  return (
    <div className="grid grid-cols-2 gap-4">
      {skeletons.map((_, i) => (
        <div key={i} className="flex flex-col gap-3 animate-fade-in">
          {/* Image Shimmer */}
          <div className="aspect-[3/4] w-full rounded-2xl animate-shimmer" />
          
          {/* Details Shimmer */}
          <div className="space-y-2">
            <div className="h-3 w-1/3 rounded bg-[#1F1C1A] animate-shimmer" />
            <div className="h-4 w-3/4 rounded bg-[#1F1C1A] animate-shimmer" />
            <div className="h-4 w-1/2 rounded bg-[#1F1C1A] animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};
