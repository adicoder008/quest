// components/quest/OnQuestPeopleInput.tsx
'use client'
import React, { useState } from 'react';
import { Plus, X, Phone, Mail, Globe, MessageCircle, Star } from 'lucide-react';
import { OnQuestPerson } from '@/app/types';

interface OnQuestPeopleInputProps {
  people: Partial<OnQuestPerson>[];
  onChange: (people: Partial<OnQuestPerson>[]) => void;
}

const serviceTypeIcons: Record<string, string> = {
  food: '🍽️',
  accommodation: '🏨',
  transport: '🚗',
  fun: '🎉',
  emergency: '🚨',
  police: '👮',
  guide: '🗺️',
  other: '📋'
};

const OnQuestPeopleInput: React.FC<OnQuestPeopleInputProps> = ({ people, onChange }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<OnQuestPerson>>({
    name: '',
    serviceType: 'food',
    category: '',
    location: { name: '', coordinates: { lat: 0, lng: 0 } },
    contact: { phone: '', email: '', website: '', whatsapp: '' },
    rating: 4.0,
    reviewCount: 0,
    description: '',
    tags: [],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      serviceType: 'food',
      category: '',
      location: { name: '', coordinates: { lat: 0, lng: 0 } },
      contact: { phone: '', email: '', website: '', whatsapp: '' },
      rating: 4.0,
      reviewCount: 0,
      description: '',
      tags: [],
    });
    setShowAddForm(false);
    setEditingIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      alert('Please enter a name');
      return;
    }

    if (editingIndex !== null) {
      // Update existing
      const updated = [...people];
      updated[editingIndex] = formData;
      onChange(updated);
    } else {
      // Add new
      onChange([...people, formData]);
    }

    resetForm();
  };

  const handleEdit = (index: number) => {
    setFormData(people[index]);
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleDelete = (index: number) => {
    onChange(people.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            📇 OnQuest People <span className="text-sm text-gray-400">(Optional)</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Add contacts from your journey - restaurants, hotels, guides, etc.
          </p>
        </div>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Add
          </button>
        )}
      </div>

      {/* People List */}
      {people.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {people.map((person, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-orange-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{serviceTypeIcons[person.serviceType || 'other']}</span>
                    <h4 className="font-semibold text-white text-sm">{person.name}</h4>
                  </div>
                  {person.category && (
                    <p className="text-xs text-gray-400">{person.category}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(index)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    title="Delete"
                  >
                    <X size={16} className="text-red-400" />
                  </button>
                </div>
              </div>

              {/* Contact Info Preview */}
              <div className="space-y-1">
                {person.contact?.phone && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Phone size={12} />
                    {person.contact.phone}
                  </div>
                )}
                {person.location?.name && (
                  <p className="text-xs text-gray-400 line-clamp-1">{person.location.name}</p>
                )}
              </div>

              {/* Rating */}
              {person.rating && (
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < Math.floor(person.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                    />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">{person.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-white">
              {editingIndex !== null ? 'Edit Contact' : 'Add Contact'}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name & Service Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none text-sm"
                  placeholder="e.g., Raj's Restaurant"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Type *</label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as any })}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none text-sm"
                >
                  {Object.entries(serviceTypeIcons).map(([type, icon]) => (
                    <option key={type} value={type}>
                      {icon} {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none text-sm"
                  placeholder="e.g., Indian Restaurant"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location?.name}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location!, name: e.target.value } 
                  })}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none text-sm"
                  placeholder="e.g., MG Road"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.contact?.phone}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    contact: { ...formData.contact!, phone: e.target.value } 
                  })}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none text-sm"
                  placeholder="+91 1234567890"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={formData.contact?.whatsapp}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    contact: { ...formData.contact!, whatsapp: e.target.value } 
                  })}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none text-sm"
                  placeholder="+91 1234567890"
                />
              </div>
            </div>

            {/* Email & Website */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.contact?.email}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    contact: { ...formData.contact!, email: e.target.value } 
                  })}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none text-sm"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.contact?.website}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    contact: { ...formData.contact!, website: e.target.value } 
                  })}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Rating & Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Your Rating</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Price Range</label>
                <select
                  value={formData.priceRange || ''}
                  onChange={(e) => setFormData({ ...formData, priceRange: e.target.value as any || undefined })}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none text-sm"
                >
                  <option value="">Not specified</option>
                  <option value="$">$ - Budget</option>
                  <option value="$$">$$ - Moderate</option>
                  <option value="$$$">$$$ - Expensive</option>
                  <option value="$$$$">$$$$ - Very Expensive</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none text-sm resize-none"
                rows={2}
                placeholder="Share your experience..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
              >
                {editingIndex !== null ? 'Update' : 'Add'} Contact
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OnQuestPeopleInput;