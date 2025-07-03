export const getFacturacionPorHospital = (atenciones) => {
  const resumen = {};

  atenciones.forEach(({ RazonSocial, valorTotal = 0 }) => {
    const hospital = RazonSocial || 'Desconocido';

    if (!resumen[hospital]) {
      resumen[hospital] = 0;
    }

    resumen[hospital] += valorTotal;
  });

  return resumen;
};
