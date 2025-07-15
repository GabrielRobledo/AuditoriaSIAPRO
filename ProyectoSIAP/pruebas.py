import pandas as pd
import random
from faker import Faker
from datetime import datetime, timedelta

fake = Faker('es_ES')

# Configuración
num_rows = 20000
num_pacientes = 3000
fecha_inicio = datetime(2024, 8, 1)
fecha_fin = datetime(2024, 8, 31)

# Valores base
tipos_prestacion = ['Ambulatorio']
modulos = [
    (12, 'MODULO INTERNACION'),
    (4, 'KINESIOLOGIA'),
    (227, 'INTERNACION DOMICILIARIA INTEGRAL - SUBMODULO DE CUIDADOR'),
    (214, 'INTERNACION DOMICILIARIA INTEGRAL - MODULO PATOLOGIAS CRONICAS COMPLEJAS'),
    (223, 'INTERNACION DOMICILIARIA INTEGRAL - SUBMODULO DE PRACTICAS DE ENFERMERIA'),
]
practicas = [
    ('420302', 'CONSULTA MEDICA EN GUARDIA', 1, 'PRACTICA MEDICA', '35935 AV. ARTIGAS 1453   () - ', 4936.61, 'HOSPITAL JUAN PABLO II-PEDIATRICO-', 'HP'),
    ('250102', 'TERAPIA FISICA O KINESIOTERAPIA...', 1, 'PRACTICA MEDICA', '40441 SD SD   () - ', 4956.47, 'HOSPITAL SAN LUIS DEL PALMAR', 'HSLP'),
    ('250101', 'AGENTES FISICOS,FISIOTERAPIA...', 1, 'PRACTICA MEDICA', '40441 SD SD   () - ', 4956.47, 'HOSPITAL SAN LUIS DEL PALMAR', 'HSLP'),
    ('227011', 'ATENCION DIARIA DE CUIDADOR 4HS', 1, 'ORDEN PRESTACIÓN', '31805 BELGRANO 1353   () - ', 10023.68, 'HOSPITAL GERIATRICO JUANA F. CABRAL', 'HG'),
    ('227012', 'ATENCION DIARIA DE CUIDADOR 8HS', 1, 'ORDEN PRESTACIÓN', '31805 BELGRANO 1353   () - ', 20047.36, 'HOSPITAL GERIATRICO JUANA F. CABRAL', 'HG'),
    ('214001', 'MODULO MENSUAL PATOLOGIAS...', 31, 'ORDEN PRESTACIÓN', '31805 BELGRANO 1353   () - ', 32307.69, 'HOSPITAL GERIATRICO JUANA F. CABRAL', 'HG'),
    ('223101', 'SESION DE ENFERMERIA', 1, 'ORDEN PRESTACIÓN', '31805 BELGRANO 1353   () - ', 4947.49, 'HOSPITAL GERIATRICO JUANA F. CABRAL', 'HG'),
]

# Pacientes únicos
pacientes = [{
    'NRO_BENEFICIO': fake.unique.random_number(digits=12),
    'GRADO_PARENTESCO': random.choice(['00', '01', '02', '06']),
    'APELLIDO_Y_NOMBRE': fake.name().upper(),
    'CONVENIO': random.choice(['VETERANO', 'NO VETERANO'])
} for _ in range(num_pacientes)]

# Generar filas
rows = []
for i in range(num_rows):
    nro_prestacion = (i // 2) + 1
    tipo_prestacion = random.choice(tipos_prestacion)
    fecha_prestacion = fake.date_between(start_date=fecha_inicio, end_date=fecha_fin).strftime('%d-%b-%y').upper()
    paciente = random.choice(pacientes)
    modulo = random.choice(modulos)
    practica = random.choice(practicas)
    f_practica = (fecha_inicio + timedelta(days=random.randint(0, 30), hours=random.randint(8, 18))).strftime('%d/%m/%Y %H:%M')

    row = {
        'NRO_PRESTACION': nro_prestacion,
        'TIPO DE PRESTACION': tipo_prestacion,
        'FECHA_DE_PRESTACION': fecha_prestacion,
        'NRO_BENEFICIO': paciente['NRO_BENEFICIO'],
        'GRADO_PARENTESCO': paciente['GRADO_PARENTESCO'],
        'APELLIDO_Y_NOMBRE': paciente['APELLIDO_Y_NOMBRE'],
        'MODALIDAD_PRESTACION': '',
        'NRO_ORDEN_DE_PRESTACION': '',
        'MATRICULA': random.randint(1000, 6000),
        'MODULO': modulo[0],
        'NOMBRE_MODULO': modulo[1],
        'PRACTICA': practica[0],
        'D_PRACTICA': practica[1],
        'F_PRACTICA': f_practica,
        'CANT.': practica[2],
        'D_PRESTACION': practica[3],
        'MODALIDAD_PRESTACION_2': 'BENEFICIARIO PROPIO' if practica[3] == 'PRACTICA MEDICA' else 'ORDEN PRESTACIÓN',
        'NRO_ORDEN_PRESTACION_PRACTICA': fake.random_number(digits=10),
        'BOCA_ATENCION': practica[4],
        'Valor Unitario': f"${practica[5]:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."),
        'Valor Total': f"${practica[5]:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."),
        'BA Externa': '',
        'Efector': practica[6],
        'CONVENIO': paciente['CONVENIO'],
        'OBSERVACIONES': '',
        'para banco de sangre y laboratorio': practica[6],
        'cod': practica[7],
        'Cant. Débito': '',
        'Debito': '$ 0,00'
    }
    rows.append(row)

# Guardar en Excel
df = pd.DataFrame(rows)
df.to_excel("prestaciones_ficticias_20000.xlsx", index=False)
print("Archivo generado exitosamente.")
