
// Esta es la tarjetita de usuario

const API = "http://localhost:3000";

const userBtn = document.getElementById("userBtn");
const userCard = document.getElementById("userCard");

if (userBtn && userCard) {
  userBtn.addEventListener("click", async () => {
    userCard.classList.toggle("oculto");

    if (!userCard.classList.contains("oculto")) {
      await cargarTarjetaUsuario();
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".user-menu")) {
      userCard.classList.add("oculto");
    }
  });
}

async function cargarTarjetaUsuario() {
  try {
    const response = await fetch(API + "/api/me", {
      method: "GET",
      credentials: "include"
    });

    const data = await response.json();

    if (!response.ok) {
      userCard.innerHTML = `
        <h4>Mi cuenta</h4>
        <p>No has iniciado sesión.</p>
        <button class="btn-user" onclick="window.location.href='login.html'">Iniciar sesión</button>
        <button class="btn-user-sec" onclick="window.location.href='register.html'">Registrarse</button>
      `;
      return;
    }

    userCard.innerHTML = `
      <h4>Mi cuenta</h4>
      <p><strong>Nombre:</strong> ${data.user.nombre}</p>
      <p><strong>Correo:</strong> ${data.user.email}</p>
      <p><strong>Rol:</strong> ${data.user.rol}</p>
      <button class="btn-user" id="logoutBtn">Cerrar sesión</button>
    `;

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await fetch(API + "/api/logout", {
          method: "POST",
          credentials: "include"
        });

        window.location.href = "login.html";
      });
    }

  } catch (error) {
    userCard.innerHTML = `
      <h4>Mi cuenta</h4>
      <p>Error al cargar la información.</p>
    `;
    console.error("ERROR USUARIO >>>", error);
  }
}


    AOS.init({
      once: true,
    });
