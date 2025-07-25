import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import TablaConFiltro from '../components/tabla';
import API_URL from '../config';

export default function AuditoriaEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [aud, setAud] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/auditorias/${id}`)
      .then(res => res.json())
      .then(data => {
        // Mapeamos los detalles para calcular el valorNumerico
        const detallesConPorcentaje = data.detalles.map(detalle => {
          // Asegúrate que totalAtencion exista y no sea cero para evitar división por cero
          const porcentaje = detalle.totalAtencion && detalle.totalAtencion !== 0
            ? detalle.debito / detalle.totalAtencion
            : 0;
          
          return {
            ...detalle,
            valorNumerico: porcentaje
          };
        });

        console.log(data.detalles);

        // Actualizamos el objeto completo con detalles modificados
        setAud({
          ...data,
          detalles: detallesConPorcentaje
        });
      })
      .catch(err => Swal.fire('Error', err.message, 'error'));
  }, [id]);


  const guardar = () => {
    fetch(`${API_URL}/api/auditorias/${id}`, {
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
