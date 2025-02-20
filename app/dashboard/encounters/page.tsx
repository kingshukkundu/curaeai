'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { UserPlusIcon, MagnifyingGlassIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Patient {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  dateOfBirth: string;
}

interface Appointment {
  id: string;
  datetime: string;
  patient: Patient;
}

interface Test {
  name: string;
  description?: string;
}

interface Referral {
  doctorId: string;
  reason: string;
  notes?: string;
}

export default function EncountersPage() {
  const { data: session } = useSession();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [tests, setTests] = useState<Test[]>([]);
  const [newTest, setNewTest] = useState({ name: '', description: '' });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [newReferral, setNewReferral] = useState({ doctorId: '', reason: '', notes: '' });
  interface Doctor {
    id: string;
    name: string;
  }

  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    // Fetch today's appointments
    const fetchTodayAppointments = async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/encounters?date=${today}`);
      if (response.ok) {
        const data = await response.json();
        setTodayAppointments(data.appointments || []);
      }
    };

    // Fetch available doctors for referrals
    const fetchDoctors = async () => {
      const response = await fetch('/api/doctors');
      if (response.ok) {
        const data = await response.json();
        setAvailableDoctors(data.filter((d: Doctor) => d.id !== session?.user?.id));
      }
    };

    if (session?.user?.role === 'DOCTOR') {
      fetchTodayAppointments();
      fetchDoctors();
    }
  }, [session]);

  const searchPatients = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/encounters?patientId=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.patients || []);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTest = () => {
    if (newTest.name) {
      setTests([...tests, newTest]);
      setNewTest({ name: '', description: '' });
    }
  };

  const addReferral = () => {
    if (newReferral.doctorId && newReferral.reason) {
      setReferrals([...referrals, newReferral]);
      setNewReferral({ doctorId: '', reason: '', notes: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      const response = await fetch('/api/encounters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedPatient.user.id,
          symptoms,
          diagnosis,
          prescription,
          notes,
          tests,
          referrals,
        }),
      });

      if (response.ok) {
        // Reset form
        setSelectedPatient(null);
        setSymptoms('');
        setDiagnosis('');
        setPrescription('');
        setNotes('');
        setTests([]);
        setReferrals([]);
        alert('Encounter recorded successfully!');
      } else {
        throw new Error('Failed to save encounter');
      }
    } catch (error) {
      console.error('Error saving encounter:', error);
      alert('Failed to save encounter. Please try again.');
    }
  };

  if (session?.user?.role !== 'DOCTOR') {
    return (
      <div className="p-4">
        <p>Only doctors can access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">New Encounter</h1>
        <p className="mt-2 text-sm text-gray-700">
          Create a new patient encounter by selecting a patient and recording their visit details.
        </p>
      </div>

      {/* Patient Selection */}
      {!selectedPatient && (
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Search Patients */}
            <div className="bg-white shadow sm:rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Search Patients</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or ID"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                />
                <button
                  onClick={searchPatients}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  Search
                </button>
              </div>
              {loading ? (
                <div className="animate-pulse">Loading...</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {searchResults.map((patient) => (
                    <li
                      key={patient.id}
                      className="py-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {patient.user.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{patient.user.email}</p>
                        </div>
                        <UserPlusIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Today's Appointments */}
            <div className="bg-white shadow sm:rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Today&apos;s Appointments</h2>
              <ul className="divide-y divide-gray-200">
                {todayAppointments.map((appointment) => (
                  <li
                    key={appointment.id}
                    className="py-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedPatient(appointment.patient)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {appointment.patient.user.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 inline mr-1" />
                          {new Date(appointment.datetime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
                {todayAppointments.length === 0 && (
                  <li className="py-4 text-sm text-gray-500">No appointments scheduled for today&apos;s date</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Encounter Form */}
      {selectedPatient && (
        <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              Encounter with {selectedPatient.user.name}
            </h2>
            <button
              type="button"
              onClick={() => setSelectedPatient(null)}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Change patient
            </button>
          </div>

          {/* Symptoms */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptoms
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Describe the patient's symptoms..."
            />
          </div>

          {/* Diagnosis */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnosis
            </label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter your diagnosis..."
            />
          </div>

          {/* Prescription */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prescription
            </label>
            <textarea
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter prescription details..."
            />
          </div>

          {/* Tests */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Tests
            </label>
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="flex-1">{test.name}</span>
                  <button
                    type="button"
                    onClick={() => setTests(tests.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                  placeholder="Test name"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                />
                <input
                  type="text"
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  placeholder="Description (optional)"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                />
                <button
                  type="button"
                  onClick={addTest}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Test
                </button>
              </div>
            </div>
          </div>

          {/* Referrals */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Create Referrals
            </label>
            <div className="space-y-4">
              {referrals.map((referral, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="flex-1">
                    {availableDoctors.find(d => d.id === referral.doctorId)?.name} - {referral.reason}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReferrals(referrals.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="space-y-2">
                <select
                  value={newReferral.doctorId}
                  onChange={(e) => setNewReferral({ ...newReferral, doctorId: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">Select a doctor</option>
                  {availableDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newReferral.reason}
                  onChange={(e) => setNewReferral({ ...newReferral, reason: e.target.value })}
                  placeholder="Reason for referral"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
                <textarea
                  value={newReferral.notes}
                  onChange={(e) => setNewReferral({ ...newReferral, notes: e.target.value })}
                  placeholder="Additional notes (optional)"
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
                <button
                  type="button"
                  onClick={addReferral}
                  className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Referral
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Any additional notes..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Save Encounter
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
