'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Family, ClassType } from '@/types';
import FamilyCard from '@/components/FamilyCard';
import FamilyTableRow from '@/components/FamilyTableRow';
import SearchAndFilters from '@/components/SearchAndFilters';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<ClassType | 'all'>('all');
  const [connectionsFilter, setConnectionsFilter] = useState(false);

  useEffect(() => {
    loadFamilies();
  }, []);

  useEffect(() => {
    filterFamilies();
  }, [families, searchTerm, classFilter, connectionsFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadFamilies = async () => {
    try {
      const { data: familiesData, error: familiesError } = await supabase.from('families').select('*').order('family_name');

      if (familiesError) throw familiesError;

      const { data: adultsData, error: adultsError } = await supabase.from('adults').select('*');

      if (adultsError) throw adultsError;

      const { data: childrenData, error: childrenError } = await supabase.from('children').select('*');

      if (childrenError) throw childrenError;

      const familiesWithMembers: Family[] = familiesData.map((family) => ({
        ...family,
        adults: adultsData.filter((adult) => adult.family_id === family.id),
        children: childrenData.filter((child) => child.family_id === family.id),
      }));

      setFamilies(familiesWithMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load families');
    } finally {
      setLoading(false);
    }
  };

  const filterFamilies = () => {
    let filtered = families;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((family) => family.family_name.toLowerCase().includes(search) || family.description.toLowerCase().includes(search) || family.adults.some((adult) => adult.name.toLowerCase().includes(search) || adult.industry?.toLowerCase().includes(search) || adult.job_title?.toLowerCase().includes(search)) || family.children.some((child) => child.name.toLowerCase().includes(search)));
    }

    // Class filter
    if (classFilter !== 'all') {
      filtered = filtered.filter((family) => family.children.some((child) => child.class === classFilter));
    }

    // Connections filter
    if (connectionsFilter) {
      filtered = filtered.filter((family) => family.adults.some((adult) => adult.interested_in_connections));
    }

    setFilteredFamilies(filtered);
  };

  // Responsive view mode based on screen size
  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth < 1024 ? 'cards' : 'table');
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading families...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={loadFamilies}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SBM Family Directory</h1>
              <p className="text-gray-700 mt-1">Connect with other families in our Montessori community</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Add Your Family
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <SearchAndFilters
          onSearchChange={setSearchTerm}
          onClassFilter={setClassFilter}
          onConnectionsFilter={setConnectionsFilter}
          currentSearch={searchTerm}
          currentClassFilter={classFilter}
          currentConnectionsFilter={connectionsFilter}
        />

        {/* Results Summary */}
        <div className="mb-6 mt-12 text-center">
          <p className="text-3xl font-black pb-1">Family Directory</p>
          <p className="text-gray-800">
            Showing {filteredFamilies.length} of {families.length} families
          </p>
        </div>

        {/* Directory Display */}
        {filteredFamilies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-bold mb-4">{families.length === 0 ? 'No families have been added yet.' : 'No families match your filters.'}</p>
            {families.length === 0 && (
              <Link
                href="/register"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Be the first to add your family!
              </Link>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow-xl/5">
            {/* Sticky Headers */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
              <div className="grid grid-cols-[3fr_4fr_4fr_3fr] gap-6 px-6 py-3 text-sm font-light text-gray-900 text-center">
                <div className="">Family Name</div>
                <div className="">Adults</div>
                <div className="">Children</div>
                <div className="">Description</div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredFamilies.map((family) => (
                <FamilyTableRow
                  key={family.id}
                  family={family}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFamilies.map((family) => (
              <FamilyCard
                key={family.id}
                family={family}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Task slist

// TODO - Add hometown
// TODO - Add Spanish version and ability to switch
// TODO - Add contact info for networking?
// TODO - Remove non-networking spouses in filter?

// DONE - Add visual summary of family members with small circles under family name?
// TODO - Fix styling of cards - OR move to grid view
// TODO - Add Lynx class
// DONE - Fix filter in responsive view: Class dropdown and interested on the same line and remove extra whitespace
// TODO - Update form to move "add" buttons below fields
// TODO - Remove borders and backgrounds from form
// TODO - Add SBM logo to header
// TODO - Add SBM color scheme
// TODO - Fix responsiveness of header, buttons
// TODO - Add animations to filter changes
