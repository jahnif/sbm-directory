'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import CountrySelector from '@/components/CountrySelector';
import { supabase } from '@/lib/supabase';
import { FamilyFormData, ClassType } from '@/types';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FamilyFormData>({
    family_name: '',
    description: '',
    adults: [
      {
        name: '',
        image_url: null,
        industry: null,
        job_title: null,
        interested_in_connections: false,
        connection_types: null,
      },
    ],
    children: [
      {
        name: '',
        image_url: null,
        class: 'Pegasus' as ClassType,
      },
    ],
  });

  const addAdult = () => {
    setFormData((prev) => ({
      ...prev,
      adults: [
        ...prev.adults,
        {
          name: '',
          image_url: null,
          industry: null,
          job_title: null,
          interested_in_connections: false,
          connection_types: null,
          country: null,
          city: null,
        },
      ],
    }));
  };

  const removeAdult = (index: number) => {
    if (formData.adults.length > 1) {
      setFormData((prev) => ({
        ...prev,
        adults: prev.adults.filter((_, i) => i !== index),
      }));
    }
  };

  const addChild = () => {
    setFormData((prev) => ({
      ...prev,
      children: [
        ...prev.children,
        {
          name: '',
          image_url: null,
          class: 'Pegasus' as ClassType,
        },
      ],
    }));
  };

  const removeChild = (index: number) => {
    if (formData.children.length > 1) {
      setFormData((prev) => ({
        ...prev,
        children: prev.children.filter((_, i) => i !== index),
      }));
    }
  };

  const updateAdult = (index: number, field: string, value: string | boolean | null) => {
    setFormData((prev) => ({
      ...prev,
      adults: prev.adults.map((adult, i) => (i === index ? { ...adult, [field]: value } : adult)),
    }));
  };

  const updateChild = (index: number, field: string, value: string | ClassType | null) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.map((child, i) => (i === index ? { ...child, [field]: value } : child)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Insert family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert([
          {
            family_name: formData.family_name,
            description: formData.description,
          },
        ])
        .select()
        .single();

      if (familyError) throw familyError;

      // Insert adults
      const adultsToInsert = formData.adults
        .filter((adult) => adult.name.trim())
        .map((adult) => ({
          family_id: family.id,
          ...adult,
        }));

      if (adultsToInsert.length > 0) {
        const { error: adultsError } = await supabase.from('adults').insert(adultsToInsert);

        if (adultsError) throw adultsError;
      }

      // Insert children
      const childrenToInsert = formData.children
        .filter((child) => child.name.trim())
        .map((child) => ({
          family_id: family.id,
          ...child,
        }));

      if (childrenToInsert.length > 0) {
        const { error: childrenError } = await supabase.from('children').insert(childrenToInsert);

        if (childrenError) throw childrenError;
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center mx-auto">Add Your Family</h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* Family Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Family Information</h2>
              <div className="italic text-gray-400 text-sm">*indicates required field</div>
              <div>
                <label
                  htmlFor="family_name"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Family Name *
                </label>
                <input
                  type="text"
                  id="family_name"
                  required
                  value={formData.family_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, family_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Family Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about your family..."
                />
              </div>
            </div>

            {/* Adults */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Adults</h2>

              {formData.adults.map((adult, index) => (
                <div
                  key={index}
                  className="rounded-lg p-8 bg-gray-50/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-gray-900">Adult {index + 1}</h3>
                    {formData.adults.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAdult(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={adult.name}
                        onChange={(e) => updateAdult(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Photo</label>
                      <ImageUpload
                        onImageUploaded={(url) => updateAdult(index, 'image_url', url)}
                        currentImage={adult.image_url}
                        placeholder="Add photo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Industry</label>
                      <input
                        type="text"
                        value={adult.industry || ''}
                        onChange={(e) => updateAdult(index, 'industry', e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={adult.job_title || ''}
                        onChange={(e) => updateAdult(index, 'job_title', e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Country of Origin</label>
                      <CountrySelector
                        value={adult.country}
                        onChange={(country) => updateAdult(index, 'country', country)}
                        placeholder="Select country"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">City</label>
                      <input
                        type="text"
                        value={adult.city || ''}
                        onChange={(e) => updateAdult(index, 'city', e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., New York, Madrid"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`connections-${index}`}
                        checked={adult.interested_in_connections}
                        onChange={(e) => updateAdult(index, 'interested_in_connections', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`connections-${index}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        Interested in professional connections
                      </label>
                    </div>

                    {adult.interested_in_connections && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">What kind of professional connections are you interested in?</label>
                        <textarea
                          value={adult.connection_types || ''}
                          onChange={(e) => updateAdult(index, 'connection_types', e.target.value || null)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Other parents in tech, small business owners, freelancers..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-end items-center">
                <button
                  type="button"
                  onClick={addAdult}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Add Adult
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Children</h2>

              {formData.children.map((child, index) => (
                <div
                  key={index}
                  className="rounded-lg p-8 bg-gray-50/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-gray-700">Child {index + 1}</h3>
                    {formData.children.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChild(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={child.name}
                        onChange={(e) => updateChild(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Class *</label>
                      <select
                        required
                        value={child.class}
                        onChange={(e) => updateChild(index, 'class', e.target.value as ClassType)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pegasus">Pegasus</option>
                        <option value="Lynx">Lynx</option>
                        <option value="Orion">Orion</option>
                        <option value="Andromeda">Andromeda</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Photo</label>
                      <ImageUpload
                        onImageUploaded={(url) => updateChild(index, 'image_url', url)}
                        currentImage={child.image_url}
                        placeholder="Add photo"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end items-center">
                <button
                  type="button"
                  onClick={addChild}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Add Child
                </button>
              </div>
            </div>

            {error && <div className="text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

            <hr className="border-gray-100 text-gray-100 m-10" />

            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding Family...' : 'Add Family'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
