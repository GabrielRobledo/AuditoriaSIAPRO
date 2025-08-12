import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Container,
  CircularProgress,
  Avatar,
  Tabs,
  Tab,
  Fade,
  Skeleton,
  Breadcrumbs,
  Link,
  Select,
  MenuItem,
} from '@mui/material';

import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

const normalize = str =>
  str?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';

const highlightText = (text, query) => {
  const normalizedQuery = normalize(query);
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) => (
    <span key={i} style={{ backgroundColor: normalize(part) === normalizedQuery ? '#ffff0066' : 'transparent' }}>
      {part}
    </span>
  ));
};

export default function ResultadosBusqueda() {
  const { search } = useLocation();
  const queryParamRaw = new URLSearchParams(search).get('q') || '';
  const normalizedQuery = normalize(queryParamRaw);

  const [usuarios, setUsuarios] = useState([]);
  const [efectores, setEfectores] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [cierres, setCierres] = useState([]);
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [orden, setOrden] = useState('alfabetico');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [uRes, eRes, aRes, cRes, auRes] = await Promise.all([
          axios.get(`${API_URL}/api/auth/usuarios`),
          axios.get(`${API_URL}/api/efectores`),
          axios.get(`${API_URL}/api/atenciones`),
          axios.get(`${API_URL}/api/listarCierres`),
          axios.get(`${API_URL}/api/auditorias`),
        ]);

        setUsuarios(uRes.data || []);
        setEfectores(eRes.data || []);
        setAtenciones(aRes.data || []);
        setCierres(cRes.data || []);
        setAuditorias(auRes.data || []);
      } catch (err) {
        console.error('❌ Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const sortItems = (items) => {
    if (orden === 'alfabetico') {
      return [...items].sort((a, b) =>
        normalize(a.nombre || a.apeYnom || a.RazonSocial || a.Hospital || '').localeCompare(
          normalize(b.nombre || b.apeYnom || b.RazonSocial || b.Hospital || '')
        )
      );
    }
    return items;
  };

  const resultadosUsuarios = useMemo(() =>
    sortItems(usuarios.filter(u =>
      normalize(u.nombre).includes(normalizedQuery) ||
      normalize(u.usuario).includes(normalizedQuery)
    )), [usuarios, normalizedQuery, orden]);

  const resultadosEfectores = useMemo(() =>
    sortItems(efectores.filter(e =>
      normalize(e.RazonSocial).includes(normalizedQuery)
    )), [efectores, normalizedQuery, orden]);

  const resultadosAtenciones = useMemo(() =>
    sortItems(atenciones.filter(a =>
      normalize(a.apeYnom).includes(normalizedQuery) ||
      a.NroBeneficiario?.includes(normalizedQuery) ||
      normalize(a.RazonSocial).includes(normalizedQuery)
    )), [atenciones, normalizedQuery, orden]);

  const resultadosAuditorias = useMemo(() =>
    sortItems(auditorias.filter(au =>
      normalize(au.Hospital).includes(normalizedQuery)
    )), [auditorias, normalizedQuery, orden]);

  const secciones = [
    {
      label: 'Usuarios',
      icon: <PersonIcon color="primary" sx={{ mr: 1 }} />,
      items: resultadosUsuarios,
      renderItem: u => (
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{u.nombre?.[0]}</Avatar>
          <Box>
            <Typography fontWeight="bold">{highlightText(u.nombre, queryParamRaw)}</Typography>
            <Typography variant="body2" color="text.secondary">{highlightText(u.usuario, queryParamRaw)}</Typography>
          </Box>
        </Box>
      )
    },
    {
      label: 'Hospitales',
      icon: <LocalHospitalIcon color="error" sx={{ mr: 1 }} />,
      items: resultadosEfectores,
      renderItem: e => <Typography>{highlightText(e.RazonSocial, queryParamRaw)}</Typography>
    },
    {
      label: 'Atenciones',
      icon: <AssignmentIndIcon color="action" sx={{ mr: 1 }} />,
      items: resultadosAtenciones,
      renderItem: a => (
        <>
          <Typography fontWeight="bold">{highlightText(a.apeYnom, queryParamRaw)}</Typography>
          <Typography variant="body2" color="text.secondary">
            Nro Beneficiario: {highlightText(a.NroBeneficiario || '', queryParamRaw)}
          </Typography>
        </>
      )
    },
    {
      label: 'Auditorías',
      icon: <AssignmentIndIcon color="secondary" sx={{ mr: 1 }} />,
      items: resultadosAuditorias,
      renderItem: au => (
        <Typography fontWeight="bold">{highlightText(au.Hospital, queryParamRaw)}</Typography>
      )
    },
  ];

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>Buscando resultados...</Typography>
        <Grid container spacing={2}>
          {[...Array(6)].map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  const currentSection = secciones[tab];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/">Inicio</Link>
        <Typography color="text.primary">Resultados</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        Resultados para: <em>{queryParamRaw}</em>
      </Typography>

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Tabs value={tab} onChange={(e, val) => setTab(val)} variant="scrollable" scrollButtons="auto">
          {secciones.map((s, idx) => (
            <Tab key={idx} label={s.label} icon={s.icon} iconPosition="start" />
          ))}
        </Tabs>

        <Select value={orden} onChange={e => setOrden(e.target.value)} size="small" sx={{ ml: 2 }}>
          <MenuItem value="alfabetico">Orden alfabético</MenuItem>
        </Select>
      </Box>

      <Fade in>
        <Box>
          {currentSection.items.length ? (
            <Grid container spacing={2}>
              {currentSection.items.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>{currentSection.renderItem(item)}</CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" mt={4}>
              <SentimentVeryDissatisfiedIcon color="disabled" sx={{ fontSize: 64 }} />
              <Typography variant="body1" mt={2}>
                No se encontraron {currentSection.label.toLowerCase()} para "<strong>{queryParamRaw}</strong>".
              </Typography>
            </Box>
          )}
        </Box>
      </Fade>
    </Container>
  );
}
