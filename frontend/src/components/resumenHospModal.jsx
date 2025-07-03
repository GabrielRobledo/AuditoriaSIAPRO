
import { Box, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const ResumenHospitalesModal = ({ resumen, tiposAtencionUnicos }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
        gap: 2,
      }}
    >
      {Object.entries(resumen).map(([hospital, { conteos }]) => (
        <Box
          key={hospital}
          sx={{
            border: '1px solid #ddd',
            borderRadius: 2,
            p: 2,
            backgroundColor: '#f9f9f9',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocalHospitalIcon sx={{ mr: 1, color: '#007bff' }} />
            <Typography variant="subtitle1" fontWeight={600}>
              {hospital}
            </Typography>
          </Box>
          <ul style={{ paddingLeft: 16 }}>
            {tiposAtencionUnicos.map((tipo) => (
              <li key={tipo}>
                <strong>{tipo}:</strong> {conteos[tipo] || 0}
              </li>
            ))}
          </ul>
        </Box>
      ))}
    </Box>
  );
};

export default ResumenHospitalesModal;
