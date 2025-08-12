import API_URL from "../config";

export const obtenerLogs = async (idUsuario) => {
  const res = await fetch(`${API_URL}/api/logs/${idUsuario}`);
  return res.json();
};

export const registrarLog = async (log) => {
  const res = await fetch(`${API_URL}/api/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log)
  });
  return res.json();
};
