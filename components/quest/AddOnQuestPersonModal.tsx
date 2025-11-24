'use client'
import React, { useState } from 'react';
import { X, Phone, Mail, Globe, MessageCircle, MapPin, Clock, DollarSign, Tag } from 'lucide-react';
import LocationSearchModal from './LocationSearchModal';

interface AddOnQuestPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: OnQuestPersonData) => Promise<void>;
}

export interface OnQuestPersonData {
  name: string;
  serviceType: 'food' | 'accommodation' | 'transport' | 'fun' | 'emergency' | 'police' | 'guide' | 'other';
  category: string;
  location: {
    name: string;
    coordinates: { lat: number; lng: number };
    placeId?: string;
  };
  contact: {
    phone: string;
    email?: string;
    website?: string;
    whatsapp?: string;
  };
  description: string;
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  tags?: string[];
  operatingHours?: {
    [day: string]: { open: string; close: string } | 'closed';
  };
  personalNotes?: string;
}

const serviceTypes = [
  { value: 'food', label: '🍽️ Food & Dining', color: 'orange' },
  { value: 'accommodation', label: '🏨 Accommodation', color: 'blue' },
  { value: 'transport', label: '🚗 Transport', color: 'purple' },
  { value: 'fun', label: '🎉 Activities & Fun', color: 'pink' },
  { value: 'guide', label: '🗺️ Guide/Tour', color: 'green' },
  { value: 'emergency', label: '🚑 Emergency Services', color: 'red' },
  { value: 'police', label: '👮 Police/Security', color: 'indigo' },
  { value: 'other', label: '📋 Other', color: 'gray' },
];

const categoryOptions: { [key: string]: string[] } = {
  food: ['Restaurant', 'Café', 'Street Food', 'Bakery', 'Bar/Pub', 'Fine Dining', 'Food Delivery'],
  accommodation: ['Hotel', 'Hostel', 'Resort', 'Airbnb', 'Guesthouse', 'Homestay', 'Camping'],
  transport: ['Taxi', 'Car Rental', 'Bike Rental', 'Bus Service', 'Train', 'Airport Shuttle', 'Private Driver'],
  fun: ['Adventure Sports', 'Museum', 'Theme Park', 'Tour Operator', 'Water Sports', 'Spa', 'Shopping'],
  guide: ['Tour Guide', 'Local Expert', 'Translator', 'Photography Guide'],
  emergency: ['Hospital', 'Clinic', 'Pharmacy', 'Ambulance', 'Fire Station'],
  police: ['Police Station', 'Tourist Police', 'Security Service'],
  other: ['General Service', 'Information Center', 'Embassy', 'Currency Exchange'],
};

const AddOnQuestPersonModal: React.FC<AddOnQuestPersonModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [loading, setLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [formData, setFormData] = useState<OnQuestPersonData>({
    name: '',
    serviceType: 'food',
    category: '',
    location: {
      name: '',
      coordinates: { lat: 0, lng: 0 },
    },
    contact: {
      phone: '',
    },
    description: '',
    personalNotes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.contact.phone || !formData.location.name) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await onAdd(formData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        serviceType: 'food',
        category: '',
        location: {
          name: '',
          coordinates: { lat: 0, lng: 0 },
        },
        contact: {
          phone: '',
        },
        description: '',
        personalNotes: '',
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedServiceType = serviceTypes.find(st => st.value === formData.serviceType);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Add Contact</h2>
            <p className="text-sm text-gray-400 mt-1">Save helpful contacts from your journey</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Service Type */}
          <div>
            <label className="block text-white font-medium mb-3">
              Service Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {serviceTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, serviceType: type.value as any, category: '' });
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    formData.serviceType === type.value
                      ? `border-${type.color}-500 bg-${type.color}-500/20`
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <span className="text-sm font-medium text-white">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-white font-medium mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
            >
              <option value="">Select category...</option>
              {categoryOptions[formData.serviceType]?.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-white font-medium mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Mario's Pizza House"
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-white font-medium mb-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              Location <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className={`w-full bg-gray-800 text-left text-white px-4 py-3 rounded-lg border ${
                formData.location.name
                  ? 'border-green-500'
                  : 'border-gray-700'
              } hover:border-orange-500 focus:border-orange-500 focus:outline-none transition-colors`}
            >
              {formData.location.name || 'Click to search location...'}
            </button>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Contact Information</h3>
            
            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                <Phone className="w-4 h-4" />
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.contact.phone}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contact: { ...formData.contact, phone: e.target.value }
                })}
                placeholder="+91 98765 43210"
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </label>
              <input
                type="tel"
                value={formData.contact.whatsapp || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contact: { ...formData.contact, whatsapp: e.target.value }
                })}
                placeholder="+91 98765 43210"
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={formData.contact.email || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contact: { ...formData.contact, email: e.target.value }
                })}
                placeholder="contact@example.com"
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                <Globe className="w-4 h-4" />
                Website
              </label>
              <input
                type="url"
                value={formData.contact.website || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contact: { ...formData.contact, website: e.target.value }
                })}
                placeholder="https://example.com"
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="flex items-center gap-2 text-white font-medium mb-2">
              <DollarSign className="w-4 h-4" />
              Price Range
            </label>
            <div className="flex gap-2">
              {['$', '$$', '$$$', '$$$$'].map((price) => (
                <button
                  key={price}
                  type="button"
                  onClick={() => setFormData({ ...formData, priceRange: price as any })}
                  className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                    formData.priceRange === price
                      ? 'border-green-500 bg-green-500/20 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {price}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us about this place..."
              rows={3}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none resize-none"
            />
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block text-white font-medium mb-2">
              Personal Notes (Private)
            </label>
            <textarea
              value={formData.personalNotes}
              onChange={(e) => setFormData({ ...formData, personalNotes: e.target.value })}
              placeholder="Your private notes about this contact..."
              rows={2}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">These notes are only visible to you</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-600 text-white rounded-xl hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.contact.phone || !formData.location.name}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>

      <LocationSearchModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelect={(location) => {
          setFormData({ ...formData, location });
          setShowLocationModal(false);
        }}
        initialValue={formData.location.name}
      />
    </div>
  );
};

export default AddOnQuestPersonModal;