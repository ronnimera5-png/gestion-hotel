/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import "../styles/main.css";
import "../styles/dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState("");
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [todasLasReservas, setTodasLasReservas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const location = useLocation();

  // Cargar y actualizar datos en tiempo real
  useEffect(() => {
    const cargarDatos = () => {
      // Cargar todas las solicitudes
      const dataSolicitudes = localStorage.getItem("solicitudes");
      let solicitudesData = [];
      if (dataSolicitudes) {
        try {
          solicitudesData = JSON.parse(dataSolicitudes);
        } catch (error) {
          console.error("Error cargando solicitudes:", error);
        }
      }

      // Cargar todas las reservas
      const dataReservas = localStorage.getItem("reservasAdmin");
      let reservasData = [];
      if (dataReservas) {
        try {
          reservasData = JSON.parse(dataReservas);
        } catch (error) {
          console.error("Error cargando reservas:", error);
        }
      }

      // Cargar habitaciones
      const dataHabitaciones = localStorage.getItem("habitaciones");
      let habitacionesData = [];
      if (dataHabitaciones) {
        try {
          habitacionesData = JSON.parse(dataHabitaciones);
        } catch (error) {
          console.error("Error cargando habitaciones:", error);
        }
      }
      setHabitaciones(habitacionesData);

      // Cargar clientes
      const dataClientes = localStorage.getItem("clientes");
      let clientesData = [];
      if (dataClientes) {
        try {
          clientesData = JSON.parse(dataClientes);
        } catch (error) {
          console.error("Error cargando clientes:", error);
        }
      }
      setClientes(clientesData);

      // Separar solicitudes pendientes
      const pendientes = solicitudesData.filter(s => 
        s.estado === "Pendiente" || !s.estado
      );
      setSolicitudesPendientes(pendientes);

      // Todas las reservas
      setTodasLasReservas(reservasData);
    };

    // Cargar datos iniciales
    cargarDatos();

    // Actualizar hora
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Escuchar cambios en localStorage
    const handleStorageChange = (e) => {
      if (e.key === "solicitudes" || e.key === "reservasAdmin" || e.key === "habitaciones" || e.key === "clientes") {
        cargarDatos();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Polling: verificar cambios cada 2 segundos
    const pollingInterval = setInterval(cargarDatos, 2000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(pollingInterval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const updateTime = () => {
    const now = new Date();
    setCurrentTime(now.toLocaleString("es-ES"));
  };

  // ========== ESTADÍSTICAS SIMPLIFICADAS ==========
  
  // Calcular estadísticas básicas
  const habitacionesDisponibles = habitaciones.filter(h => h.estado === "Disponible").length;
  const habitacionesOcupadas = habitaciones.filter(h => h.estado === "Ocupada").length;
  const reservasConfirmadas = todasLasReservas.filter(r => r.estado === "Confirmada").length;

  const estadisticas = {
    // 1. HABITACIONES
    habitacionesTotal: habitaciones.length,
    habitacionesDisponibles: habitacionesDisponibles,
    habitacionesOcupadas: habitacionesOcupadas,
    
    // 2. RESERVAS
    totalReservas: todasLasReservas.length,
    reservasConfirmadas: reservasConfirmadas,
    
    // 3. CLIENTES
    totalClientes: clientes.length,
    
    // 4. SOLICITUDES
    solicitudesPendientes: solicitudesPendientes.length,
    
    // 5. TASA DE OCUPACIÓN
    tasaOcupacionTotal: habitaciones.length > 0 
      ? Math.round((habitacionesOcupadas / habitaciones.length) * 100) 
      : 0
  };

  // ========== GRÁFICOS SIMPLIFICADOS ==========
  
  // Solo 2 gráficos esenciales
  const estadoHotelData = {
    labels: ['Disponibles', 'Ocupadas'],
    datasets: [{
      label: 'Estado de Habitaciones',
      data: [
        estadisticas.habitacionesDisponibles,
        estadisticas.habitacionesOcupadas
      ],
      backgroundColor: [
        '#2ecc71', // Verde para Disponibles
        '#e74c3c'  // Rojo para Ocupadas
      ],
      borderWidth: 1
    }]
  };

  const estadoReservasData = {
    labels: ['Confirmadas', 'Totales'],
    datasets: [{
      label: 'Estado de Reservas',
      data: [
        estadisticas.reservasConfirmadas,
        estadisticas.totalReservas
      ],
      backgroundColor: [
        '#2ecc71', // Verde para Confirmadas
        '#3498db'  // Azul para Totales
      ]
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      }
    }
  };

  return (
    <>
      <nav className="sidebar">
        <h2>Hotel ULEAM</h2>
        <ul>
          <li>
            <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/reservas" className={location.pathname === "/reservas" ? "active" : ""}>
              Reservas
            </Link>
          </li>
          <li>
            <Link to="/clientes" className={location.pathname === "/clientes" ? "active" : ""}>
              Clientes
            </Link>
          </li>
          <li>
            <Link to="/habitaciones" className={location.pathname === "/habitaciones" ? "active" : ""}>
              Habitaciones
            </Link>
          </li>
          <li>
            <Link to="/login">
              Cerrar sesión
            </Link>
          </li>
        </ul>
      </nav>

      <main className="content">
        <section id="home" className="section">
          <h2>📊 Dashboard - Hotel ULEAM</h2>
          
          {/* RESUMEN PRINCIPAL - 4 ESTADÍSTICAS BÁSICAS */}
          <div className="summary">
            <div className="box">
              <div className="stat-icon">🏨</div>
              <h3>Habitaciones</h3>
              <p className="stat-number">{estadisticas.habitacionesTotal}</p>
              <p className="stat-subtitle">
                {estadisticas.tasaOcupacionTotal}% ocupación
              </p>
            </div>
            
            <div className="box">
              <div className="stat-icon">📋</div>
              <h3>Reservas</h3>
              <p className="stat-number">{estadisticas.totalReservas}</p>
              <p className="stat-subtitle">
                {estadisticas.reservasConfirmadas} confirmadas
              </p>
            </div>
            
            <div className="box">
              <div className="stat-icon">👥</div>
              <h3>Clientes</h3>
              <p className="stat-number">{estadisticas.totalClientes}</p>
              <p className="stat-subtitle">Registrados</p>
            </div>
            
            <div className="box">
              <div className="stat-icon">⏳</div>
              <h3>Solicitudes</h3>
              <p className="stat-number">{estadisticas.solicitudesPendientes}</p>
              <p className="stat-subtitle">Pendientes</p>
            </div>
          </div>
          
          {/* GRÁFICOS PRINCIPALES - 2 GRÁFICOS SIMPLES */}
          <div className="charts">
            <div className="chart-box">
              <h3>🏨 Estado de Habitaciones</h3>
              <div style={{ width: '100%', height: '300px' }}>
                <Pie data={estadoHotelData} options={pieOptions} />
              </div>
            </div>
            
            <div className="chart-box">
              <h3>📊 Estado de Reservas</h3>
              <div style={{ width: '100%', height: '300px' }}>
                <Pie data={estadoReservasData} options={pieOptions} />
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN RÁPIDA */}
          <div className="quick-links">
            <Link to="/reservas" className="btn">
              📋 Gestionar Reservas
            </Link>
            <Link to="/habitaciones" className="btn">
              🏨 Ver Habitaciones
            </Link>
            <Link to="/clientes" className="btn">
              👥 Ver Clientes
            </Link>
          </div>

          {/* INFORMACIÓN DEL SISTEMA */}
          <div className="current-time">
            <p>🕐 <strong>{currentTime}</strong></p>
            <p className="update-info">
              Sistema actualizado: {new Date().toLocaleTimeString('es-ES')}
            </p>
          </div>
        </section>
      </main>
    </>
  );
}