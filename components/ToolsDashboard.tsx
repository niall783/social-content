import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, Globe } from 'lucide-react';

const ToolsDashboard = () => {
  const tools = [
    { name: 'General Generation', icon: <LayoutDashboard size={24} />, href: '/generate/general' },
    { name: 'Redbook Generation', icon: <BookOpen size={24} />, href: '/generate/redbook' },
    { name: 'Chinese Flashcards', icon: <Globe size={24} />, href: '/language' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Social Media Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link href={tool.href} key={tool.name} className="no-underline">
            <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-xl font-semibold">{tool.name}</h2>
                {tool.icon}
              </div>
              <p className="text-sm text-gray-600">Click to access this tool</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ToolsDashboard;