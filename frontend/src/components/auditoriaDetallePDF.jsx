import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AuditoriaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auditoria, setAuditoria] = useState(null);
  const [motivos, setMotivos] = useState([]);

  const logoBase64  = '/logo1.png';
  const slogan = 'Tu auditoría de confianza';

  const exportarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    // --- Agregar logo en la esquina superior derecha ---
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 40;  // ancho en mm
    const logoHeight = 15; // alto en mm
    const marginRight = 14; // margen desde la derecha
    const marginTop = 10;   // margen desde arriba

    // Posición x para que quede pegado a la derecha
    const x = pageWidth - logoWidth - marginRight;
    const y = marginTop;

    // Agregar imagen
    doc.addImage(logoBase64, 'PNG', x, y, logoWidth, logoHeight);

    // --- Agregar slogan debajo del logo ---
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(slogan, x, y + logoHeight + 5, { align: 'left' });

    // --- Texto principal (a la izquierda) ---
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(`Auditoría #${auditoria.idAuditoria}`, 14, 25);
    doc.setFontSize(12);
    doc.text(`Hospital: ${auditoria.detalles[0]?.hospital || '-'}`, 14, 32);
    doc.text(`Periodo: ${auditoria.periodo}`, 14, 39);
    doc.text(`Total Facturado: $${totalFacturado.toFixed(2)}`, 14, 46);
    doc.text(`Total Débito: $${parseFloat(auditoria.totalDebito || 0).toFixed(2)}`, 14, 53);
    doc.text(`Total Neto: $${(totalFacturado - auditoria.totalDebito).toFixed(2)}`, 14, 60);

    autoTable(doc, {
        startY: 70,
        head: [[
        'Paciente', 'Fecha Atención', 'Tipo Atención', 'Código Práctica',
        'Fecha Práctica', 'Módulo', 'Cantidad', 'Valor Total', 'Débito', 'Motivo'
        ]],
        body: auditoria.detalles.map(d => [
        d.apeYnom,
        formatDate(d.fecha),
        d.tipoAtencion,
        d.codPractica,
        formatDate(d.fechaPractica),
        d.moduloDescripcion,
        d.cantidad,
        `$${d.valorTotal.toFixed(2)}`,
        `$${d.debito.toFixed(2)}`,
        getNombreMotivo(d.idMotivo)
        ]),
        styles: {
        fontSize: 9,
        cellPadding: 3,
        },
        headStyles: {
        fillColor: [25, 118, 210],
        textColor: '#fff',
        }
    });

    doc.save(`auditoria_${auditoria.idAuditoria}.pdf`);
};

    useEffect(() => {
    fetch('http://localhost:3000/api/motivos')
        .then(res => res.json())
        .then(data => {
        console.log('→ Motivos recibidos:', data); 
        setMotivos(data);
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
    }, []);

  useEffect(() => {
    fetch(`http://localhost:3000/api/auditorias/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo obtener la auditoría');
        return res.json();
      })
      .then(data => setAuditoria(data))
      .catch(err => {
        console.error(err);
        Swal.fire('Error', err.message, 'error');
      });
  }, [id]);

  console.log('Auditoría cargada:', auditoria);

  if (!auditoria) return <p style={{ padding: '2rem' }}>Cargando auditoría...</p>;

  const totalFacturado = auditoria.detalles.reduce((sum, d) => sum + (d.valorTotal || 0), 0);

  const getNombreMotivo = (id) => {
    const motivo = motivos.find(m => m.idMotivo === id);
    return motivo ? motivo.motivo : '-';
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Detalle de Auditoría #{auditoria.idAuditoria}</h2>
        <button
            onClick={exportarPDF}
            style={{
                marginBottom: '1rem',
                padding: '10px 20px',
                backgroundColor: '#2e7d32',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            }}
            >
        📄 Exportar a PDF
        </button>

      {/* === Encabezado === */}
      <div style={{
        background: '#f9f9f9',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #ccc',
        marginBottom: '2rem'
      }}>
        <p><strong>Hospital:</strong> {auditoria.detalles[0]?.hospital || '-'}</p>
        <p><strong>Periodo:</strong> {auditoria.periodo}</p>
        <p><strong>Total Facturado:</strong> ${totalFacturado.toFixed(2)}</p>
        <p><strong>Total Débito:</strong> ${parseFloat(auditoria.totalDebito || 0).toFixed(2)}</p>
        <p><strong>Total Neto:</strong> ${(totalFacturado - auditoria.totalDebito).toFixed(2)}</p>
      </div>

      <hr />

      {/* === Tabla de detalles === */}
      <h3 style={{ marginTop: '2rem' }}>Registros Detallados</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Paciente</th>
              <th style={thStyle}>Fecha Atención</th>
              <th style={thStyle}>Tipo Atención</th>
              <th style={thStyle}>Código Práctica</th>
              <th style={thStyle}>Fecha Práctica</th>
              <th style={thStyle}>Módulo</th>
              <th style={thStyle}>Cantidad</th>
              <th style={thStyle}>Valor Total</th>
              <th style={thStyle}>Débito</th>
              <th style={thStyle}>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {auditoria.detalles.map((d, i) => (
              <tr key={d.idAtencion} style={{ backgroundColor: i % 2 === 0 ? '#f5f5f5' : '#fff' }}>
                <td style={tdStyle}>{d.apeYnom}</td>
                <td style={tdStyle}>{formatDate(d.fecha)}</td>
                <td style={tdStyle}>{d.tipoAtencion}</td>
                <td style={tdStyle}>{d.codPractica}</td>
                <td style={tdStyle}>{formatDate(d.fechaPractica)}</td>
                <td style={tdStyle}>{d.moduloDescripcion}</td>
                <td style={tdStyle}>{d.cantidad}</td>
                <td style={tdStyle}>${d.valorTotal.toFixed(2)}</td>
                <td style={tdStyle}>${d.debito.toFixed(2)}</td>
                <td style={{ ...tdStyle, padding: '8px' }}>
                {d.idMotivo ? (
                    <span
                    title={getNombreMotivo(d.idMotivo)}
                    style={{
                        backgroundColor: 'green',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                        maxWidth: '160px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                    >
                    {getNombreMotivo(d.idMotivo)}
                    </span>
                ) : (
                    <span style={{ color: '#999' }}>-</span>
                )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => navigate('/auditorias')}
        style={{
          marginTop: '2rem',
          padding: '10px 20px',
          backgroundColor: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        ← Volver al Listado
      </button>
    </div>
  );
}

// === Utilidades y estilos ===

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
};

const thStyle = {
  backgroundColor: '#1976d2',
  color: '#fff',
  textAlign: 'left',
  padding: '12px 16px'
};

const tdStyle = {
  padding: '12px 16px',
  borderBottom: '1px solid #e0e0e0'
};
