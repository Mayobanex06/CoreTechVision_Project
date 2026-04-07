// Variables globales

const API2 = "http://localhost:3000"
let productos = []

// Bloque 1: Validacion de rol (Cualquier usuario con rol diferente de "Admin" no podra acceder a esta pestaña, is todo)

async function verificarAdmin(){
    try{

        const response = await fetch(API2 + "/api/me", {
            credentials: "include"
        })

        if (!response.ok){
            window.location.href = "login.html"
            return false;
        }

        const data = await response.json()

        if(!data.ok || data.user.rol !== "Admin"){
            window.location.href = "index.html"
            return false;
        }

        console.log("Acceso permitido, ande tranquilo")
        return true;

    } catch(error){
        console.error("Error al validar rol del usuario" + error)
        window.location.href = "index.html"
        return true;
    }
}

// Bloque 2: Estado de los productos

function obtenerEstadoProductos(producto){
    if(producto.estado === 0){
        return { texto: "Inactivo", clase: "estado-bajo"}
    }

    if(producto.stock <= 3){
        return { texto: "Bajo", clase: "estado-bajo"}
    }

    return { texto: "Activo", clase: "estado-activo"}
}

// Bloque 3: Carga los productos (todavia no los muestra en pantalla)

function cargarProductos(producto){
    const estado = obtenerEstadoProductos(producto)

    return `<div class="admin-tabla-row">
      <span>#${String(producto.id).padStart(3, "0")}</span>
      <span>${producto.nombre}</span>
      <span>${producto.marca}</span>
      <span>RD$${Number(producto.precio).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}</span>
      <span>${producto.stock}</span>
      <span class="${estado.clase}">${estado.texto}</span>
      <div class="admin-tabla-acciones">
        <button type="button" data-id="${producto.id}" class="btn-editar">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button type="button" data-id="${producto.id}" class="btn-eliminar">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>`
}

// Bloque 4: Renderiza las tablas a mostrar

function renderizarTabla(lista){
    const contenedor = document.getElementById("adminTablaBody")

    if (!contenedor) {
    console.error("No existe #adminTablaBody")
    return;
    }

    if (lista.length === 0) {
    contenedor.innerHTML = `
      <div class="admin-tabla-row">
        <span>-</span>
        <span>No hay productos</span>
        <span>-</span>
        <span>-</span>
        <span>-</span>
        <span>-</span>
        <div class="admin-tabla-acciones"></div>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = lista.map(cargarProductos).join("")
  
}

// Bloque 5: Renderiza los productos (Aca ya muestra todo en pantalla)

async function renderizarProductos(){
    try{

        console.log("Intentando cargar productos admin...")

        const response = await fetch(API2 + "/api/admin/productos", {
            credentials: "include"
        })

        console.log("STATUS PRODUCTOS:", response.status)

        const data = await response.json()

        console.log("DATA PRODUCTOS:", data);

        if (!response.ok || !data.ok){
            throw new Error(data.error || "No se pudieron mostrar los datos en pantalla")
        }

        productos = data.productos
        renderizarTabla(productos)

    } catch(error){
        console.error("Error renderizando los productos en el panel de admin" + error)
    }
}

// Bloque 6: Muestra el resumen general mas arriba

async function cargarResumenAdmin() {
  try {
    const response = await fetch(API2 + "/api/admin/resumen", {
      credentials: "include"
    });

    console.log("STATUS RESUMEN:", response.status)

    const data = await response.json()
    console.log("DATA RESUMEN:", data)

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "No se pudo cargar el resumen del admin")
    }

    document.getElementById("totalProductos").textContent = data.resumen.totalProductos
    document.getElementById("usuariosActivos").textContent = data.resumen.usuariosActivos
    document.getElementById("ordenesHoy").textContent = data.resumen.ordenesHoy
    document.getElementById("stockBajo").textContent = data.resumen.stockBajo

  } catch (error) {
    console.error("ERROR CARGANDO RESUMEN ADMIN >>>", error)
  }
}


// Bloque : Solo confirma que todo esta ok antes de renderizar

async function iniciarAdmin() {
  const accesoPermitido = await verificarAdmin()
    console.log("accesoPermitido:", accesoPermitido)

  if (!accesoPermitido) return

  await cargarResumenAdmin()
  await renderizarProductos();
  inicializarFiltros();
}

iniciarAdmin()

// Bloque 7: Filtro de productos

function aplicarFiltros() {
  const inputBusqueda = document.getElementById("adminSearch");
  const selectMarca = document.getElementById("adminMarca");

  if (!inputBusqueda || !selectMarca) {
    console.error("No se encontró #adminSearch o #adminMarca");
    return;
  }

  const textoBusqueda = inputBusqueda.value.trim().toLowerCase();
  const marcaSeleccionada = selectMarca.value;

  const productosFiltrados = productos.filter((producto) => {
    const coincideNombre = producto.nombre.toLowerCase().includes(textoBusqueda);

    const coincideMarca =
      marcaSeleccionada === "todas" || producto.marca === marcaSeleccionada;

    return coincideNombre && coincideMarca;
  });

  renderizarTabla(productosFiltrados);
}

function inicializarFiltros() {
  const inputBusqueda = document.getElementById("adminSearch");
  const selectMarca = document.getElementById("adminMarca");

  if (!inputBusqueda || !selectMarca) {
    console.error("No se encontró #adminSearch o #adminMarca");
    return;
  }

  inputBusqueda.addEventListener("input", aplicarFiltros);
  selectMarca.addEventListener("change", aplicarFiltros);
}

// Bloque 9: Eliminar productos

document.addEventListener("click", async (e)=>{

  const btnEliminar = e.target.closest(".btn-eliminar")
  
  if(!btnEliminar) return

  const id = btnEliminar.dataset.id

  const confirmar = confirm("Esta seguro de que quiere eliminar este producto")

  if(!confirmar) return

  await desactivarProducto(id)

})

async function desactivarProducto(id){
  try{
    const response = await fetch(API2 + `/api/admin/producto/${id}/inactivar`, {
      method: "PATCH",
      credentials: "include"
    })

    console.log("STATUS INACTIVAR:", response.status);

    const data = await response.json()

    console.log("STATUS DATA:", data)

    if(!response.ok || !data.ok){
      throw new Error(data.error || "No se pudo desactivar el producto")
    }

    await cargarResumenAdmin()
    await renderizarProductos()
    aplicarFiltros()

  }catch(error){
    console.error("Error al desactivar el producto", error)
  }

}