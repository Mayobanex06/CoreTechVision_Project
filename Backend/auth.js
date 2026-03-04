const API = "http://localhost:3000"; 

const mensaje = document.getElementById("mensaje");


const formRegister = document.getElementById("formRegister");

if (formRegister) {
  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      nombre_completo: formRegister.nombre_completo.value.trim(),
      nombre_usuario: formRegister.nombre_usuario.value.trim(),
      password: formRegister.password.value
    };

    const response = await fetch(API + "/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      mensaje.textContent = data.error;
      return;
    }

    mensaje.textContent = "Registro exitoso";
    formRegister.reset();
  });
}


const formLogin = document.getElementById("formLogin");

if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      nombre_usuario: formLogin.nombre_usuario.value.trim(),
      password: formLogin.password.value
    };

    const response = await fetch(API + "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      mensaje.textContent = data.error;
      return;
    }

    window.location.href = "dashboard.html";
  });
}