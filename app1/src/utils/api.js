const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchPatientRecords(walletAddress) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${walletAddress}/records`);
    if (!response.ok) throw new Error('Failed to fetch records');
    return await response.json();
  } catch (err) {
    console.error('Error fetching patient records:', err);
    return [];
  }
}

export async function fetchPatientAccessList(walletAddress) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${walletAddress}/access`);
    if (!response.ok) throw new Error('Failed to fetch access list');
    return await response.json();
  } catch (err) {
    console.error('Error fetching access list:', err);
    return [];
  }
}

export async function grantDoctorAccess(patientWallet, doctorWallet) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientWallet}/grant-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorWallet })
    });
    if (!response.ok) throw new Error('Failed to grant access');
    return await response.json();
  } catch (err) {
    console.error('Error granting access:', err);
    throw err;
  }
}

export async function revokeDoctorAccess(patientWallet, doctorWallet) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientWallet}/revoke-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorWallet })
    });
    if (!response.ok) throw new Error('Failed to revoke access');
    return await response.json();
  } catch (err) {
    console.error('Error revoking access:', err);
    throw err;
  }
}

export async function addMedicalRecord(patientWallet, record) {
  try {
    const response = await fetch(`${API_BASE_URL}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientWallet,
        ...record
      })
    });
    if (!response.ok) throw new Error('Failed to add record');
    return await response.json();
  } catch (err) {
    console.error('Error adding record:', err);
    throw err;
  }
}

// Doctor endpoints
export async function fetchDoctorPatients(walletAddress) {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/${walletAddress}/patients`);
    if (!response.ok) throw new Error('Failed to fetch doctor\'s patients');
    return await response.json();
  } catch (err) {
    console.error('Error fetching doctor patients:', err);
    return [];
  }
}

export async function fetchPatientRecordsForDoctor(doctorWallet, patientWallet) {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/${doctorWallet}/patient/${patientWallet}/records`);
    if (!response.ok) throw new Error('Failed to fetch patient records');
    return await response.json();
  } catch (err) {
    console.error('Error fetching patient records for doctor:', err);
    return [];
  }
}

export async function addDiagnosis(doctorWallet, recordId, diagnosis) {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/${doctorWallet}/records/${recordId}/diagnosis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnosis })
    });
    if (!response.ok) throw new Error('Failed to add diagnosis');
    return await response.json();
  } catch (err) {
    console.error('Error adding diagnosis:', err);
    throw err;
  }
}

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (err) {
    return false;
  }
}

export async function registerPatient(walletAddress) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/register/${walletAddress}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to register patient');
    return await response.json();
  } catch (err) {
    console.error('Error registering patient:', err);
    throw err;
  }
}

export async function createSampleRecords(walletAddress) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${walletAddress}/create-samples`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to create sample records');
    return await response.json();
  } catch (err) {
    console.error('Error creating sample records:', err);
    throw err;
  }
}
