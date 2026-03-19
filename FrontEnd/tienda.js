

const categorias = document.querySelectorAll(".categoria")

categorias.forEach(cat => {
    cat.addEventListener("click", () => {

        categorias.forEach(c => c.classList.remove("categoria-activa"))

        cat.classList.add("categoria-activa")
    })
})

const producto = document.querySelectorAll(".producto-card")

categorias.forEach(cat2 => {
    
cat2.addEventListener("click", () => {

    const categoriaSeleccionada = cat2.dataset.categoria
    
        producto.forEach(pro => {

            const productoCategoria = pro.dataset.categoria

            if(categoriaSeleccionada === "all" || categoriaSeleccionada === productoCategoria){
            pro.classList.remove("oculto")
            console.log("Categoría seleccionada:", categoriaSeleccionada)
            console.log("Categoría del producto:", productoCategoria)
            } else {
            pro.classList.add("oculto")
            }
        })
    })
})

