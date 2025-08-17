'use client'
import React, { useState, useEffect } from 'react';

const Page5 = () => {
  const [preferences, setPreferences] = useState([]); // List of all preferences
  const [selectedPreferences, setSelectedPreferences] = useState([]); // Selected preferences
  const [showAddInterestModal, setShowAddInterestModal] = useState(false); // Modal state
  const [newInterest, setNewInterest] = useState(''); // New interest input
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch destination from localStorage
  const destination = localStorage.getItem('to');

  // Fetch interests based on the destination
  useEffect(() => {
    const fetchInterests = async () => {
      if (!destination) {
        setError('Destination not found in localStorage');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/suggestions/${destination}`);
        if (!response.ok) {
          throw new Error('Failed to fetch interests');
        }
        const data = await response.json();
        setPreferences(data); // Set the fetched interests
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, [destination]); // Add destination to dependency array

  // Handle preference selection
  const handlePreferenceClick = (preference) => {
    const isSelected = selectedPreferences.includes(preference);
    let updatedPreferences;

    if (isSelected) {
      // Remove preference if already selected
      updatedPreferences = selectedPreferences.filter((item) => item !== preference);
    } else {
      // Add preference if not selected
      updatedPreferences = [...selectedPreferences, preference];
    }

    setSelectedPreferences(updatedPreferences);
    localStorage.setItem('selectedPreferences', JSON.stringify(updatedPreferences)); // Save to localStorage
  };

  // Handle adding a new interest
  const handleAddInterest = () => {
    if (newInterest.trim() !== '') {
      const newInterestsArray = newInterest
        .split(',')
        .map((interest) => interest.trim())
        .filter((interest) => interest !== ''); // Remove empty entries
      const updatedPreferences = [...preferences, ...newInterestsArray];
      setPreferences(updatedPreferences);
      localStorage.setItem('preferences', JSON.stringify(updatedPreferences)); // Save to localStorage
      setNewInterest('');
      setShowAddInterestModal(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading interests...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="preferences">
      <div className="title">
        <h1>Tell us what you’re interested in</h1>
        <p>Select all that applies</p>
      </div>

      <div className="preferences-list">
        {preferences.map((preference, index) => (
          <div
            key={index}
            className={`preference-item ${
              selectedPreferences.includes(preference) ? 'selected' : ''
            }`}
            onClick={() => handlePreferenceClick(preference)}
          >
            {preference}
          </div>
        ))}
      </div>

      {/* Add Interest Button */}
        <div className="add-interest-button" style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setShowAddInterestModal(true)}>
            Add Interest <span>+</span>
          </button>
        </div>

        {/* Add Interest Modal */}
      {showAddInterestModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add other interests</h2>
              <button onClick={() => setShowAddInterestModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Enter additional interests</p>
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="e.g., Hiking, Museums, Food"
              />
              <p className="hint">Separate each entry with a comma</p>
            </div>
            <div className="modal-footer">
              <button onClick={handleAddInterest}>Add</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .preferences {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .title {
          text-align: center;
          margin-bottom: 20px;
        }

        .title h1 {
          font-size: 2rem;
          font-weight: 600;
          color: #000;
        }

        .title p {
          font-size: 1rem;
          color: #8b8a8f;
        }

        .preferences-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }

        .preference-item {
          border-radius: 32px;
          background-color: #f8f9fa;
          border: 1px solid #c5c4c7;
          padding: 10px 20px;
          font-size: 1rem;
          color: #8b8a8f;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .preference-item:hover {
          background-color: #eee;
          border-color: #c5c4c7;
        }

        .preference-item.selected {
          background-color: #fa841f;
          color: #000;
          border: 1px solid #fa841f;
        }

        .add-interest-button {
          text-align: center;
          margin-top: 20px;
        }

        .add-interest-button button {
          background-color: #fff;
          border: 1px solid #000;
          border-radius: 32px;
          padding: 10px 20px;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .add-interest-button button span {
          font-size: 1.2rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal {
          background-color: #fff;
          border-radius: 12px;
          padding: 20px;
          width: 90%;
          max-width: 400px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .modal-header button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .modal-body p {
          font-size: 1rem;
          color: #8b8a8f;
          margin-bottom: 10px;
        }

        .modal-body input {
          width: 100%;
          padding: 10px;
          border: 1px solid #c5c4c7;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .modal-body .hint {
          font-size: 0.875rem;
          color: #8b8a8f;
        }

        .modal-footer {
          text-align: right;
        }

        .modal-footer button {
          background-color: #fa841f;
          color: #fff;
          border: none;
          border-radius: 32px;
          padding: 10px 20px;
          font-size: 1rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Page5;