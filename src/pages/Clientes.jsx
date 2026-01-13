/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/main.css";
import "../styles/clientes.css";

export default function Clientes() {
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    fechaNacimiento: ""
  });

  const [clientes, setClientes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null); // ← COMENTADO porque no se usa
  const location = useLocation();

  // Función para guardar clientes en LocalStorage
  const guardarClientes = (nuevosClientes) => {
    console.log("💾 Guardando clientes:", nuevosClientes.length, "clientes");
    localStorage.setItem("clientes", JSON.stringify(nuevosClientes));
    setClientes(nuevosClientes);
  };

  // Cargar clientes desde JSON y combinar con LocalStorage
  useEffect(() => {
    const cargarClientes = async () => {
      console.log("🔄 Iniciando carga de clientes...");
      setLoading(true);
      
      try {
        // 1. Primero ver LocalStorage
        const datosLocal = localStorage.getItem("clientes");
        console.log("📁 LocalStorage tiene 'clientes'?", datosLocal ? "SÍ" : "NO");
        
        if (datosLocal) {
          // Usar datos existentes de LocalStorage
          const parsed = JSON.parse(datosLocal);
          console.log(`✅ ${parsed.length} clientes cargados de LocalStorage`);
          setClientes(parsed);
          setLoading(false);
          return;
        }
        
        // 2. Si no hay en LocalStorage, intentar cargar JSON
        console.log("📭 Intentando cargar desde JSON...");
        
        // PRUEBA 1: Ruta directa
        console.log("📍 Probando ruta: /data/clientes.json");
        let response = await fetch("/data/clientes.json");
        
        // PRUEBA 2: Si falla, probar otra ruta
        if (!response.ok) {
          console.log("📍 Probando ruta: ./data/clientes.json");
          response = await fetch("./data/clientes.json");
        }
        
        // PRUEBA 3: Si aún falla, probar con origin
        if (!response.ok) {
          const url = `${window.location.origin}/data/clientes.json`;
          console.log("📍 Probando ruta:", url);
          response = await fetch(url);
        }
        
        if (!response.ok) {
          throw new Error(`No se pudo cargar JSON. Status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        console.log("🎉 JSON cargado exitosamente:", jsonData.length, "clientes");
        
        // Guardar en estado
        setClientes(jsonData);
        
        // Guardar en LocalStorage para la próxima
        localStorage.setItem("clientes", JSON.stringify(jsonData));
        console.log("💾 Guardado en LocalStorage");
        
      } catch (error) {
        console.error("❌ ERROR en carga:", error);
        
        // Si todo falla, usar estos datos de EMERGENCIA
        const datosEmergencia = [
          {
            id: 1,
            cedula: "0102030405",
            nombre: "Carlos Mera (EMERGENCIA)",
            email: "carlos.mera@mail.com",
            telefono: "099887766",
            direccion: "Av. Libertad 302",
            fechaNacimiento: "1998-06-11"
          },
          {
            id: 2,
            cedula: "1122334455",
            nombre: "Andrea Torres (EMERGENCIA)",
            email: "andrea.torres@mail.com",
            telefono: "099112233",
            direccion: "Cdla. Kennedy Norte",
            fechaNacimiento: "1995-02-08"
          }
        ];
        
        console.log("🚨 Usando datos de emergencia");
        setClientes(datosEmergencia);
        localStorage.setItem("clientes", JSON.stringify(datosEmergencia));
        
      } finally {
        setLoading(false);
        console.log("🏁 Carga completada");
      }
    };
    
    cargarClientes();
  }, []); // ← Aquí estaba el warning de missing dependency, pero está bien así

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validaciones
  const validaCedulaCliente = () => {
    const cedula = formData.cedula.trim();
    if (!/^\d{10}$/.test(cedula)) {
      window.alert("La cédula debe tener 10 dígitos");
      return false;
    }
    return true;
  };

  const validarNombreCliente = () => {
    if (!formData.nombre.trim()) {
      window.alert("El nombre no puede estar vacío");
      return false;
    }
    return true;
  };

  const validaEmailCliente = () => {
    const email = formData.email;
    if (!(/\w+@\w+\.\w+/.test(email))) {
      window.alert("El correo electrónico no es válido");
      return false;
    }
    return true;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validaCedulaCliente() || !validarNombreCliente() || !validaEmailCliente()) {
      return;
    }

    // Verificar si la cédula ya existe
    const clienteExistente = clientes.find(cliente => cliente.cedula === formData.cedula);
    if (clienteExistente) {
      window.alert("Ya existe un cliente con esta cédula");
      return;
    }

    const nuevoCliente = {
      id: Date.now(),
      cedula: formData.cedula,
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      direccion: formData.direccion,
      fechaNacimiento: formData.fechaNacimiento
    };

    const nuevosClientes = [...clientes, nuevoCliente];
    guardarClientes(nuevosClientes);
    
    window.alert("Cliente registrado correctamente.");
    
    // Limpiar formulario
    setFormData({
      cedula: "",
      nombre: "",
      email: "",
      telefono: "",
      direccion: "",
      fechaNacimiento: ""
    });
  };

  // Funciones CRUD
  const editCliente = (id) => {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;

    const nuevosClientes = clientes.map(c => {
      if (c.id === id) {
        return {
          ...c,
          nombre: window.prompt("Nombre:", c.nombre) || c.nombre,
          email: window.prompt("Email:", c.email) || c.email,
          telefono: window.prompt("Teléfono:", c.telefono) || c.telefono,
          direccion: window.prompt("Dirección:", c.direccion) || c.direccion,
          fechaNacimiento: window.prompt("Fecha Nacimiento:", c.fechaNacimiento) || c.fechaNacimiento
        };
      }
      return c;
    });

    guardarClientes(nuevosClientes);
  };

  const deleteCliente = (id) => {
    if (window.confirm("¿Seguro deseas eliminar este cliente?")) {
      const nuevosClientes = clientes.filter(c => c.id !== id);
      guardarClientes(nuevosClientes);
    }
  };

  // Filtrar clientes según búsqueda
  const clientesFiltrados = searchQuery 
    ? clientes.filter(cliente => 
        cliente.cedula.includes(searchQuery) ||
        cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : clientes;

  // Mostrar estado de carga
  if (loading) {
    return (
      <>
        <nav className="sidebar">
          <h2>Hotel ULEAM</h2>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/reservas">Reservas</Link></li>
            <li><Link to="/clientes" className="active">Clientes</Link></li>
            <li><Link to="/habitaciones">Habitaciones</Link></li>
            <li><Link to="/logout">Cerrar sesión</Link></li>
          </ul>
        </nav>
        <main className="content">
          <div style={{ textAlign: "center", padding: "50px" }}>
            <h2>Cargando clientes...</h2>
            <p>Por favor espera...</p>
          </div>
        </main>
      </>
    );
  }

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
            <Link to="/logout">
              Cerrar sesión
            </Link>
          </li>
        </ul>
      </nav>

      <main className="content">
        <section id="clientes">
          <h2>Gestión de Clientes ({clientes.length} clientes)</h2>

          <form id="nuevo-cliente-form" onSubmit={handleSubmit} noValidate> 
            <h3>Registrar Nuevo Cliente</h3>
            <label htmlFor="cedula-cliente">Cédula:</label>
            <input 
              type="text" 
              id="cedula-cliente" 
              name="cedula"
              value={formData.cedula}
              onChange={handleInputChange}
              placeholder="Número de cédula" 
              required 
            />

            <label htmlFor="nombre-cliente">Nombre:</label>
            <input 
              type="text" 
              id="nombre-cliente" 
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Nombre Completo" 
              required 
            />

            <label htmlFor="email-cliente">Correo Electrónico:</label>
            <input 
              type="email" 
              id="email-cliente" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="ejemplo@dominio.com" 
              required 
            />

            <label htmlFor="telefono-cliente">Teléfono:</label>
            <input 
              type="tel" 
              id="telefono-cliente" 
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              placeholder="Número de teléfono" 
              required 
            />

            <label htmlFor="direccion-cliente">Dirección:</label>
            <input 
              type="text" 
              id="direccion-cliente" 
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              placeholder="Dirección completa" 
              required 
            />

            <label htmlFor="fecha-nacimiento-cliente">Fecha de Nacimiento:</label>
            <input 
              type="date" 
              id="fecha-nacimiento-cliente" 
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleInputChange}
              required 
            />

            <button type="submit" className="btn">Guardar Cliente</button>
          </form>

          <div className="filters">
            <h3>Buscar Cliente por Cédula o Nombre</h3>
            <input 
              type="text" 
              id="search-client" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cédula o nombre..." 
            />
          </div>

          <div id="clientes-registrados">
            <h3>Clientes Registrados ({clientesFiltrados.length} encontrados)</h3>
            
            {clientesFiltrados.length === 0 ? (
              <p className="no-data">
                {searchQuery ? "No se encontraron clientes con esa búsqueda" : "No hay clientes registrados"}
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Cédula</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Dirección</th>
                    <th>Fecha Nac.</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody id="clientes-body">
                  {clientesFiltrados.map(cliente => (
                    <tr key={cliente.id}>
                      <td>{cliente.cedula}</td>
                      <td>{cliente.nombre}</td>
                      <td>{cliente.email}</td>
                      <td>{cliente.telefono}</td>
                      <td>{cliente.direccion}</td>
                      <td>{cliente.fechaNacimiento}</td>
                      <td>
                        <button className="btn edit-btn" onClick={() => editCliente(cliente.id)}>
                          Editar
                        </button>
                        <button className="btn delete-btn" onClick={() => deleteCliente(cliente.id)}>
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