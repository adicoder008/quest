// components/quest/OnQuestPeopleSection.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Phone, Mail, Globe, MessageCircle, Star, MapPin, X, Edit2, Trash2, Save, ExternalLink } from 'lucide-react';
import { Quest, OnQuestPerson } from '@/app/types';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface OnQuestPeopleSectionProps {
  quest: Quest;
  userId: string;
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

const serviceTypeColors: Record<string, string> = {
  food: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  accommodation: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  transport: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  fun: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  emergency: 'bg-red-500/20 text-red-400 border-red-500/30',
  police: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  guide: 'bg-green-500/20 text-green-400 border-green-500/30',
  other: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};

const OnQuestPeopleSection: React.FC<OnQuestPeopleSectionProps> = ({ quest, userId }) => {
  const [people, setPeople] = useState<OnQuestPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<OnQuestPerson | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const isOwner = quest.members?.[userId] === 'owner';
  const canEdit = isOwner || quest.members?.[userId] === 'editor';

  useEffect(() => {
    loadPeople();
  }, [quest.id]);

  const loadPeople = async () => {
    try {
      const peopleRef = collection(db, 'questPeople');
      const q = query(peopleRef, where('questId', '==', quest.id));
      const snapshot = await getDocs(q);

      const loadedPeople = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OnQuestPerson[];

      setPeople(loadedPeople);
    } catch (error) {
      console.error('Error loading people:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (personId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      await deleteDoc(doc(db, 'questPeople', personId));
      setPeople(people.filter(p => p.id !== personId));
    } catch (error) {
      console.error('Error deleting person:', error);
      alert('Failed to delete contact');
    }
  };

  const filteredPeople = selectedFilter === 'all'
    ? people
    : people.filter(p => p.serviceType === selectedFilter);

  const serviceTypeCounts = people.reduce((acc, person) => {
    acc[person.serviceType] = (acc[person.serviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border-2 border-gray-700 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              📇 OnQuest People
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Your trusted contacts from this journey
            </p>
          </div>
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
            >
              <Plus size={18} />
              Add Contact
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedFilter === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
          >
            All ({people.length})
          </button>
          {Object.entries(serviceTypeIcons).map(([type, icon]) => {
            const count = serviceTypeCounts[type] || 0;
            if (count === 0) return null;

            return (
              <button
                key={type}
                onClick={() => setSelectedFilter(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedFilter === type
                    ? serviceTypeColors[type]
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                {icon} {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* People List */}
      <div className="p-6">
        {filteredPeople.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-white mb-2">No contacts yet</h3>
            <p className="text-gray-400 mb-4">
              {canEdit
                ? 'Add people you met during your journey!'
                : 'The quest owner hasn\'t added any contacts yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPeople.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                canEdit={canEdit}
                onEdit={() => setEditingPerson(person)}
                onDelete={() => handleDelete(person.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingPerson) && (
        <PersonFormModal
          questId={quest.id}
          person={editingPerson}
          onClose={() => {
            setShowAddModal(false);
            setEditingPerson(null);
          }}
          onSave={() => {
            loadPeople();
            setShowAddModal(false);
            setEditingPerson(null);
          }}
        />
      )}
    </div>
  );
};

// Person Card Component
const PersonCard: React.FC<{
  person: OnQuestPerson;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ person, canEdit, onEdit, onDelete }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <div className={`relative bg-gray-800 rounded-lg border-2 ${serviceTypeColors[person.serviceType]} p-4 hover:shadow-lg transition-all`}>
      {/* Service Type Badge */}
      <div className="absolute -top-2 -right-2">
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${serviceTypeColors[person.serviceType]} border-2`}>
          {serviceTypeIcons[person.serviceType]} {person.serviceType.toUpperCase()}
        </div>
      </div>

      {/* Header */}
      <div className="mb-3">
        <h3 className="text-lg font-bold text-white mb-1 pr-16">{person.name}</h3>
        <p className="text-sm text-gray-400">{person.category}</p>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.floor(person.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
            />
          ))}
        </div>
        <span className="text-sm text-gray-400">
          {person.rating.toFixed(1)} ({person.reviewCount} reviews)
        </span>
      </div>

      {/* Location */}
      {person.location && (
        <div className="flex items-start gap-2 text-sm text-gray-300 mb-3">
          <MapPin size={16} className="flex-shrink-0 mt-0.5 text-orange-400" />
          <span className="line-clamp-2">{person.location.name}</span>
        </div>
      )}

      {/* Description */}
      {person.description && (
        <div className="mb-3">
          <p className={`text-sm text-gray-400 ${!showFullDescription && 'line-clamp-2'}`}>
            {person.description}
          </p>
          {person.description.length > 100 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-xs text-orange-400 hover:text-orange-300 mt-1"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-2 mb-3">
        {person.contact.phone && (
          <a
            href={`tel:${person.contact.phone}`}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            <Phone size={14} />
            {person.contact.phone}
          </a>
        )}
        {person.contact.email && (
          <a
            href={`mailto:${person.contact.email}`}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            <Mail size={14} />
            {person.contact.email}
          </a>
        )}
        {person.contact.whatsapp && (
          <a
            href={`https://wa.me/${person.contact.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300"
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>
        )}
        {person.contact.website && (
          <a
            href={person.contact.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            <Globe size={14} />
            Website
          </a>
        )}
      </div>

      {/* Price Range */}
      {person.priceRange && (
        <div className="mb-3">
          <span className="text-sm text-green-400 font-medium">{person.priceRange}</span>
        </div>
      )}

      {/* Tags */}
      {person.tags && person.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {person.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-700 text-xs text-gray-300 rounded">
              {tag}
            </span>
          ))}
          {person.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-700 text-xs text-gray-400 rounded">
              +{person.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Edit/Delete Buttons */}
      {canEdit && (
        <div className="flex gap-2 pt-3 border-t border-gray-700">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
          >
            <Edit2 size={14} />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// Person Form Modal Component
const PersonFormModal: React.FC<{
  questId: string;
  person: OnQuestPerson | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ questId, person, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<OnQuestPerson>>({
    name: person?.name || '',
    serviceType: person?.serviceType || 'food',
    category: person?.category || '',
    location: person?.location || { name: '', coordinates: { lat: 0, lng: 0 } },
    contact: person?.contact || { phone: '', email: '', website: '', whatsapp: '' },
    rating: person?.rating || 4.0,
    reviewCount: person?.reviewCount || 0,
    priceRange: person?.priceRange || undefined,
    description: person?.description || '',
    tags: person?.tags || [],
    verified: person?.verified || false,
    featured: person?.featured || false,
  });
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      alert('Please enter a name');
      return;
    }

    setSaving(true);
    try {
      const personData = {
        ...formData,
        questId,
        commissionRate: 0,
        photos: [],
        updatedAt: new Date().toISOString(),
      };

      if (person?.id) {
        // Update existing
        await updateDoc(doc(db, 'questPeople', person.id), personData);
      } else {
        // Create new
        await addDoc(collection(db, 'questPeople'), {
          ...personData,
          createdAt: new Date().toISOString(),
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving person:', error);
      alert('Failed to save contact');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || []
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full border border-gray-700 my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold text-white">
            {person ? 'Edit Contact' : 'Add New Contact'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              placeholder="e.g., Raj's Restaurant"
              required
            />
          </div>

          {/* Service Type & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Service Type *</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as any })}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              >
                {Object.entries(serviceTypeIcons).map(([type, icon]) => (
                  <option key={type} value={type}>
                    {icon} {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
                placeholder="e.g., Indian Restaurant"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Location</label>
            <input
              type="text"
              value={formData.location?.name}
              onChange={(e) => setFormData({
                ...formData,
                location: { ...formData.location!, name: e.target.value }
              })}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              placeholder="e.g., MG Road, Bangalore"
            />
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Contact Information</h4>

            <input
              type="tel"
              value={formData.contact?.phone}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact!, phone: e.target.value }
              })}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              placeholder="Phone Number"
            />

            <input
              type="email"
              value={formData.contact?.email}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact!, email: e.target.value }
              })}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              placeholder="Email"
            />

            <input
              type="text"
              value={formData.contact?.whatsapp}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact!, whatsapp: e.target.value }
              })}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              placeholder="WhatsApp Number"
            />

            <input
              type="url"
              value={formData.contact?.website}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact!, website: e.target.value }
              })}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              placeholder="Website URL"
            />
          </div>

          {/* Rating & Reviews */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Your Rating</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Price Range</label>
              <select
                value={formData.priceRange || ''}
                onChange={(e) => setFormData({ ...formData, priceRange: e.target.value as any || undefined })}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
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
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              rows={3}
              placeholder="Share your experience..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-700 text-sm text-white rounded-full flex items-center gap-2">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : person ? 'Update Contact' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnQuestPeopleSection;