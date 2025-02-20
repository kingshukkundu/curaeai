'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { DocumentTextIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';

interface MedicalRecord {
  id: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  createdAt: string;
  date: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export default function MedicalRecordsPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch('/api/medical-records');
        if (!response.ok) {
          throw new Error('Failed to fetch records');
        }
        const data = await response.json();
        setRecords(data);
      } catch (error) {
        console.error('Error fetching medical records:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, []);



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Medical Records</h1>
          <p className="mt-2 text-sm text-gray-700">
            {session?.user?.role === 'PATIENT'
              ? 'Your complete medical history and records.'
              : 'View and manage patient medical records.'}
          </p>
        </div>
        {session?.user?.role !== 'PATIENT' && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <DocumentPlusIcon className="h-5 w-5 mr-2" />
              Add Record
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col lg:flex-row lg:space-x-8">
        {/* Records List */}
        <div className="lg:w-1/2">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {records.map((record) => (
                <li key={record.id}>
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className={`block hover:bg-gray-50 w-full text-left ${
                      selectedRecord?.id === record.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {record.diagnosis}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {record.diagnosis.includes('AI Diagnosis') ? 'AI Diagnosis' : 'Doctor Visit'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Record Details */}
        <div className="mt-6 lg:mt-0 lg:w-1/2">
          {selectedRecord ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Record Details
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Patient</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {selectedRecord.user.name}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Doctor</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {selectedRecord.diagnosis.includes('AI Diagnosis') ? 'AI Diagnosis' : 'Doctor Visit'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {new Date(selectedRecord.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Diagnosis</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {selectedRecord.diagnosis}
                    </dd>
                  </div>
                  {selectedRecord.prescription !== 'N/A' && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Prescription</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        {selectedRecord.prescription}
                      </dd>
                    </div>
                  )}
                  {selectedRecord.notes && (
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 whitespace-pre-wrap">
                        {selectedRecord.notes}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No record selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a record from the list to view its details.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
