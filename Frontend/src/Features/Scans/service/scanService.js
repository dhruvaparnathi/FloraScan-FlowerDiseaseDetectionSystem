/**
 * Scan Telemetry & Prediction Service
 * ===================================
 * Manages authorized image upload to Flask ML + ImageKit,
 * and fetching operator diagnostic history.
 */

const API_BASE = 'http://localhost:5000';

export const scanService = {
  async uploadAndDiagnose(file, token) {
    if (!token) {
      throw new Error('Authentication required to run botanical neural diagnosis.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/image/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Image diagnosis failed.');
    }

    return data;
  },

  async getHistory(token) {
    if (!token) return [];

    const response = await fetch(`${API_BASE}/api/scans/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to retrieve scan history.');
    }

    return data.scans || [];
  },
};

export default scanService;
