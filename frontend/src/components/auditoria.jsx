import { useLocation } from 'react-router-dom';
import '../styles/tabla.css'

const auditoria = () => {
  const location = useLocation();
  const registros = location.state?.registros || [];

  if (registros.length === 0) {
    return <p>No se recibieron registros.</p>;
  }

  const columnas = Object.keys(registros[0]);

  return (
    <div className='tabla tabla-contenedor' >
      <h2>Auditorias Recibidas</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col} style={{ border: '1px solid #ccc', padding: '8px', background: '#f5f5f5' }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {registros.map((row, idx) => (
            <tr key={idx}>
              {columnas.map((col) => (
                <td key={col} style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {typeof row[col] === 'boolean' ? (row[col] ? '✔️' : '❌') : row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default auditoria