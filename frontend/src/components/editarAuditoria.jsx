import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import TablaConFiltro from '../components/tabla';

export default function AuditoriaEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [aud, setAud] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/auditorias/${id}`)
      .then(res => res.json())
      .then(data => setAud(data))
      .catch(err => Swal.fire('Error', err.message, 'error'));
  }, [id]);

  const guardar = () => {
    fetch(`http://localhost:3000/api/auditorias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        periodo: aud.periodo,
        totalDebito: aud.totalDebito,
        detalles: aud.detalles
      })
    })
      .then(res => {
        if (res.ok) {
          Swal.fire('Actualizado', 'La auditoría fue actualizada', 'success');
          navigate('/auditorias');
        } else {
          return res.json().then(j => { throw new Error(j.error || 'Error desconocido'); });
        }
      })
      .catch(err => Swal.fire('Error', err.message, 'error'));
  };

  if (!aud) return <p>Cargando auditoría...</p>;

  return (
    <div>
      <h2>Auditoría #{aud.idAuditoria}</h2>
      <p><strong>Periodo:</strong> {aud.periodo}</p>
      <TablaConFiltro
        datos={aud.detalles}
        tipo="atenciones"
        setDatos={setAud}
        editarAuditoriaId={aud.idAuditoria}
      />
      <div style={{ marginTop: '15px' }}>
        <button onClick={guardar}>Salvar cambios</button>
        <button onClick={() => navigate('/auditorias')} style={{ marginLeft: '10px' }}>Volver</button>
      </div>
    </div>
  );
}
