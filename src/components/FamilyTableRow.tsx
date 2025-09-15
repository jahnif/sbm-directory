'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Family } from '@/types';

interface FamilyTableRowProps {
  family: Family;
}

export default function FamilyTableRow({ family }: FamilyTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const truncateText = (text: string, limit: number = 150) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  };

  const shouldTruncate = family.description.length > 150;

  return (
    <div className="border-b border-gray-200 py-6 hover:bg-gray-50">
      <div className="grid lg:grid-cols-[3fr_4fr_4fr_3fr] gap-4 px-6">
        {/* Family Name */}
        <div className="flex flex-col">
          <div className="lg:hidden text-xs text-gray-500 text-center mb-1">Family Name</div>
          <h3 className="font-semibold text-gray-900 lg:text-lg text-2xl text-center lg:text-left">{family.family_name} Family</h3>

          <div className="flex mt-2 mx-auto lg:mx-0 mb-6">
            {family.adults.map((adult) => (
              <Image
                src={adult.image_url}
                alt={adult.name}
                width={20}
                height={20}
                className="object-cover w-10 h-10 rounded-full mr-[-8px]"
              />
            ))}
            {family.children.map((child) => (
              <Image
                src={child.image_url}
                alt={child.name}
                width={20}
                height={20}
                className="object-cover w-10 h-10 rounded-full mr-[-1em]"
              />
            ))}
          </div>
        </div>

        {/* Adults */}
        <div className="">
          <div className="lg:hidden text-sm text-gray-500 text-center mb-4">Adults</div>
          <div className="flex lg:flex-col flex-wrap gap-4 mb-4 justify-center">
            {family.adults.map((adult) => (
              <div
                key={adult.id}
                className="flex"
              >
                <div className="w-22 h-22 rounded-full overflow-hidden bg-gray-200 mb-2 shadow-sm mr-3">
                  {adult.image_url ? (
                    <Image
                      src={adult.image_url}
                      alt={adult.name}
                      width={90}
                      height={90}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-lg">{adult.name.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <div className="w-64 flex flex-col justify-center">
                  <p
                    className="text-md text-gray-900 font-bold"
                    title={adult.name}
                  >
                    {adult.name}
                  </p>
                  {adult.job_title && (
                    <p
                      className="text-xs text-gray-800"
                      title={adult.job_title}
                    >
                      {adult.job_title}
                    </p>
                  )}
                  {adult.industry && (
                    <p
                      className="text-xs text-gray-700"
                      title={adult.industry}
                    >
                      {adult.industry}
                    </p>
                  )}
                  {adult.interested_in_connections && (
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">🤝 Networking</span>
                      </div>
                      {adult.connection_types && (
                        <p className="text-xs text-gray-800 leading-relaxed">
                          <span className="font-bold">Professional interests:</span> {adult.connection_types}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Children */}
        <div className="flex flex-wrap gap-3 flex-col items-center justify-center">
          <div className="lg:hidden text-sm text-gray-500 text-center mb-4">Children</div>

          <div className="flex lg:flex-col flex-wrap gap-4 mb-4 justify-center">
            {family.children.map((child) => (
              <div
                key={child.id}
                className="text-center"
              >
                <div className="w-22 h-22 rounded-full overflow-hidden bg-gray-200 mx-auto mb-1 shadow-sm">
                  {child.image_url ? (
                    <Image
                      src={child.image_url}
                      alt={child.name}
                      width={90}
                      height={90}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-medium">{child.name.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <div className="w-24">
                  <p
                    className="text-sm font-bold text-gray-900"
                    title={child.name}
                  >
                    {child.name}
                  </p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${child.class === 'Pegasus' ? 'bg-red-100 text-red-800' : child.class === 'Orion' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{child.class}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="">
          <div className="lg:hidden text-sm text-gray-500 text-center mb-4">About</div>

          <div className="text-sm text-gray-800 leading-relaxed text-center lg:text-left">
            <p>{isExpanded || !shouldTruncate ? family.description : truncateText(family.description)}</p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-700 text-sm mt-1 font-medium"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
