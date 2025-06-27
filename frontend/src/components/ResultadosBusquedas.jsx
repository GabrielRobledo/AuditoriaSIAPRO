import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

export default function ResultadosBusqueda() {
  const { search } = useLocation();
  const queryParam = new URLSearchParams(search).get('q')?.toLowerCase() || '';

  const [usuarios, setUsuarios] = useState([]);
  const [efectores, setEfectores] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [uRes, eRes, aRes] = await Promise.all([
          axios.get('/api/auth/usuarios'),
          axios.get('/api/efectores'),
          axios.get('/api/atenciones'),
        ]);
        setUsuarios(uRes.data);
        setEfectores(eRes.data);
        setAtenciones(aRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const resultadosUsuarios = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(queryParam) ||
    u.email?.toLowerCase().includes(queryParam)
  );
  const resultadosEfectores = efectores.filter(e =>
    e.RazonSocial?.toLowerCase().includes(queryParam)
  );
  const resultadosAtenciones = atenciones.filter(a =>
    a.apeYnom?.toLowerCase().includes(queryParam) ||
    a.dni?.includes(queryParam)
  );

  if (loading) return <p>Cargando resultados…</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Resultados para: <em>{queryParam}</em></h2>

      <Section title="Usuarios" items={resultadosUsuarios} renderItem={u => `${u.nombre} (${u.email})`} />
      <Section title="Hospitales" items={resultadosEfectores} renderItem={e => e.RazonSocial} />
      <Section title="Atenciones" items={resultadosAtenciones} renderItem={a => `${a.apeYnom} – DNI: ${a.dni}`} />
    </div>
  );
}

function Section({ title, items, renderItem }) {
  return (
    <section style={{ marginBottom: '24px' }}>
      <h3>{title}</h3>
      {items.length ? (
        <ul>
          {items.map((it, i) => <li key={i}>{renderItem(it)}</li>)}
        </ul>
      ) : (
        <p>No se encontraron {title.toLowerCase()}.</p>
      )}
    </section>
  );
}
