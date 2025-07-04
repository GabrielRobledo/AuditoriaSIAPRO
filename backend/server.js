const express = require('express');
const app = express();
const efectoresRoutes = require('./routes/efectoresRoutes');
const beneficiariosRoutes = require('./routes/beneficiariosRoutes');
const atencionesRoutes = require('./routes/atencionesRoutes')
const authRoutes = require('./routes/altaUserRoutes');
const loginRoutes = require('./routes/loginRoutes')
const auditoriasRoutes = require('./routes/auditoriasRoutes')
const asignacionRoutes = require('./routes/asignacionesRoutes');
const auditoriaProgresoRoutes = require('./routes/auditoriasProgresoRoutes');
const motivosRoutes = require('./routes/motivosRoutes');
const motivosTotalesRoutes = require('./routes/motivosTotalesRoutes');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();



// 👇 Esto es esencial y debe estar antes de tus rutas
app.use(cors());

// Middleware
app.use(express.json());

// Rutas
app.use('/api', efectoresRoutes);
app.use('/api', beneficiariosRoutes);
app.use('/api', atencionesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', loginRoutes);
app.use('/api', auditoriasRoutes);
app.use('/api', asignacionRoutes);
app.use('/api', auditoriaProgresoRoutes);
app.use('/api', motivosRoutes);
app.use('/api', motivosTotalesRoutes);


// Servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
