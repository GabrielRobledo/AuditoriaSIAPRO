import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

// Función para normalizar texto (quita tildes y pasa a minúsculas)
const normalize = str =>
  str?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';

export default function ResultadosBusqueda() {
  const { search } = useLocation();
  const queryParamRaw = new URLSearchParams(search).get('q') || '';
  const normalizedQuery = normalize(queryParamRaw);

  const [usuarios, setUsuarios] = useState([]);
  const [efectores, setEfectores] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {

        const [uRes, eRes, aRes] = await Promise.all([
          axios.get('http://localhost:3000/api/auth/usuarios'),
          axios.get('http://localhost:3000/api/efectores'),
          axios.get('http://localhost:3000/api/atenciones'),
        ]);

        // Ajuste: acceder a las propiedades reales
        setUsuarios(uRes.data.usuarios || []);
        setEfectores(eRes.data.efectores || []);
        setAtenciones(aRes.data.atenciones || []);
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const resultadosUsuarios = useMemo(() => {
    return usuarios.filter(u => {
      const nombreNorm = normalize(u.nombre);
      const emailNorm = normalize(u.usuario);
      const match = nombreNorm.includes(normalizedQuery) || emailNorm.includes(normalizedQuery);
      console.log(`[Usuario] "${u.nombre}" -> ${match}`);
      return match;
    });
  }, [usuarios, normalizedQuery]);

  const resultadosEfectores = useMemo(() =>
    efectores.filter(e =>
      normalize(e.RazonSocial).includes(normalizedQuery)
    ), [efectores, normalizedQuery]);

  const resultadosAtenciones = useMemo(() =>
    atenciones.filter(a =>
      normalize(a.apeYnom).includes(normalizedQuery) ||
      a.NroBeneficiario?.includes(normalizedQuery)
    ), [atenciones, normalizedQuery]);

  if (loading) return <p>Cargando resultados…</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Resultados para: <em>{queryParamRaw}</em></h2>

      <Section
        title="Usuarios"
        items={resultadosUsuarios}
        renderItem={u => `${u.nombre} (${u.email})`}
      />
      <Section
        title="Hospitales"
        items={resultadosEfectores}
        renderItem={e => e.RazonSocial}
      />
      <Section
        title="Atenciones"
        items={resultadosAtenciones}
        renderItem={a => `${a.apeYnom} – DNI: ${a.dni}`}
      />
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
