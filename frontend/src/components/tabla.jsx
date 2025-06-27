import { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/tabla.css';
import * as XLSX from 'xlsx';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

const TablaConFiltro = ({ datos, tipo, setDatos, editarAuditoriaId }) => {
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [inputValues, setInputValues] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});
  const [checkedRows, setCheckedRows] = useState({});
  const pageSize = 30;
  const navigate = useNavigate();

  useEffect(() => {
    const nuevosValores = {};
    const nuevosChecks = {};

    datos.forEach((row, idx) => {
      if (row.debito !== undefined) {
        nuevosValores[idx] = row.valorNumerico || 0;
        nuevosChecks[idx] = true;
      }
    });

    setInputValues(nuevosValores);
    setCheckedRows(nuevosChecks);
  }, [datos]);

  const handleInputChange = (rowId, value) => {
    setInputValues((prev) => ({ ...prev, [rowId]: value }));
  };

  const handleCheckboxChange = (rowId, isChecked) => {
    setCheckedRows((prev) => ({ ...prev, [rowId]: isChecked }));
  };

  const columns = useMemo(() => {
    if (!datos || datos.length === 0) return [];

    const dataColumns = Object.keys(datos[0]).map((key) => ({
      accessorKey: key,
      header: key,
      cell: (info) => info.getValue(),
      filterFn: "includesString",
      enableSorting: true,
    }));

    if (tipo === "atenciones") {
      const inputColumn = {
        accessorKey: "__valor",
        header: "Debito",
        cell: ({ row }) => (
          <input
            type="number"
            step="0.5"
            value={inputValues[row.id] || ""}
            onChange={(e) => handleInputChange(row.id, e.target.value)}
            style={{ width: "100px" }}
          />
        ),
        enableSorting: false,
      };

      const debitoColumn = {
        accessorKey: "__debito",
        header: "Débito $",
        cell: ({ row }) => {
          const valorNumerico = parseFloat(inputValues[row.id]) || 0;
          const importe = parseFloat(row.original.valorTotal) || 0;
          const debito = importe * valorNumerico;
          return debito.toFixed(2);
        },
        enableSorting: false,
      };

      const revisadoColumn = {
        accessorKey: "__revisado",
        header: "Revisado",
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={!!checkedRows[row.id]}
            onChange={(e) => handleCheckboxChange(row.id, e.target.checked)}
          />
        ),
        enableSorting: false,
      };

      return [...dataColumns, inputColumn, debitoColumn, revisadoColumn];
    }

    return dataColumns;
  }, [datos, inputValues, tipo, checkedRows]);

  const table = useReactTable({
    data: Array.isArray(datos) ? datos : [],
    columns,
    state: {
      columnFilters,
      columnVisibility,
      sorting,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const filteredRows = table.getSortedRowModel().rows;

  const paginatedRows = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, pageIndex, pageSize]);

  const totalPages = Math.ceil(filteredRows.length / pageSize);

  useEffect(() => {
    setPageIndex(0);
  }, [columnFilters]);

  const totalDebito = useMemo(() => {
    if (tipo !== "atenciones") return 0;
    return filteredRows.reduce((acc, row) => {
      const valorNumerico = parseFloat(inputValues[row.id]) || 0;
      const importe = parseFloat(row.original.valorTotal) || 0;
      return acc + (importe * valorNumerico);
    }, 0);
  }, [filteredRows, inputValues, tipo]);

  const handleEnviarRegistros = () => {
    const todosTildados = filteredRows.every((row) => checkedRows[row.id]);

    if (!todosTildados) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan registros por revisar',
        text: 'Debés marcar todos los registros antes de enviarlos.',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    const registrosProcesados = filteredRows.map((row) => {
      const original = row.original;
      const rowId = row.id;
      const valorNumerico = parseFloat(inputValues[rowId]) || 0;
      const importe = parseFloat(original.valorTotal) || 0;
      const debito = importe * valorNumerico;

      return {
        ...original,
        valorNumerico,
        debito: debito.toFixed(2),
        revisado: !!checkedRows[rowId],
      };
    });

    const periodo = registrosProcesados[0]?.periodo || new Date().toISOString().slice(0, 7);
    const idUsuario = 2; // cambiar por usuario real
    const idEfector = registrosProcesados[0]?.idEfector || 0;
    const totalDebitoFinal = registrosProcesados.reduce((acc, r) => acc + parseFloat(r.debito), 0);

    const payload = {
      periodo,
      idUsuario,
      idEfector,
      totalDebito: totalDebitoFinal,
      detalles: registrosProcesados.map((r) => ({
        idAtencion: r.idAtencion,
        debito: parseFloat(r.debito),
      })),
    };

    const method = editarAuditoriaId ? 'PUT' : 'POST';
    const url = editarAuditoriaId
      ? `http://localhost:3000/api/auditorias/${editarAuditoriaId}`
      : 'http://localhost:3000/api/auditorias';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Auditoría guardada correctamente',
          confirmButtonText: 'Aceptar',
        }).then(() => {
          navigate('/dashboardAuditor');
        });

        if (!editarAuditoriaId) {
          const idsEnviados = new Set(registrosProcesados.map((r) => r.id));
          setDatos((prev) => prev.filter((r) => !idsEnviados.has(r.id)));
        } else {
          navigate('/auditorias');
        }
      })
      .catch((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al enviar auditoría',
          text: err.message || 'Algo salió mal',
        });
      });
  };

  const exportarAExcel = () => {
    const registrosExportados = filteredRows.map((row) => {
      const rowData = { ...row.original };

      if (tipo === "atenciones") {
        const valorNumerico = parseFloat(inputValues[row.id]) || 0;
        const importe = parseFloat(row.original.valorTotal) || 0;
        const debito = importe * valorNumerico;
        rowData.ValorNumerico = valorNumerico;
        rowData.Debito = debito.toFixed(2);
        rowData.Revisado = !!checkedRows[row.id];
      }

      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(registrosExportados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
    XLSX.writeFile(workbook, "auditoria.xlsx");
  };

  return (
    <div>
      {tipo === "atenciones" && (
        <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
          <button onClick={handleEnviarRegistros}>
            {editarAuditoriaId ? "Actualizar Auditoría" : "Cerrar Auditoría"}
          </button>
          <button onClick={exportarAExcel} style={{ marginLeft: "10px" }}>
            Exportar a Excel
          </button>
        </div>
      )}

      <div className="column-toggle" style={{ marginBottom: '10px' }}>
        <strong>Mostrar columnas:</strong>
        {table.getAllLeafColumns().map((column) => (
          <label key={column.id} style={{ marginLeft: '10px' }}>
            <input
              type="checkbox"
              checked={column.getIsVisible()}
              onChange={column.getToggleVisibilityHandler()}
            />
            {column.columnDef.header}
          </label>
        ))}
      </div>

      <button
        onClick={() => setColumnFilters([])}
        style={{
          marginLeft: "10px",
          padding: "5px 10px",
          marginBottom: "10px",
          backgroundColor: 'green',
          color: 'white'
        }}
      >
        Borrar filtros
      </button>

      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            {tipo === 'atenciones' && (
              <tr>
                {table.getVisibleLeafColumns().map((col) => (
                  <th key={col.id} style={{ backgroundColor: '#e0f7fa' }}>
                    {col.columnDef.header === 'Débito $' ? (
                      <span style={{ color: '#00796b', fontWeight: 'bold', fontSize: '1.3rem' }}>
                        Total: ${totalDebito.toFixed(2)}
                      </span>
                    ) : null}
                  </th>
                ))}
              </tr>
            )}

            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' && ' 🔼'}
                    {header.column.getIsSorted() === 'desc' && ' 🔽'}
                    <div>
                      {header.column.getCanFilter() && (
                        <input
                          type="text"
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => header.column.setFilterValue(e.target.value)}
                          placeholder="Filtrar..."
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {paginatedRows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "10px" }}>
          <button onClick={() => setPageIndex((p) => Math.max(p - 1, 0))} disabled={pageIndex === 0}>
            Anterior
          </button>
          <span style={{ margin: "0 10px" }}>
            Página {pageIndex + 1} de {totalPages}
          </span>
          <button onClick={() => setPageIndex((p) => Math.min(p + 1, totalPages - 1))} disabled={pageIndex >= totalPages - 1}>
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablaConFiltro;
