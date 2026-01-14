/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/main.css";
import "../styles/reservas.css";
import reservasJson from '../data/reservas.json';

export default function Reservas() {
  // Estados para el formulario
  const [formData, setFormData] = useState({
    cliente: "",
    campo: "",
    cedula: "",
    telefono: "",
    fechaIngreso: "",
    fechaSalida: "",
    tipoHabitacion: "individual",
    numeroHabitacion: "",
    adultos: 1,
    ninos: 0
  });

  // Estados para las reservas, solicitudes y habitaciones
  const [reservas, setReservas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [filterHabitacion, setFilterHabitacion] = useState("");
  const [clientes, setClientes] = useState([]);
  const location = useLocation();

  // Cargar datos iniciales
  useEffect(() => {
    cargarReservas();
    cargarSolicitudes();
    cargarHabitaciones();
    cargarClientes();
  }, []);

  // ========== FUNCIONES PARA CLIENTES ==========
  const cargarClientes = () => {
    const data = localStorage.getItem("clientes");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setClientes(parsed);
      } catch (error) {
        console.error("Error cargando clientes:", error);
        setClientes([]);
      }
    } else {
      setClientes([]);
    }
  };

  // ========== FUNCIÓN PARA BUSCAR CLIENTE POR CÉDULA ==========
  const buscarClientePorCedula = () => {
    // Validar cédula
    if (!/^\d{10}$/.test(formData.cedula.trim())) {
      window.alert("La cédula debe tener 10 dígitos");
      return;
    }
    
    // Buscar en clientes
    const clienteEncontrado = clientes.find(c => c.cedula === formData.cedula);
    
    if (clienteEncontrado) {
      // Si EXISTE: Autocompletar
      setFormData(prev => ({
        ...prev,
        cedula: clienteEncontrado.cedula,
        cliente: clienteEncontrado.nombre,
        campo: clienteEncontrado.email || "",
        telefono: clienteEncontrado.telefono || ""
      }));
      window.alert(`✅ Cliente encontrado: ${clienteEncontrado.nombre}`);
    } else {
      // Si NO EXISTE: Preguntar si registrar
      const confirmar = window.confirm(
        `Cliente con cédula ${formData.cedula} no registrado. ¿Desea registrarlo ahora?`
      );
      
      if (confirmar) {
        const nombre = window.prompt("Nombre del cliente:");
        if (!nombre) {
          window.alert("El nombre es obligatorio");
          return;
        }
        
        const email = window.prompt("Correo electrónico:");
        if (!email) {
          window.alert("El correo electrónico es obligatorio");
          return;
        }
        
        const telefono = window.prompt("Teléfono (opcional):", "");
        
        // Crear nuevo cliente
        const nuevoCliente = {
          id: Date.now(),
          cedula: formData.cedula,
          nombre: nombre,
          email: email,
          telefono: telefono || "",
          direccion: window.prompt("Dirección (opcional):", "") || "",
          fechaNacimiento: window.prompt("Fecha de nacimiento (YYYY-MM-DD, opcional):", "") || ""
        };
        
        // Guardar cliente en localStorage
        const nuevosClientes = [...clientes, nuevoCliente];
        localStorage.setItem("clientes", JSON.stringify(nuevosClientes));
        setClientes(nuevosClientes);
        
        // Autocompletar formulario
        setFormData(prev => ({
          ...prev,
          cliente: nombre,
          campo: email,
          telefono: telefono || ""
        }));
        
        window.alert(`✅ Cliente ${nombre} registrado exitosamente`);
      }
    }
  };

  // ========== FUNCIONES PARA HABITACIONES ==========
  
  const cargarHabitaciones = () => {
    const data = localStorage.getItem("habitaciones");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setHabitaciones(parsed);
      } catch (error) {
        console.error("Error cargando habitaciones:", error);
        setHabitaciones([]);
      }
    } else {
      setHabitaciones([]);
    }
  };

  const actualizarEstadoHabitacion = (numeroHabitacion, nuevoEstado) => {
    const habitacionesActualizadas = habitaciones.map(habitacion => 
      habitacion.numero === numeroHabitacion 
        ? { ...habitacion, estado: nuevoEstado } 
        : habitacion
    );
    
    localStorage.setItem("habitaciones", JSON.stringify(habitacionesActualizadas));
    setHabitaciones(habitacionesActualizadas);
  };

  // ========== FUNCIONES PARA RESERVAS ==========
  
  const cargarReservas = () => {
    try {
      // 1. Primero intentar cargar desde localStorage
      const datosLocal = localStorage.getItem("reservasAdmin");
      
      if (datosLocal) {
        try {
          const parsed = JSON.parse(datosLocal);
          if (parsed.length > 0) {
            console.log("✅ Reservas cargadas de localStorage:", parsed.length);
            setReservas(parsed);
            return;
          }
        } catch (error) {
          console.error("Error parseando localStorage:", error);
        }
      }
      
      // 2. Si no hay en localStorage, usar el JSON importado
      console.log("📦 Usando JSON importado de src/data/:", reservasJson);
      
      // Transformar datos del JSON a tu formato
      const reservasFormateadas = reservasJson.map((item, index) => ({
        id: index + 1,
        cliente: item.cliente,
        cedula: item.cedula || `0102030${400 + index}`,
        ingreso: item.ingreso,
        salida: item.salida,
        tipoHabitacion: (item.habitacion || "individual").toLowerCase(),
        numeroHabitacion: item.numeroHabitacion || `20${index + 1}`,
        precioNoche: item.habitacion === "Suite" ? 120 : item.habitacion === "Doble" ? 80 : 50,
        adultos: item.adultos || 1,
        ninos: item.ninos || 0,
        estado: "Confirmada",
        origen: "JSON inicial"
      }));
      
      console.log("🔄 Datos formateados:", reservasFormateadas.length, "reservas");
      
      // 3. Guardar en localStorage para la próxima vez
      localStorage.setItem("reservasAdmin", JSON.stringify(reservasFormateadas));
      
      // 4. Actualizar estado
      setReservas(reservasFormateadas);
      
    } catch (error) {
      console.error("❌ ERROR en carga de reservas:", error);
      setReservas([]);
    }
  };

  const guardarReservasEnLocalStorage = (nuevasReservas) => {
    localStorage.setItem("reservasAdmin", JSON.stringify(nuevasReservas));
    setReservas(nuevasReservas);
  };

  // ========== FUNCIONES PARA SOLICITUDES ==========
  
  const cargarSolicitudes = () => {
    const data = localStorage.getItem("solicitudes");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Filtrar solo las solicitudes pendientes
        const solicitudesPendientes = parsed.filter(sol => 
          sol.estado !== "Confirmada" && sol.estado !== "Cancelada"
        );
        setSolicitudes(solicitudesPendientes);
      } catch (error) {
        console.error("Error cargando solicitudes:", error);
        setSolicitudes([]);
      }
    } else {
      setSolicitudes([]);
    }
  };

  // ========== TRANSFERIR SOLICITUD A RESERVAS ==========
  
  const transferirSolicitudAReserva = (solicitud) => {
    // Encontrar una habitación disponible del tipo solicitado
    const tipoSolicitado = solicitud.tipo?.toLowerCase() || "individual";
    const habitacionDisponible = habitaciones.find(h => 
      h.tipo === tipoSolicitado && h.estado === "Disponible"
    );

    if (!habitacionDisponible) {
      window.alert(`No hay habitaciones ${tipoSolicitado} disponibles en este momento`);
      return;
    }

    // Crear nueva reserva basada en la solicitud
    const nuevaReserva = {
      id: Date.now(),
      cliente: solicitud.nombre || solicitud.cliente,
      correo: solicitud.correo || "",
      cedula: solicitud.cedula || "",
      telefono: "",
      ingreso: solicitud.ingreso,
      salida: solicitud.salida,
      tipoHabitacion: tipoSolicitado,
      numeroHabitacion: habitacionDisponible.numero,
      precioNoche: habitacionDisponible.precio,
      adultos: solicitud.adultos || 1,
      ninos: solicitud.ninos || 0,
      estado: "Confirmada",
      fechaCreacion: new Date().toISOString(),
      origen: "Solicitud Web"
    };

    // 1. Agregar a reservas
    const nuevasReservas = [...reservas, nuevaReserva];
    guardarReservasEnLocalStorage(nuevasReservas);

    // 2. Actualizar estado de la habitación a "Ocupada"
    actualizarEstadoHabitacion(habitacionDisponible.numero, "Ocupada");

    // 3. Actualizar el estado de la solicitud
    const todasLasSolicitudes = JSON.parse(localStorage.getItem("solicitudes") || "[]");
    const solicitudesActualizadas = todasLasSolicitudes.map(sol => 
      sol.correo === solicitud.correo && sol.ingreso === solicitud.ingreso
        ? { ...sol, estado: "Confirmada" }
        : sol
    );
    
    localStorage.setItem("solicitudes", JSON.stringify(solicitudesActualizadas));
    
    // 4. Actualizar estado local (filtrar las confirmadas)
    const solicitudesPendientes = solicitudesActualizadas.filter(sol => 
      sol.estado !== "Confirmada" && sol.estado !== "Cancelada"
    );
    setSolicitudes(solicitudesPendientes);

    window.alert(`✅ Solicitud de ${nuevaReserva.cliente} confirmada. Habitación ${habitacionDisponible.numero} asignada.`);
  };

  // ========== FUNCIONES PARA BOTONES DE SOLICITUDES ==========
  
  const confirmarSolicitud = (solicitud) => {
    if (window.confirm(`¿Confirmar solicitud de ${solicitud.cliente} y asignar habitación?`)) {
      transferirSolicitudAReserva(solicitud);
    }
  };

  const cancelarSolicitud = (id) => {
    if (window.confirm("¿Cancelar esta solicitud?")) {
      const todasLasSolicitudes = JSON.parse(localStorage.getItem("solicitudes") || "[]");
      const solicitudesActualizadas = todasLasSolicitudes.map(sol => 
        sol.id === id ? { ...sol, estado: "Cancelada" } : sol
      );
      
      localStorage.setItem("solicitudes", JSON.stringify(solicitudesActualizadas));
      
      const solicitudesPendientes = solicitudesActualizadas.filter(sol => 
        sol.estado !== "Confirmada" && sol.estado !== "Cancelada"
      );
      setSolicitudes(solicitudesPendientes);
      
      window.alert("❌ Solicitud cancelada");
    }
  };

  // ========== MANEJADORES DE FORMULARIO Y VALIDACIONES ==========
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validaEmail = () => {
    const re = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    if (!re.test(formData.campo)) {
      window.alert("Correo no válido");
      return false;
    }
    return true;
  };

  const validarNombre = () => {
    if (!formData.cliente.trim()) {
      window.alert("El nombre no puede estar vacío");
      return false;
    }
    return true;
  };

  const validaNum = () => {
    if (formData.telefono && isNaN(formData.telefono)) {
      window.alert("Teléfono debe ser numérico");
      return false;
    }
    return true;
  };

  const validaCedula = () => {
    if (!/^\d{10}$/.test(formData.cedula.trim())) {
      window.alert("La cédula debe tener 10 dígitos");
      return false;
    }
    return true;
  };

  const validaFechas = () => {
    if (!formData.fechaIngreso || !formData.fechaSalida) {
      window.alert("Completa ambas fechas");
      return false;
    }
    if (new Date(formData.fechaSalida) <= new Date(formData.fechaIngreso)) {
      window.alert("La salida debe ser después del ingreso");
      return false;
    }
    return true;
  };

  // Obtener habitaciones disponibles del tipo seleccionado
  const obtenerHabitacionesDisponibles = () => {
    return habitaciones.filter(h => 
      h.tipo === formData.tipoHabitacion && 
      h.estado === "Disponible"
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarNombre() || !validaEmail() || !validaCedula() || !validaNum() || !validaFechas()) {
      return;
    }

    // Verificar que se haya seleccionado una habitación
    if (!formData.numeroHabitacion) {
      window.alert("Por favor selecciona una habitación disponible");
      return;
    }

    // Encontrar la habitación seleccionada
    const habitacionSeleccionada = habitaciones.find(h => h.numero === formData.numeroHabitacion);
    if (!habitacionSeleccionada || habitacionSeleccionada.estado !== "Disponible") {
      window.alert("La habitación seleccionada ya no está disponible");
      return;
    }

    const nuevaReserva = {
      id: Date.now(),
      cliente: formData.cliente,
      correo: formData.campo,
      cedula: formData.cedula,
      telefono: formData.telefono,
      ingreso: formData.fechaIngreso,
      salida: formData.fechaSalida,
      tipoHabitacion: formData.tipoHabitacion,
      numeroHabitacion: formData.numeroHabitacion,
      precioNoche: habitacionSeleccionada.precio,
      adultos: parseInt(formData.adultos),
      ninos: parseInt(formData.ninos),
      estado: "Pendiente",
      fechaCreacion: new Date().toISOString(),
      origen: "Formulario Admin"
    };

    // 1. Agregar reserva
    const nuevasReservas = [...reservas, nuevaReserva];
    guardarReservasEnLocalStorage(nuevasReservas);

    // 2. Actualizar estado de la habitación a "Ocupada"
    actualizarEstadoHabitacion(formData.numeroHabitacion, "Ocupada");

    window.alert("✅ Reserva creada correctamente. Habitación asignada.");

    // Limpiar formulario (mantener solo cédula)
    setFormData(prev => ({
      ...prev,
      cliente: "",
      campo: "",
      telefono: "",
      fechaIngreso: "",
      fechaSalida: "",
      tipoHabitacion: "individual",
      numeroHabitacion: "",
      adultos: 1,
      ninos: 0
    }));
  };

  // ========== FUNCIONES MEJORADAS PARA RESERVAS ==========

  const confirmReserva = (id) => {
    const reserva = reservas.find(r => r.id === id);
    if (!reserva) return;

    // Si la reserva ya está confirmada, no hacer nada
    if (reserva.estado === "Confirmada") {
      window.alert("Esta reserva ya está confirmada");
      return;
    }

    // Verificar que la habitación aún esté asignada a esta reserva
    const habitacion = habitaciones.find(h => h.numero === reserva.numeroHabitacion);
    if (!habitacion) {
      window.alert("Error: La habitación asignada no existe");
      return;
    }

    // Si la habitación no está ocupada por esta reserva, verificar
    if (habitacion.estado === "Disponible") {
      const confirmar = window.confirm(
        `La habitación ${reserva.numeroHabitacion} está disponible. ¿Confirmar reserva y ocupar la habitación?`
      );
      if (!confirmar) return;
      
      // Ocupar la habitación
      actualizarEstadoHabitacion(reserva.numeroHabitacion, "Ocupada");
    }

    const nuevasReservas = reservas.map(r => 
      r.id === id ? { ...r, estado: "Confirmada" } : r
    );
    guardarReservasEnLocalStorage(nuevasReservas);
    window.alert("✅ Reserva confirmada exitosamente");
  };

  const liberarHabitacion = (id) => {
    const reserva = reservas.find(r => r.id === id);
    if (!reserva) return;

    if (!reserva.numeroHabitacion) {
      window.alert("Esta reserva no tiene habitación asignada");
      return;
    }

    if (window.confirm(`¿Liberar habitación ${reserva.numeroHabitacion} y marcar reserva como Completada?`)) {
      // 1. Liberar la habitación
      actualizarEstadoHabitacion(reserva.numeroHabitacion, "Disponible");
      
      // 2. Cambiar estado de la reserva a "Completada" (no eliminarla)
      const nuevasReservas = reservas.map(r => 
        r.id === id ? { ...r, estado: "Completada" } : r
      );
      
      guardarReservasEnLocalStorage(nuevasReservas);
      window.alert(`✅ Habitación ${reserva.numeroHabitacion} liberada. Reserva marcada como Completada.`);
    }
  };

  const cancelReserva = (id) => {
    if (window.confirm("¿Estás seguro de CANCELAR y ELIMINAR esta reserva?")) {
      const reserva = reservas.find(r => r.id === id);
      const nuevasReservas = reservas.filter(r => r.id !== id);
      guardarReservasEnLocalStorage(nuevasReservas);
      
      // Liberar la habitación si estaba asignada
      if (reserva && reserva.numeroHabitacion) {
        actualizarEstadoHabitacion(reserva.numeroHabitacion, "Disponible");
      }
      
      window.alert("🗑️ Reserva eliminada y habitación liberada");
    }
  };

  const editReserva = (id) => {
    const reserva = reservas.find(r => r.id === id);
    if (!reserva) return;

    // Solo permitir editar ciertos campos si la reserva no está confirmada
    if (reserva.estado === "Confirmada") {
      window.alert("No se puede editar una reserva confirmada. Use 'Liberar Habitación' primero.");
      return;
    }

    const nuevoCliente = window.prompt("Cliente:", reserva.cliente) || reserva.cliente;
    const nuevoIngreso = window.prompt("Ingreso (YYYY-MM-DD):", reserva.ingreso) || reserva.ingreso;
    const nuevoSalida = window.prompt("Salida (YYYY-MM-DD):", reserva.salida) || reserva.salida;
    
    // Solo permitir cambiar habitación si la reserva no está confirmada
    let nuevoTipoHabitacion = reserva.tipoHabitacion;
    let nuevoNumeroHabitacion = reserva.numeroHabitacion;
    
    if (reserva.estado !== "Confirmada") {
      const cambiarHabitacion = window.confirm("¿Desea cambiar la habitación asignada?");
      if (cambiarHabitacion) {
        // Mostrar tipos disponibles
        const tipos = ["individual", "doble", "suite"];
        const tipoSeleccionado = window.prompt(
          "Tipo (individual/doble/suite):", 
          reserva.tipoHabitacion
        );
        
        if (tipoSeleccionado && tipos.includes(tipoSeleccionado.toLowerCase())) {
          nuevoTipoHabitacion = tipoSeleccionado.toLowerCase();
          
          // Buscar habitación disponible del nuevo tipo
          const habitacionesDisponibles = habitaciones.filter(h => 
            h.tipo === nuevoTipoHabitacion && h.estado === "Disponible"
          );
          
          if (habitacionesDisponibles.length > 0) {
            // Liberar la habitación anterior
            if (reserva.numeroHabitacion) {
              actualizarEstadoHabitacion(reserva.numeroHabitacion, "Disponible");
            }
            
            // Asignar nueva habitación
            nuevoNumeroHabitacion = habitacionesDisponibles[0].numero;
            actualizarEstadoHabitacion(nuevoNumeroHabitacion, "Ocupada");
            
            window.alert(`Habitación cambiada a ${nuevoNumeroHabitacion}`);
          } else {
            window.alert(`No hay habitaciones ${nuevoTipoHabitacion} disponibles`);
            return;
          }
        }
      }
    }
    
    const nuevoAdultos = window.prompt("Adultos:", reserva.adultos) || reserva.adultos;
    const nuevoNinos = window.prompt("Niños:", reserva.ninos) || reserva.ninos;

    const nuevasReservas = reservas.map(r => 
      r.id === id ? {
        ...r,
        cliente: nuevoCliente,
        ingreso: nuevoIngreso,
        salida: nuevoSalida,
        tipoHabitacion: nuevoTipoHabitacion,
        numeroHabitacion: nuevoNumeroHabitacion,
        adultos: parseInt(nuevoAdultos),
        ninos: parseInt(nuevoNinos)
      } : r
    );
    
    guardarReservasEnLocalStorage(nuevasReservas);
    window.alert("✏️ Reserva actualizada");
  };

  // ========== FUNCIONES DE FILTRO ==========
  
  const aplicarFiltro = () => {
    if (!filterHabitacion) {
      window.alert("Mostrando todas las reservas");
    } else {
      window.alert(`Filtrando por: ${filterHabitacion}`);
    }
  };

  // Filtrar reservas
  const reservasFiltradas = filterHabitacion 
    ? reservas.filter(reserva => reserva.tipoHabitacion === filterHabitacion)
    : reservas;

  return (
    <>
      <nav className="sidebar">
        <h2>Hotel ULEAM</h2>
        <ul>
          <li><Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>Dashboard</Link></li>
          <li><Link to="/reservas" className={location.pathname === "/reservas" ? "active" : ""}>Reservas</Link></li>
          <li><Link to="/clientes" className={location.pathname === "/clientes" ? "active" : ""}>Clientes</Link></li>
          <li><Link to="/habitaciones" className={location.pathname === "/habitaciones" ? "active" : ""}>Habitaciones</Link></li>
          <li><Link to="/logout">Cerrar sesión</Link></li>
        </ul>
      </nav>

      <main className="content">
        <section id="reservas">
          <h2>Gestionar Reservas</h2>

          <form id="reservas-form" className="reservation-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cedula">Número de Cédula:</label>
                <div className="cedula-search-container">
                  <input 
                    type="text" 
                    id="cedula" 
                    name="cedula" 
                    value={formData.cedula} 
                    onChange={handleInputChange} 
                    placeholder="Ej: 0102030405" 
                    required 
                  />
                  <button 
                    type="button" 
                    className="btn-search" 
                    onClick={buscarClientePorCedula}
                    style={{ marginLeft: '10px', padding: '8px 16px' }}
                  >
                    🔍 Buscar
                  </button>
                </div>
              </div>
            </div>

            <label htmlFor="cliente">Nombre del Cliente:</label>
            <input type="text" id="cliente" name="cliente" value={formData.cliente} onChange={handleInputChange} placeholder="Ingresa el nombre completo" required />

            <label htmlFor="campo">Correo electrónico:</label>
            <input type="text" id="campo" name="campo" value={formData.campo} onChange={handleInputChange} placeholder="Ingresa tu correo electrónico" required />
            
            <label htmlFor="telefono">Teléfono:</label>
            <input type="text" id="telefono" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Ingresa tu teléfono (opcional)" />

            <label htmlFor="fecha-ingreso">Fecha de Ingreso:</label>
            <input type="date" id="fecha-ingreso" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleInputChange} required />

            <label htmlFor="fecha-salida">Fecha de Salida:</label>
            <input type="date" id="fecha-salida" name="fechaSalida" value={formData.fechaSalida} onChange={handleInputChange} required />

            <label htmlFor="tipo-habitacion">Tipo de Habitación:</label>
            <select 
              id="tipo-habitacion" 
              name="tipoHabitacion" 
              value={formData.tipoHabitacion} 
              onChange={handleInputChange} 
              required
            >
              <option value="individual">Individual</option>
              <option value="doble">Doble</option>
              <option value="suite">Suite</option>
            </select>

            <label htmlFor="numero-habitacion">Habitación Disponible:</label>
            <select 
              id="numero-habitacion" 
              name="numeroHabitacion"
              value={formData.numeroHabitacion}
              onChange={handleInputChange}
              required
              disabled={!formData.tipoHabitacion}
            >
              <option value="">{formData.tipoHabitacion ? "Selecciona una habitación" : "Selecciona tipo primero"}</option>
              {obtenerHabitacionesDisponibles().map(habitacion => (
                <option key={habitacion.id} value={habitacion.numero}>
                  Habitación {habitacion.numero} - ${habitacion.precio}/noche
                </option>
              ))}
              {obtenerHabitacionesDisponibles().length === 0 && formData.tipoHabitacion && (
                <option value="" disabled>
                  No hay habitaciones {formData.tipoHabitacion} disponibles
                </option>
              )}
            </select>

            <label htmlFor="adultos">Adultos:</label>
            <input type="number" id="adultos" name="adultos" value={formData.adultos} onChange={handleInputChange} min="1" required />

            <label htmlFor="ninos">Niños:</label>
            <input type="number" id="ninos" name="ninos" value={formData.ninos} onChange={handleInputChange} min="0" required />

            <button type="submit" className="btn">Crear Reserva</button>
          </form>

          <div className="solicitudes-container">
            <h3>Solicitudes Pendientes de la Web</h3>
            {solicitudes.length === 0 ? (
              <p className="no-data">No hay solicitudes pendientes.</p>
            ) : (
              <table id="tabla-solicitudes">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Correo</th>
                    <th>Habitación</th>
                    <th>Ingreso</th>
                    <th>Salida</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map(solicitud => (
                    <tr key={solicitud.id || solicitud.correo}>
                      <td>{solicitud.nombre || solicitud.cliente}</td>
                      <td>{solicitud.correo}</td>
                      <td>{solicitud.tipo}</td>
                      <td>{solicitud.ingreso}</td>
                      <td>{solicitud.salida}</td>
                      <td>
                        <button className="btn-confirmar" onClick={() => confirmarSolicitud(solicitud)}>
                          ✅ Aceptar y asignar Habitación
                        </button>
                        <button className="btn-cancelar" onClick={() => cancelarSolicitud(solicitud.id)}>
                          ❌ Rechazar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="filters">
            <h3>Buscar Reservas</h3>
            <select id="filter-habitacion" value={filterHabitacion} onChange={(e) => setFilterHabitacion(e.target.value)}>
              <option value="">Filtrar por tipo de habitación</option>
              <option value="individual">Individual</option>
              <option value="doble">Doble</option>
              <option value="suite">Suite</option>
            </select>
            <button onClick={aplicarFiltro} className="btn" type="button">Aplicar Filtros</button>
          </div>

          <div id="lista-reservas">
            <h3>Reservas Existentes</h3>
            {reservas.length === 0 ? (
              <p className="no-data">No hay reservas registradas.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Cédula</th>
                    <th>Ingreso</th>
                    <th>Salida</th>
                    <th>Tipo Hab.</th>
                    <th>N° Hab.</th>
                    <th>Adultos</th>
                    <th>Niños</th>
                    <th>Estado</th>
                    <th>Origen</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservasFiltradas.map(reserva => (
                    <tr key={reserva.id} style={{
                      backgroundColor: reserva.estado === "Confirmada" ? '#d4edda' : 
                                     reserva.estado === "Completada" ? '#e8f4fc' :
                                     reserva.estado === "Denegada" ? '#f8d7da' : 
                                     reserva.estado === "Cancelada" ? '#f5f5f5' : 'transparent'
                    }}>
                      <td>{reserva.cliente}</td>
                      <td>{reserva.cedula}</td>
                      <td>{reserva.ingreso}</td>
                      <td>{reserva.salida}</td>
                      <td>{reserva.tipoHabitacion}</td>
                      <td>
                        {reserva.numeroHabitacion || "No asignada"}
                        {reserva.precioNoche && (
                          <div style={{ fontSize: '11px', color: '#666' }}>
                            ${reserva.precioNoche}/noche
                          </div>
                        )}
                      </td>
                      <td>{reserva.adultos}</td>
                      <td>{reserva.ninos}</td>
                      <td>
                        <span className={`estado-badge ${reserva.estado?.toLowerCase() || 'pendiente'}`}>
                          {reserva.estado || "Pendiente"}
                        </span>
                      </td>
                      <td>
                        <span className="origen-badge">
                          {reserva.origen || "Admin"}
                        </span>
                      </td>
                      <td>
                        <button className="btn confirm-btn" onClick={() => confirmReserva(reserva.id)} disabled={reserva.estado === "Confirmada" || reserva.estado === "Completada"}>
                          Confirmar
                        </button>
                        <button className="btn liberar-btn" onClick={() => liberarHabitacion(reserva.id)} disabled={reserva.estado === "Completada" || !reserva.numeroHabitacion}>
                          Liberar Hab.
                        </button>
                        <button className="btn edit-btn" onClick={() => editReserva(reserva.id)} disabled={reserva.estado === "Confirmada" || reserva.estado === "Completada"}>
                          Editar
                        </button>
                        <button className="btn cancel-btn" onClick={() => cancelReserva(reserva.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </>
  );
}