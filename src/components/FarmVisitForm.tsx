import React, { useState, useEffect } from 'react';
import { supabase, FarmVisit, CropStage } from '../lib/supabase';
import { Camera, Upload, CheckCircle } from 'lucide-react';

const CROP_ISSUES = ['Pests', 'Diseases', 'Nutrient Deficiency', 'Poor Germination', 'Water Stress'];
const LIVESTOCK_ISSUES = ['Illness', 'Parasites', 'Malnutrition', 'Poor Housing'];

export default function FarmVisitForm() {
  const [cropStages, setCropStages] = useState<CropStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [formData, setFormData] = useState<Partial<FarmVisit>>({
    farmer_name: '',
    farm_id: '',
    phone_number: '',
    village_location: '',
    gps_coordinates: '',
    farm_size_acres: 0,
    farm_type: 'Crop',
    visit_date: new Date().toISOString().split('T')[0],
    visit_type: 'Routine',
    officer_name: '',
    time_spent_hours: 0,
    main_crops: '',
    crop_stage: '',
    livestock_type: '',
    number_of_animals: 0,
    crop_issues: [],
    livestock_issues: [],
    photo_url: '',
    video_link: '',
    advice_given: '',
    follow_up_needed: false,
    proposed_follow_up_date: '',
    training_needed: false,
    referral_to_specialist: '',
    additional_notes: '',
  });

  useEffect(() => {
    fetchCropStages();
  }, []);

  const fetchCropStages = async () => {
    const { data, error } = await supabase
      .from('crop_stages')
      .select('*')
      .order('crop_name');

    if (!error && data) {
      setCropStages(data);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxGroup = (name: 'crop_issues' | 'livestock_issues', value: string) => {
    setFormData(prev => {
      const current = prev[name] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `farm-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('farm-visits')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      setUploadingPhoto(false);
      return;
    }

    const { data } = supabase.storage
      .from('farm-visits')
      .getPublicUrl(filePath);

    setFormData(prev => ({ ...prev, photo_url: data.publicUrl }));
    setUploadingPhoto(false);
  };

  const getAvailableStages = () => {
    if (!formData.main_crops) return [];
    const crop = cropStages.find(c => c.crop_name.toLowerCase() === formData.main_crops?.toLowerCase());
    return crop?.stages || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('farm_visits')
      .insert([formData as FarmVisit]);

    if (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        window.location.reload();
      }, 2000);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Form Submitted Successfully!</h2>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Farm Visit Report</h1>
            <p className="text-emerald-100 mt-2">Complete the form below to record your farm visit</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-emerald-200">
                1. Farmer Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Farmer Name *</label>
                  <input
                    type="text"
                    name="farmer_name"
                    value={formData.farmer_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Farm ID *</label>
                  <input
                    type="text"
                    name="farm_id"
                    value={formData.farm_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Village/Location *</label>
                  <input
                    type="text"
                    name="village_location"
                    value={formData.village_location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">GPS Coordinates</label>
                  <input
                    type="text"
                    name="gps_coordinates"
                    value={formData.gps_coordinates}
                    onChange={handleInputChange}
                    placeholder="e.g., 0.3476° N, 32.5825° E"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Farm Size (acres) *</label>
                  <input
                    type="number"
                    name="farm_size_acres"
                    value={formData.farm_size_acres}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Farm Type *</label>
                  <select
                    name="farm_type"
                    value={formData.farm_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                  >
                    <option value="Crop">Crop</option>
                    <option value="Livestock">Livestock</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-emerald-200">
                2. Visit Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Visit *</label>
                  <input
                    type="date"
                    name="visit_date"
                    value={formData.visit_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Visit Type *</label>
                  <select
                    name="visit_type"
                    value={formData.visit_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Officer Name *</label>
                  <input
                    type="text"
                    name="officer_name"
                    value={formData.officer_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time Spent (hours) *</label>
                  <input
                    type="number"
                    name="time_spent_hours"
                    value={formData.time_spent_hours}
                    onChange={handleInputChange}
                    step="0.5"
                    min="0"
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-emerald-200">
                3. Observations
              </h2>

              {(formData.farm_type === 'Crop' || formData.farm_type === 'Mixed') && (
                <div className="space-y-6 mb-6 p-6 bg-emerald-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-emerald-800">Crop Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Main Crops</label>
                      <input
                        type="text"
                        name="main_crops"
                        value={formData.main_crops}
                        onChange={handleInputChange}
                        placeholder="e.g., Onion, Rice"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Crop Stage</label>
                      <select
                        name="crop_stage"
                        value={formData.crop_stage}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                      >
                        <option value="">Select stage</option>
                        {getAvailableStages().map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Crop Issues</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {CROP_ISSUES.map(issue => (
                        <label key={issue} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.crop_issues?.includes(issue)}
                            onChange={() => handleCheckboxGroup('crop_issues', issue)}
                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">{issue}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(formData.farm_type === 'Livestock' || formData.farm_type === 'Mixed') && (
                <div className="space-y-6 mb-6 p-6 bg-cyan-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-cyan-800">Livestock Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Livestock Type</label>
                      <input
                        type="text"
                        name="livestock_type"
                        value={formData.livestock_type}
                        onChange={handleInputChange}
                        placeholder="e.g., Cattle, Goats, Poultry"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-cyan-500 focus:ring focus:ring-cyan-200 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Animals</label>
                      <input
                        type="number"
                        name="number_of_animals"
                        value={formData.number_of_animals}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-cyan-500 focus:ring focus:ring-cyan-200 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Livestock Issues</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {LIVESTOCK_ISSUES.map(issue => (
                        <label key={issue} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.livestock_issues?.includes(issue)}
                            onChange={() => handleCheckboxGroup('livestock_issues', issue)}
                            className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
                          />
                          <span className="text-sm text-gray-700">{issue}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Photo Upload</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 transition"
                    >
                      {uploadingPhoto ? (
                        <span className="text-gray-600">Uploading...</span>
                      ) : formData.photo_url ? (
                        <span className="text-emerald-600 flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Photo Uploaded
                        </span>
                      ) : (
                        <span className="text-gray-600 flex items-center">
                          <Camera className="w-5 h-5 mr-2" />
                          Choose Photo
                        </span>
                      )}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Video Link</label>
                  <input
                    type="url"
                    name="video_link"
                    value={formData.video_link}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-emerald-200">
                4. Recommendations
              </h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Advice Given *</label>
                <textarea
                  name="advice_given"
                  value={formData.advice_given}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                  placeholder="Enter detailed recommendations and advice provided to the farmer..."
                />
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-emerald-200">
                5. Follow-up
              </h2>
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="follow_up_needed"
                    checked={formData.follow_up_needed}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <label className="text-sm font-semibold text-gray-700">Follow-up Needed</label>
                </div>

                {formData.follow_up_needed && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Proposed Follow-up Date</label>
                    <input
                      type="date"
                      name="proposed_follow_up_date"
                      value={formData.proposed_follow_up_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="training_needed"
                    checked={formData.training_needed}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <label className="text-sm font-semibold text-gray-700">Training Needed</label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Referral to Vet/Agronomist</label>
                  <input
                    type="text"
                    name="referral_to_specialist"
                    value={formData.referral_to_specialist}
                    onChange={handleInputChange}
                    placeholder="Enter specialist details if referral needed"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    name="additional_notes"
                    value={formData.additional_notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition"
                    placeholder="Any additional observations or notes..."
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? 'Submitting...' : 'Submit Farm Visit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
