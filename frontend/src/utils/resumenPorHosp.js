
export const getResumenHospitales = (atenciones) => {
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
};