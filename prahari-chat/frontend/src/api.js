/**
 * API client for PRAHARI Chat Backend
 */

export async function getServiceStatus() {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch status:', err);
    return { connected: false, error: err.message };
  }
}

export async function sendChatMessage({ message, history = [], sleep_hours = null, fatigue_level = null, duty_hours = null, mood = null }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history,
      sleep_hours: sleep_hours !== null ? Number(sleep_hours) : null,
      fatigue_level: fatigue_level !== null ? Number(fatigue_level) : null,
      duty_hours: duty_hours !== null ? Number(duty_hours) : null,
      mood: mood !== null ? Number(mood) : null,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Network response error' }));
    throw new Error(errorData.detail || `Server error: ${res.status}`);
  }

  return await res.json();
}

export async function assessStress({ text = '', sleep_hours = null, fatigue_level = null, duty_hours = null, mood = null }) {
  const res = await fetch('/api/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      sleep_hours: sleep_hours !== null ? Number(sleep_hours) : null,
      fatigue_level: fatigue_level !== null ? Number(fatigue_level) : null,
      duty_hours: duty_hours !== null ? Number(duty_hours) : null,
      mood: mood !== null ? Number(mood) : null,
    }),
  });

  if (!res.ok) {
    throw new Error(`Assessment failed with code ${res.status}`);
  }

  return await res.json();
}
