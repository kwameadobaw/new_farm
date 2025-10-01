import React, { useState, useEffect } from 'react';
import { supabase, FarmVisit } from '../lib/supabase';
import { Search, Filter, Download, Trash2, Eye, EyeOff, LogOut } from 'lucide-react';
import { generatePDF } from '../lib/pdfGenerator';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [visits, setVisits] = useState<FarmVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<FarmVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchVisits();
  }, []);

  useEffect(() => {
    filterVisits();
  }, [visits, searchTerm, filterType]);

  const fetchVisits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('farm_visits')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVisits(data);
    }
    setLoading(false);
  };

  const filterVisits = () => {
    let filtered = [...visits];

    if (filterType !== 'all') {
      filtered = filtered.filter(visit => visit.visit_type === filterType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(visit =>
        visit.farmer_name.toLowerCase().includes(term) ||
        visit.farm_id.toLowerCase().includes(term) ||
        visit.village_location.toLowerCase().includes(term) ||
        visit.officer_name.toLowerCase().includes(term)
      );
    }

    setFilteredVisits(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const { error } = await supabase
      .from('farm_visits')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchVisits();
    } else {
      alert('Error deleting entry. Please try again.');
    }
  };

  const handleDownloadPDF = async (visit: FarmVisit) => {
    await generatePDF(visit);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-blue-100 mt-1">Farm Visit Management System</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by farmer name, farm ID, location, or officer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition appearance-none"
              >
                <option value="all">All Visit Types</option>
                <option value="Routine">Routine</option>
                <option value="Emergency">Emergency</option>
                <option value="Follow-up">Follow-up</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Total Entries: {filteredVisits.length}</span>
            {filterType !== 'all' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                Filtered by: {filterType}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading entries...</p>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <p className="text-gray-500 text-lg">No entries found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVisits.map((visit) => (
              <div key={visit.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{visit.farmer_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          visit.visit_type === 'Routine' ? 'bg-green-100 text-green-700' :
                          visit.visit_type === 'Emergency' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {visit.visit_type}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                        <div>
                          <span className="font-semibold">Farm ID:</span> {visit.farm_id}
                        </div>
                        <div>
                          <span className="font-semibold">Location:</span> {visit.village_location}
                        </div>
                        <div>
                          <span className="font-semibold">Visit Date:</span> {formatDate(visit.visit_date)}
                        </div>
                        <div>
                          <span className="font-semibold">Officer:</span> {visit.officer_name}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => toggleExpand(visit.id!)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title={expandedId === visit.id ? 'Hide details' : 'Show details'}
                      >
                        {expandedId === visit.id ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(visit)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Download PDF"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(visit.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete entry"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {expandedId === visit.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Farmer Details</h4>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Phone:</span> {visit.phone_number}</p>
                            <p><span className="font-medium">GPS:</span> {visit.gps_coordinates || 'N/A'}</p>
                            <p><span className="font-medium">Farm Size:</span> {visit.farm_size_acres} acres</p>
                            <p><span className="font-medium">Farm Type:</span> {visit.farm_type}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Visit Information</h4>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Time Spent:</span> {visit.time_spent_hours} hours</p>
                            <p><span className="font-medium">Date:</span> {formatDate(visit.visit_date)}</p>
                            <p><span className="font-medium">Created:</span> {formatDate(visit.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      {(visit.farm_type === 'Crop' || visit.farm_type === 'Mixed') && visit.main_crops && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Crop Information</h4>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Main Crops:</span> {visit.main_crops}</p>
                            <p><span className="font-medium">Crop Stage:</span> {visit.crop_stage || 'N/A'}</p>
                            {visit.crop_issues && visit.crop_issues.length > 0 && (
                              <p>
                                <span className="font-medium">Crop Issues:</span>{' '}
                                {visit.crop_issues.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {(visit.farm_type === 'Livestock' || visit.farm_type === 'Mixed') && visit.livestock_type && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Livestock Information</h4>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Livestock Type:</span> {visit.livestock_type}</p>
                            <p><span className="font-medium">Number of Animals:</span> {visit.number_of_animals || 0}</p>
                            {visit.livestock_issues && visit.livestock_issues.length > 0 && (
                              <p>
                                <span className="font-medium">Livestock Issues:</span>{' '}
                                {visit.livestock_issues.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {visit.photo_urls && visit.photo_urls.length > 0 ? (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Photos ({visit.photo_urls.length})</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {visit.photo_urls.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Farm visit ${index + 1}`}
                                className="max-w-full rounded-lg shadow-md"
                              />
                            ))}
                          </div>
                        </div>
                      ) : visit.photo_url ? (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Photo</h4>
                          <img
                            src={visit.photo_url}
                            alt="Farm visit"
                            className="max-w-md rounded-lg shadow-md"
                          />
                        </div>
                      ) : null}

                      {visit.video_link && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Video</h4>
                          <a
                            href={visit.video_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {visit.video_link}
                          </a>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Recommendations</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{visit.advice_given}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Follow-up</h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Follow-up Needed:</span>{' '}
                            <span className={visit.follow_up_needed ? 'text-orange-600 font-semibold' : ''}>
                              {visit.follow_up_needed ? 'Yes' : 'No'}
                            </span>
                          </p>
                          {visit.follow_up_needed && visit.proposed_follow_up_date && (
                            <p>
                              <span className="font-medium">Proposed Date:</span>{' '}
                              {formatDate(visit.proposed_follow_up_date)}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Routine Check:</span>{' '}
                            <span className={visit.routine_check ? 'text-orange-600 font-semibold' : ''}>
                              {visit.routine_check ? 'Yes' : 'No'}
                            </span>
                          </p>
                          {visit.routine_check && visit.routine_check_date && (
                            <p>
                              <span className="font-medium">Routine Check Date:</span>{' '}
                              {formatDate(visit.routine_check_date)}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Training Needed:</span>{' '}
                            {visit.training_needed ? 'Yes' : 'No'}
                          </p>
                          {visit.referral_to_specialist && (
                            <p>
                              <span className="font-medium">Referral:</span> {visit.referral_to_specialist}
                            </p>
                          )}
                          {visit.additional_notes && (
                            <p>
                              <span className="font-medium">Additional Notes:</span>{' '}
                              {visit.additional_notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
