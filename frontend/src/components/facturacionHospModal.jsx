import { Box, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const FacturacionHospitalModal = ({ resumen }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
        gap: 2,
      }}
    >
      {Object.entries(resumen).map(([hospital, total]) => (
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
            <LocalHospitalIcon sx={{ mr: 1, color: '#1cc88a' }} />
            <Typography variant="subtitle1" fontWeight={600}>
              {hospital}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Total Facturado: ${total.toLocaleString()}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default FacturacionHospitalModal;
