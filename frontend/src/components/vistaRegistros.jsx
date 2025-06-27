import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import TablaConFiltro from './tabla';
import ListadoHospitales from '../components/listaHospitales';
import * as XLSX from 'xlsx';

const VistaRegistros = ({ editarAuditoria = false }) => {
  const { tipo, id } = useParams();
  const [searchParams] = useSearchParams();
  const hospitalFiltro = searchParams.get('hospital');

  const [datos, setDatos] = useState([]);
  const [hospitales, setHospitales] = useState([]);

  // 🔄 Traer listado de hospitales (efectores)
  useEffect(() => {
    fetch('http://localhost:3000/api/efectores')
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener hospitales');
        return res.json();
      })
      .then(json => setHospitales(json))
      .catch(err => {
        console.error('Error cargando hospitales:', err);
        setHospitales([]); // fallback vacío para evitar más errores
      });
  }, []);

  // 🔁 Si está en modo edición de auditoría, traemos auditoría por ID
  useEffect(() => {
    if (editarAuditoria) {
      fetch(`http://localhost:3000/api/auditorias/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Error al obtener auditoría');
          return res.json();
        })
        .then((auditoria) => {
          console.log('AUDITORIA RECIBIDA:', auditoria);

          if (Array.isArray(auditoria?.detalles)) {
            const datosConExtras = auditoria.detalles.map((d) => ({
              ...d,
              idEfector: auditoria.idEfector,
              periodo: auditoria.periodo,
            }));
            setDatos(datosConExtras);
          } else {
            console.warn('La auditoría no contiene detalles válidos.');
            setDatos([]);
          }
        })
        .catch((err) => {
          console.error('Error al cargar auditoría:', err);
          setDatos([]);
        });
    } else if (tipo) {
      fetch(`http://localhost:3000/api/${tipo}`)
        .then(res => {
          if (!res.ok) throw new Error('Error al obtener datos');
          return res.json();
        })
        .then(json => setDatos(json))
        .catch(err => {
          console.error('Error al cargar datos:', err);
          setDatos([]);
        });
    }
  }, [tipo, editarAuditoria, id]);

  // 🔍 Filtro por hospital
  const datosFiltrados = useMemo(() => {
    if (tipo === 'atenciones' && hospitalFiltro) {
      return datos.filter(d =>
        d.idEfector &&
        String(d.idEfector).toLowerCase() === String(hospitalFiltro).toLowerCase()
      );
    }
    return datos;
  }, [datos, tipo, hospitalFiltro]);

  // 🏥 Mostrar nombre del hospital
  const nombreHospital = useMemo(() => {
    if (!hospitalFiltro || hospitales.length === 0) return null;
    const h = hospitales.find(hosp =>
      String(hosp.idEfector).toLowerCase() === String(hospitalFiltro).toLowerCase()
    );
    return h?.RazonSocial || null;
  }, [hospitalFiltro, hospitales]);

  // 🖥️ Si es vista general de atenciones sin filtro
  if (!editarAuditoria && tipo === 'atenciones' && !hospitalFiltro) {
    return (
      <div>
        <h2>Resumen de Atenciones por Hospital</h2>
        <ListadoHospitales atenciones={datos} />
      </div>
    );
  }

  // 📋 Vista principal de registros (listado o edición)
  return (
    <div>
      <h2>
        {editarAuditoria
          ? 'Editar Auditoría'
          : `Listado de ${tipo?.charAt(0).toUpperCase() + tipo?.slice(1)}`
        }
        {hospitalFiltro && nombreHospital && ` - Hospital: ${nombreHospital}`}
      </h2>

      <TablaConFiltro
        datos={datosFiltrados}
        setDatos={setDatos}
        tipo={tipo || 'atenciones'}
        editarAuditoriaId={editarAuditoria ? id : null}
      />
    </div>
  );
};

export default VistaRegistros;
