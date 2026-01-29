import React from 'react';
import { ChannelGroup } from '../types';

interface CategoryTabsProps {
  groups: ChannelGroup[];
  activeGroup: string | null;
  onGroupChange: (group: string | null) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  groups,
  activeGroup,
  onGroupChange
}) => {
  const sortedGroups = [...groups].sort((a, b) => b.count - a.count);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => onGroupChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeGroup === null
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All Categories
        </button>
        
        {sortedGroups.slice(0, 12).map((group) => (
          <button
            key={group.name}
            onClick={() => onGroupChange(group.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeGroup === group.name
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {group.name}
            <span className="ml-1 text-xs opacity-75">({group.count})</span>
          </button>
        ))}
      </div>

      {sortedGroups.length > 12 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
            Show {sortedGroups.length - 12} more categories
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {sortedGroups.slice(12).map((group) => (
              <button
                key={group.name}
                onClick={() => onGroupChange(group.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeGroup === group.name
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                {group.name}
                <span className="ml-1 opacity-75">({group.count})</span>
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};