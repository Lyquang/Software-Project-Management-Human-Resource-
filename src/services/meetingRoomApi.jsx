const API_URL = "https://ems-toq5.onrender.com/ems";

function getToken() {
  return localStorage.getItem('accessToken') || localStorage.getItem('token');
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function parseJsonSafe(res) {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function handleHttpError(res, body) {
  const message = (body && (body.message || body.error)) || res.statusText;
  const err = new Error(`${res.status} ${message}`);
  err.status = res.status;
  err.body = body;
  throw err;
}

export const getRooms = async () => {
  const res = await fetch(`${API_URL}/api/rooms`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) handleHttpError(res, data);
  return data;
};

export const getRoomById = async (id) => {
  const res = await fetch(`${API_URL}/api/rooms/${id}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) handleHttpError(res, data);
  return data;
};

export const getAvailableRooms = async (startTime, endTime) => {
  const res = await fetch(
    `${API_URL}/api/rooms/available-in-time?startTime=${startTime}&endTime=${endTime}`,
    { headers: authHeaders() }
  );
  const data = await parseJsonSafe(res);
  if (!res.ok) handleHttpError(res, data);
  return data;
};

export const createRoom = async (roomData) => {
  const res = await fetch(`${API_URL}/api/rooms/admin/rooms`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(roomData),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) handleHttpError(res, data);
  return data;
};

export const updateRoom = async (id, roomData) => {
  const res = await fetch(`${API_URL}/api/rooms/admin/rooms/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(roomData),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) handleHttpError(res, data);
  return data;
};

export const deleteRoom = async (id) => {
  const res = await fetch(`${API_URL}/api/rooms/admin/rooms/${id}`, {
    method: 'DELETE',
    headers: authHeaders({ 'Accept': '*/*' }), // như swagger yêu cầu
  });

  if (res.status === 204) return { code: 204, message: 'No Content' };
  const data = await parseJsonSafe(res);
  if (!res.ok) handleHttpError(res, data);
  return data || { code: res.status, message: 'Deleted' };
};

// ---- BOOKING APIs ----
export const getBookings = async () => {
  const res = await fetch(`${API_URL}/api/bookings`, {
    headers: authHeaders(),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) handleHttpError(res, data);
  return data;
};

export const getBookingsForManager = async () => {
  const res = await fetch(`${API_URL}/api/bookings/manager`, {
    headers: authHeaders(),
  });
  const data = await parseJsonSafe(res);
  if(!res.ok) handleHttpError(res, data);
  return data;
}

export const getBookingById = async (id) => {
  const res = await fetch(`${API_URL}/api/bookings/${id}`, {
    headers: authHeaders(),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) handleHttpError(res, data);
  return data;
};

export const getMyBookings = async () => {
  const res = await fetch(`${API_URL}/api/bookings/my-bookings`, {
    headers: authHeaders(),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) handleHttpError(res, data);
  return data;
};

export const createBooking = async (bookingData) => {
  const res = await fetch(`${API_URL}/api/bookings`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(bookingData),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) handleHttpError(res, data);
  return data;
};

export const updateBooking = async (id, bookingData) => {
  const res = await fetch(`${API_URL}/api/bookings/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(bookingData),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) handleHttpError(res, data);
  return data;
};

export const deleteBooking = async (id, reason) => {
  const res = await fetch(`${API_URL}/api/bookings/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ reason }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) handleHttpError(res, data);
  return data;
};

export const getMyInfo = async () => {
  const res = await fetch(`${API_URL}/personnels/myInfo`, {
    headers: authHeaders(),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) handleHttpError(res, data);
  return data;
};

export const getDepartmentEmployees = async (departmentId) => {
  const res = await fetch(`${API_URL}/departments/${departmentId}/employees`, {
    headers: authHeaders(),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) handleHttpError(res, data);
  return data;
};
