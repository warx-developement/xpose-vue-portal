import React from 'react';

interface PlaceholderPageProps {
  title: string;
  subtitle?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, subtitle }) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">
          {subtitle || "This page is under development."}
        </p>
      </div>
    </div>
  );
};
