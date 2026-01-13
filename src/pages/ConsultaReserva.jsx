/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/main.css";
import "../styles/consulta.css";

export default function ConsultaReserva() {
  const [cedula, setCedula] = useState("");
  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState("");
  const [buscando, setBuscando] = useState(false);

  const buscarReservas = () => {
    // Validar cédula
    if (!/^\d{10}$/.test(cedula)) {
      setError("❌ La cédula debe tener 10 dígitos numéricos");
      setReservas([]);
      return;
    }

    setBuscando(true);
    setError("");

    // Pequeño delay para mostrar el estado de "buscando"
    setTimeout(() => {
      // Buscar en reservas del admin
      const todasReservas = JSON.parse(localStorage.getItem("reservasAdmin") || "[]");
      
      // Buscar reservas con esta cédula
      const reservasCliente = todasReservas.filter(r => 
        r.cedula && r.cedula.toString() === cedula
      );

      // Buscar en solicitudes pendientes de la web
      const todasSolicitudes = JSON.parse(localStorage.getItem("solicitudes") || "[]");
      const solicitudesCliente = todasSolicitudes.filter(s =>
        s.cedula && s.cedula.toString() === cedula
      );

      // Combinar resultados
      const todosResultados = [
        ...reservasCliente.map(r => ({ 
          ...r, 
          tipo: 'reserva',
          origen: r.origen || 'Administración'
        })),
        ...solicitudesCliente.map(s => ({ 
          ...s, 
          tipo: 'solicitud',
          estado: s.estado || 'Pendiente',
          cliente: s.nombre || s.cliente,
          origen: 'Web'
        }))
      ];

      // Ordenar por fecha más reciente
      todosResultados.sort((a, b) => 
        new Date(b.fechaCreacion || b.ingreso || 0) - 
        new Date(a.fechaCreacion || a.ingreso || 0)
      );

      if (todosResultados.length === 0) {
        setError("❌ No se encontraron reservas con esta cédula");
      }

      setReservas(todosResultados);
      setBuscando(false);
    }, 500);
  };

  const getEstadoTexto = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'confirmada': return '✅ Confirmada';
      case 'pendiente': return '⏳ Pendiente';
      case 'completada': return '🏁 Completada';
      case 'cancelada': return '❌ Cancelada';
      default: return '⏳ Pendiente';
    }
  };

  const getEstadoColor = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'confirmada': return '#2ecc71';
      case 'pendiente': return '#f39c12';
      case 'completada': return '#3498db';
      case 'cancelada': return '#e74c3c';
      default: return '#f39c12';
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="consulta-page">
      {/* HEADER SIMILAR AL INICIO */}
      <header className="header">
        <div className="logo-container">
          <img src="/img/logo.png" alt="Logo del hotel" className="logo" />
          <h1>Hotel ULEAM</h1>
        </div>

        <nav className="navbar">
          <Link to="/">Inicio</Link>
          <Link to="/consultar" style={{color: '#3498db', fontWeight: 'bold'}}>
            🔍 Consultar Reserva
          </Link>
          <Link to="/login">Acceder</Link>
        </nav>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        <div className="consulta-container">
          {/* HEADER */}
          <div className="consulta-header">
            <h1>🔍 Consulta tus Reservas</h1>
            <p>Ingresa tu número de cédula para ver el estado de todas tus reservas</p>
          </div>

          {/* FORMULARIO DE BÚSQUEDA */}
          <div className="busqueda-form">
            <div className="input-group">
              <input 
                type="text" 
                placeholder="Ejemplo: 0102030405" 
                value={cedula}
                onChange={(e) => {
                  // Solo permitir números
                  const valor = e.target.value.replace(/\D/g, '');
                  setCedula(valor);
                  setError("");
                }}
                maxLength="10"
                className="cedula-input"
              />
              <button 
                onClick={buscarReservas} 
                className="btn btn-buscar"
                disabled={buscando}
              >
                {buscando ? "🔍 Buscando..." : "🔍 Buscar"}
              </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="info-ayuda">
              <p>💡 <strong>Información importante:</strong></p>
              <ul>
                <li>Usa el mismo número de cédula que ingresaste al hacer la reserva</li>
                <li>Verás tanto reservas confirmadas como solicitudes pendientes</li>
                <li>Las reservas se ordenan de la más reciente a la más antigua</li>
                <li>Tu información es confidencial y segura</li>
              </ul>
            </div>
          </div>

          {/* RESULTADOS */}
          {reservas.length > 0 ? (
            <div className="resultados-container">
              <h3>📋 Tus Reservas ({reservas.length})</h3>
              
              <div className="reservas-list">
                {reservas.map((reserva, index) => (
                  <div key={reserva.id || index} className="reserva-card">
                    <div className="reserva-header">
                      <h4>{reserva.cliente || reserva.nombre}</h4>
                      <span 
                        className="estado-badge" 
                        style={{ backgroundColor: getEstadoColor(reserva.estado) }}
                      >
                        {getEstadoTexto(reserva.estado)}
                      </span>
                    </div>
                    
                    <div className="reserva-detalles">
                      <div className="detalle-row">
                        <span className="detalle-label">📅 Fechas:</span>
                        <span className="detalle-value">
                          {formatFecha(reserva.ingreso)} → {formatFecha(reserva.salida)}
                        </span>
                      </div>
                      
                      <div className="detalle-row">
                        <span className="detalle-label">🏨 Tipo:</span>
                        <span className="detalle-value">
                          {reserva.tipoHabitacion || reserva.tipo || 'No especificado'}
                          {reserva.numeroHabitacion && ` (Habitación ${reserva.numeroHabitacion})`}
                        </span>
                      </div>
                      
                      <div className="detalle-row">
                        <span className="detalle-label">👥 Personas:</span>
                        <span className="detalle-value">
                          {reserva.adultos || 1} adulto(s), {reserva.ninos || 0} niño(s)
                        </span>
                      </div>
                      
                      <div className="detalle-row">
                        <span className="detalle-label">📧 Contacto:</span>
                        <span className="detalle-value">
                          {reserva.correo || reserva.campo || 'No especificado'}
                        </span>
                      </div>
                      
                      <div className="detalle-row">
                        <span className="detalle-label">📍 Origen:</span>
                        <span className="detalle-value">
                          {reserva.origen === 'Solicitud Web' ? 'Reserva Web' : reserva.origen || 'Administración'}
                        </span>
                      </div>
                      
                      {reserva.tipo === 'solicitud' && (
                        <div className="nota-solicitud">
                          ⏳ <strong>Importante:</strong> Esta es una solicitud pendiente de revisión por el administrador del hotel.
                          Te contactaremos pronto para confirmar tu reserva.
                        </div>
                      )}
                    </div>
                    
                    <div className="reserva-footer">
                      <small className="fecha-creacion">
                        Creada: {formatFecha(reserva.fechaCreacion || reserva.ingreso)}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !error && cedula && (
              <div className="no-reservas">
                <div className="icono">📭</div>
                <h3>No hay reservas registradas</h3>
                <p>No se encontraron reservas con la cédula ingresada.</p>
                <p>Verifica el número o haz una nueva reserva.</p>
              </div>
            )
          )}

          {/* ENLACE PARA NUEVA RESERVA */}
          <div className="nueva-reserva-link">
            <Link to="/" className="btn">
              ← Volver al inicio para hacer una nueva reserva
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}