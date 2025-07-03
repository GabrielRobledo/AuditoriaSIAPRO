import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import {FaHospital, FaTasks} from 'react-icons/fa';
import '../styles/cardsHosp.css';

const ListadoHospitales = ({ atenciones }) => {
  const navigate = useNavigate();

  const { resumen, tiposAtencionUnicos } = useMemo(() => {
    const resumen = {};
    const tiposSet = new Set();

    atenciones.forEach(({ RazonSocial, tipoAtencion, idEfector }) => {
      const hospital = RazonSocial || 'Desconocido';
      tiposSet.add(tipoAtencion);

      if (!resumen[hospital]) {
        resumen[hospital] = { idEfector, conteos: {} };
      }

      if (!resumen[hospital].conteos[tipoAtencion]) {
        resumen[hospital].conteos[tipoAtencion] = 0;
      }

      resumen[hospital].conteos[tipoAtencion]++;
    });

    return {
      resumen,
      tiposAtencionUnicos: Array.from(tiposSet),
    };
  }, [atenciones]);

  const handleClickHospital = (idEfector) => {
    navigate(`/registros/atenciones?hospital=${encodeURIComponent(idEfector)}`);
  };

  return (
    <div className="cards-grid">
      {Object.entries(resumen).map(([hospital, { idEfector, conteos }]) => (
        <div
          key={hospital}
          className="card"
          onClick={() => handleClickHospital(idEfector)}
        >
          <div className="card-header">
            <div className="card-icon">
              <LocalHospitalIcon />
            </div>
            <h3 className="card-title">{hospital}</h3>
          </div>
          <ul className="card-list">
            {tiposAtencionUnicos.map((tipo) => (
              <li key={tipo}>
                <strong>{tipo}:</strong> {conteos[tipo] || 0}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ListadoHospitales;
