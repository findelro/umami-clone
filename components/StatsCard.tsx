import React from 'react';

interface StatsCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function StatsCard({ title, children, className = '' }: StatsCardProps) {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{title}</h3>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
} 