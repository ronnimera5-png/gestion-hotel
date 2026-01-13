/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/inicio.css";

export default function Inicio() {
  const navigate = useNavigate();
  
  // Sección activa (igual a tu JS)
  const [section, setSection] = useState("inicio");
  const [msg, setMsg] = useState("");

  // Formulario reserva
  const [form, setForm] = useState({
    campo: "",
    cedula: "",
    nombre: "",
    tipo: "",
    ingreso: "",
    salida: "",
    adultos: 1,
    ninos: 0,
  });

  // (Opcional) Inicializa localStorage si no existe
  useEffect(() => {
    const saved = localStorage.getItem("solicitudes");
    if (!saved) localStorage.setItem("solicitudes", JSON.stringify([]));
  }, []);

  const cambiarSeccion = (destino) => (e) => {
    if (e) e.preventDefault();
    setSection(destino);
    setMsg("");
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMsg("");
  };

  // === Validaciones (igual a tu JS) ===
  const validaEmail = (valor) => {
    const re = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    if (!re.test(valor)) {
      alert("Ingrese, el correo electrónico no es válido");
      return false;
    }
    return true;
  };

  const validarNombre = (valor) => {
    if (valor == null || valor.trim().length === 0) {
      alert("El campo nombre no puede estar vacío");
      return false;
    }
    return true;
  };

  const validaCedula = (cedula) => {
    const c = (cedula || "").trim();
    if (!/^\d{10}$/.test(c)) {
      alert("La cédula debe tener exactamente 10 números");
      return false;
    }
    return true;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!validaEmail(form.campo)) return;
    if (!validaCedula(form.cedula)) return;
    if (!validarNombre(form.nombre)) return;

    // Guardar solicitud en localStorage
    const solicitud = {
      correo: form.campo,
      cedula: form.cedula,
      nombre: form.nombre,
      tipo: form.tipo,
      ingreso: form.ingreso,
      salida: form.salida,
      adultos: Number(form.adultos),
      ninos: Number(form.ninos),
      estado: "Pendiente",
      fechaCreacion: new Date().toISOString(),
    };

    const arr = JSON.parse(localStorage.getItem("solicitudes") || "[]");
    arr.push(solicitud);
    localStorage.setItem("solicitudes", JSON.stringify(arr));

    // MOSTRAR MENSAJE MEJORADO
    alert(`✅ Solicitud creada correctamente.

📌 **IMPORTANTE: Guarda tu número de cédula**
Tu cédula: ${form.cedula}

Para consultar el estado de tu reserva:
1. Haz clic en "🔍 Consultar Reserva" en el menú superior
2. Ingresa tu número de cédula: ${form.cedula}

📧 Recibirás una confirmación cuando el administrador revise tu solicitud.`);

    setMsg("✅ Solicitud guardada correctamente.");

    // Reset
    setForm({
      campo: "",
      cedula: "",
      nombre: "",
      tipo: "",
      ingreso: "",
      salida: "",
      adultos: 1,
      ninos: 0,
    });
  };

  return (
    <>
      {/* HEADER */}
<header className="header">
  <div className="logo-container">
    <img src="/img/logo.png" alt="Logo del hotel" className="logo" />
    <h1>Hotel ULEAM</h1>
  </div>

  <nav className="navbar">
    <a href="#" data-section="inicio" onClick={cambiarSeccion("inicio")}>
      Inicio
    </a>
    <a href="#" data-section="reservar" onClick={cambiarSeccion("reservar")}>
      Reservar
    </a>
    <a 
      href="#" 
      onClick={(e) => {
        e.preventDefault();
        navigate('/consultar');
      }}
    >
      Consultar Reserva
    </a>
    <a href="#" data-section="estado" onClick={cambiarSeccion("estado")}>
      Contactenos
    </a>
    <a href="#" data-section="sobre" onClick={cambiarSeccion("sobre")}>
      Sobre nosotros
    </a>

    <Link to="/login">Acceder</Link>
  </nav>
</header>

      {/* MAIN */}
      <main className="main-content">
        {/* INICIO */}
        {section === "inicio" && (
          <section id="inicio" className="section">
            <div className="video-container">
              <video autoPlay muted loop playsInline>
                <source src="/img/fondo-hotel.mp4" type="video/mp4" />
                Tu navegador no soporta video HTML5.
              </video>
            </div>

            <div className="inicio-contenido">
              <h2>Bienvenido al Hotel ULEAM</h2>
              <p>
                Disfruta de una experiencia única donde la comodidad y el servicio de calidad
                se combinan para ofrecerte una estadía inolvidable.
              </p>
              {/* ELIMINADA la tarjeta azul de información */}
            </div>

            <div className="galeria">
              <img src="/img/habitacion1.jpg" alt="Habitación individual" />
              <img src="/img/habitacion2.jpg" alt="Habitación doble" />
              <img src="/img/habitacion3.jpg" alt="Suite" />
            </div>
          </section>
        )}

        {/* RESERVAR */}
        {section === "reservar" && (
          <section id="reservar" className="section">
            <h2>Solicitar Reserva</h2>

            <form id="form-reserva" noValidate onSubmit={onSubmit}>
              <label htmlFor="campo">Correo electrónico:</label>
              <input
                type="email"
                id="campo"
                name="campo"
                placeholder="Ingresa tu correo electrónico"
                value={form.campo}
                onChange={onChange}
                required
              />

              <label htmlFor="cedula">Cédula:</label>
              <input
                type="text"
                id="cedula"
                name="cedula"
                placeholder="Ingresa tu cédula (10 dígitos)"
                value={form.cedula}
                onChange={onChange}
                required
                maxLength="10"
              />

              <label htmlFor="nombre">Nombre completo:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Ingresa tu nombre completo"
                value={form.nombre}
                onChange={onChange}
                required
              />

              <label htmlFor="tipo">Tipo de habitación:</label>
              <select id="tipo" name="tipo" value={form.tipo} onChange={onChange} required>
                <option value="">Selecciona una opción</option>
                <option value="Individual">Individual</option>
                <option value="Doble">Doble</option>
                <option value="Suite">Suite</option>
              </select>

              <label htmlFor="ingreso">Fecha de ingreso:</label>
              <input
                type="date"
                id="ingreso"
                name="ingreso"
                value={form.ingreso}
                onChange={onChange}
                required
              />

              <label htmlFor="salida">Fecha de salida:</label>
              <input
                type="date"
                id="salida"
                name="salida"
                value={form.salida}
                onChange={onChange}
                required
              />

              <label htmlFor="adultos">Adultos:</label>
              <input
                type="number"
                id="adultos"
                name="adultos"
                min="1"
                value={form.adultos}
                onChange={onChange}
                required
              />

              <label htmlFor="ninos">Niños:</label>
              <input
                type="number"
                id="ninos"
                name="ninos"
                min="0"
                value={form.ninos}
                onChange={onChange}
                required
              />

              <button type="submit" className="btn">
                Crear Reserva
              </button>

              <p id="msg-reserva" className="muted">
                {msg}
              </p>

              {/* ELIMINADA la nota amarilla también si quieres */}
            </form>
          </section>
        )}

        {/* CONTACTO */}
        {section === "estado" && (
          <section id="estado" className="section contacto">
            <h2>Contáctenos</h2>
            <p>
              Estaremos contentos de responder cualquier inquietud que tenga. Para solicitudes formales,
              complete nuestro breve formulario. Nuestro dedicado personal en <strong>Hotel ULEAM</strong>{" "}
              responderá con brevedar.
            </p>

            <p>
              <strong>Hotel ULEAM Manta</strong>
            </p>
            <p>Teléfono: +593 5 262 9200</p>
            <p>
              Correo electrónico:{" "}
              <a href="mailto:reservas@hoteluleam.com">reservas@hoteluleam.com</a>
            </p>

            <h3>Hoteles ULEAM</h3>
          </section>
        )}

        {/* SOBRE */}
        {section === "sobre" && (
          <section id="sobre" className="section sobre">
            <div className="sobre-contenido">
              <h2>¿Por qué visitar el Hotel ULEAM?</h2>

              <p>
                El Hotel ULEAM es un destino ideal para quienes buscan descanso, confort y atención personalizada.
                Nuestras habitaciones, suites y espacios comunes combinan un estilo moderno y minimalista con
                tecnología actual.
              </p>

              <p>
                Disfruta de una oferta pensada para que no solo descanses, sino que vivas experiencias únicas:
                sabores locales e internacionales en nuestro restaurante, cocteles en la terraza y áreas
                recreativas con ambientes relajantes.
              </p>

              <p>
                Despierta en un entorno cómodo y seguro, con una ubicación estratégica y el mejor servicio de
                nuestro equipo; en el Hotel ULEAM encontrarás la estadía que estás buscando.
              </p>
            </div>
          </section>
        )}
      </main>
    </>
  );
}