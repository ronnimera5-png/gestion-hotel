import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const submit = (e) => {
    e.preventDefault();

    const USER_VALIDO = "admin";
    const PASS_VALIDO = "12345";

    if (!username.trim() || !password.trim()) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    if (username === USER_VALIDO && password === PASS_VALIDO) {
      localStorage.setItem("auth", "true");
      alert("Inicio de sesión exitoso. Redirigiendo...");
      nav("/dashboard");
    } else {
      alert("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="login-page"> {/* CONTENEDOR NUEVO - Esto activa el fondo */}
      <div className="login-container">
        <h2>Iniciar Sesión</h2>

        <form id="login-form" onSubmit={submit}>
          <label htmlFor="username">Usuario:</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingrese su Usuario"
          />

          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese su Contraseña"
          />

          <button type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
}