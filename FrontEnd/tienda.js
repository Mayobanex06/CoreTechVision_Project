// Pa cualquier pendejo que quiera trabajar esta mrd aca les dejo comentados los bloques del codigo (NETFLIX SACA STEEL BALL RUN YA PORFAVOR)

// Bloque 2: Array de productos

let productos = [];

function crearTarjetaProducto(producto) {

  return `
    <div class="producto-card" data-categoria="${producto.marca}">
      <div class="producto-imagen">
        <img
          src="${producto.imagen}"
          alt="${producto.marca} ${producto.nombre}"
        />
      </div>

      <div class="producto-info">
        <p class="marca">${producto.marca}</p>
        <h3 class="nombre">${producto.nombre}</h3>
        <p class="precio">RD$${producto.precio.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}</p>

        <div class="memorias">
          <button class="chip">256GB</button>
          <button class="chip">512GB</button>
        </div>

        <button class="btn-carrito">Agregar al carrito</button>
      </div>
    </div>
  `;
}

const contenedorProductos = document.getElementById("productos-contenedor");

function cargarProductos(lista) {
  if (!contenedorProductos) {
    console.error("No se encontró el contenedor de productos");
    return;
  }

  contenedorProductos.innerHTML = lista
    .map(producto => crearTarjetaProducto(producto))
    .join("");

  const resultadoTexto = document.querySelector(".resultado-texto");

  if (resultadoTexto) {
    resultadoTexto.textContent = `Mostrando ${lista.length} productos`;
  }
}

async function obtenerProductos() {
  try {
    const response = await fetch("http://localhost:3000/api/tienda/productos");
    const data = await response.json();
    const mensaje = document.getElementById("mensaje-productos")

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "No se pudieron cargar los productos");
    }

    productos = data.productos;
    cargarProductos(productos);

    mensaje.classList.add("oculto")

  } catch (error) {
    console.error("ERROR CARGANDO PRODUCTOS >>>", error);
  }
}

obtenerProductos();


// Bloque 4: Logica detras del filtro por marca

const categorias = document.querySelectorAll(".categoria");

categorias.forEach(cat => {
  cat.addEventListener("click", () => {

    categorias.forEach(c => c.classList.remove("categoria-activa"));
    cat.classList.add("categoria-activa");

    const categoriaSeleccionada = cat.dataset.categoria;

    const productos = document.querySelectorAll(".producto-card");

    productos.forEach(pro => {
      const productoCategoria = pro.dataset.categoria;

      if (categoriaSeleccionada === "all" || categoriaSeleccionada === productoCategoria) {
        pro.classList.remove("oculto");
      } else {
        pro.classList.add("oculto");
      }
    });

  });
});

