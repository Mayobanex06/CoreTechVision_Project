const categorias = document.querySelectorAll(".categoria")

categorias.forEach(cat => {
    cat.addEventListener("click", () => {

        categorias.forEach(c => c.classList.remove("categoria-activa"))

        cat.classList.add("categoria-activa")
    })
})