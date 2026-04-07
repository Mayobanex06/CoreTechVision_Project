require("dotenv").config();
const express = require("express")
const app = express()
const cors = require("cors")
const cookieParser = require("cookie-parser")
const crypto = require("crypto")
const mysql = require("mysql2/promise")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({

origin: process.env.FRONTEND_ORIGIN,
credentials: true

}
))

const pool = mysql.createPool({

    host: process.env.DB_HOST, 
    port: process.env.DB_PORT, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NOMBRE,
    waitForConnections: true, 
    connectionLimit: 10,

})

const COOKIE_NAME = "sid" 
const sessions = {}

function authMiddleware(req, res, next){
    const sid = req.cookies[COOKIE_NAME]

    if (!sid || !sessions[sid]){
        return res.status(401).json({error: "No autentificado"})
    }

    if(Date.now() > sessions[sid].expiresAt){
        delete sessions[sid]
        return res.status(401).json({error: "Sesion expirada"})
    }

    req.userId = sessions[sid].id_usuario
    next()
}

function adminMiddleware(req, res, next) {
  pool.query("SELECT rol FROM usuarios WHERE id_usuarios = ?", [req.userId])
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ error: "Usuario no existe" });
      }

      if (rows[0].rol !== "Admin") {
        return res.status(403).json({ error: "No autorizado" });
      }

      next();
    })
    .catch((error) => {
      console.error("ADMIN MIDDLEWARE ERROR >>>", error);
      res.status(500).json({ error: "Error al validar rol de admin" });
    });
}

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok")
    res.json(rows[0]) 
  } catch (err) {
    res.status(500).json({ error: "DB no conecta", detail: String(err.message || err) })
  }
})

app.post("/api/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan datos" })
    }

    const [existe] = await pool.query(
      "SELECT id_usuarios FROM usuarios WHERE email = ?",
      [email]
    )

    if (existe.length > 0) {
      return res.status(409).json({ error: "El email ya existe" })
    }

    await pool.query(
      `INSERT INTO usuarios 
      (nombre, email, password, rol, estado) 
      VALUES (?, ?, ?, 'User', 1)`,
      [nombre, email, password]
    )

    res.json({ ok: true })

  } catch (err) {
  console.error("REGISTER ERROR >>>", err)
  return res.status(500).json({
    error: "Error en registro",
    detalle: err.message,
    code: err.code,
  })
}
})


app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan datos" })
    }

    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

    const user = rows[0]

    if (user.estado !== 1) {
      return res.status(403).json({ error: "Usuario inactivo" })
    }

    const passwordMatch = password === user.password;

    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

   
    const sid = crypto.randomBytes(24).toString("hex")

    sessions[sid] = {
      id_usuario: user.id_usuarios,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 
    }

    
    await pool.query(
      "UPDATE usuarios SET ultimo_login = NOW() WHERE id_usuarios = ?",
      [user.id_usuarios]
    )

    res.cookie(COOKIE_NAME, sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
    path: "/"
    })

    res.json({ ok: true })

  } catch (err) {
    console.error("LOGIN ERROR >>>", err)
    return res.status(500).json({
    error: "Error en login",
    detalle: err.message,
    code: err.code,
  })
}
  })


app.get("/api/me", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_usuarios, nombre, email, rol, estado, ultimo_login FROM usuarios WHERE id_usuarios = ?",
      [req.userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    res.json({ ok: true, user: rows[0] })
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario" })
  }
})


app.post("/api/logout", (req, res) => {
  const sid = req.cookies[COOKIE_NAME]

  if (sid) {
    delete sessions[sid]
  }

  res.clearCookie(COOKIE_NAME)
  res.json({ ok: true })
})


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

app.get("/api/tienda/productos", async (req, res) => {

  try {

    const [rows] = await pool.query(
      `SELECT 
        id_producto,
        marca,
        nombre,
        precio,
        imagen,
        categoria,
        stock
      FROM productos
      WHERE estado = 1
      ORDER BY id_producto DESC`)

    const productos = rows.map(producto =>({

      id: producto.id_producto,
      marca: producto.marca,
      nombre: producto.nombre,
      precio: Number(producto.precio),
      imagen: producto.imagen,
      categoria: producto.categoria,
      stock: producto.stock

}))

    res.json({ok: true, productos })


} catch(error){
    console.error("Error productos >>>", error)
    res.status(500).json({
      ok: false,
      error: "Error al obtener productos"
    })
}

})

app.get("/api/admin/productos", authMiddleware, adminMiddleware, async (req, res) => {

  try {

    const [rows] = await pool.query(
      `SELECT 
        id_producto,
        marca,
        nombre,
        precio,
        imagen,
        categoria,
        stock
      FROM productos
      WHERE estado = 1
      ORDER BY id_producto DESC`)

    const productos = rows.map(producto =>({

      id: producto.id_producto,
      marca: producto.marca,
      nombre: producto.nombre,
      precio: Number(producto.precio),
      imagen: producto.imagen,
      categoria: producto.categoria,
      stock: producto.stock

}))

    res.json({ok: true, productos })


} catch(error){
    console.error("Error productos >>>", error)
    res.status(500).json({
      ok: false,
      error: "Error al obtener productos"
    })
}

})

app.get("/api/admin", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ ok: true, mensaje: "Acceso permitido a admin" })
})

app.get("/api/admin/resumen", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [[productosTotalRows]] = await pool.query(`
      SELECT COUNT(*) AS total_productos
      FROM productos
    `);

    const [[usuariosActivosRows]] = await pool.query(`
      SELECT COUNT(*) AS usuarios_activos
      FROM usuarios
      WHERE estado = 1
    `);

    const [[stockBajoRows]] = await pool.query(`
      SELECT COUNT(*) AS stock_bajo
      FROM productos
      WHERE stock <= 3 AND estado = 1
    `);

    res.json({
      ok: true,
      resumen: {
        totalProductos: productosTotalRows.total_productos,
        usuariosActivos: usuariosActivosRows.usuarios_activos,
        ordenesHoy: 0,
        stockBajo: stockBajoRows.stock_bajo
      }
    });

  } catch (error) {
    console.error("ERROR RESUMEN ADMIN >>>", error);
    res.status(500).json({
      ok: false,
      error: "Error al obtener resumen del panel admin"
    });
  }
});

app.patch("/api/admin/producto/:id/inactivar", authMiddleware, adminMiddleware, async (req, res) =>{

  try{

    const { id } = req.params

    const [result] = await pool.query("UPDATE productos SET estado = 0 WHERE id_producto = ?",
    [id])

    if(result.affectedRows === 0){
      return res.status(404).json({
        ok: false,
        error: "Producto no encontrado"
      })
    }

    res.json({
      ok: true,
      mensaje: "Producto inactivado correctamente"
    })

    } catch(error){
    console.error("Error al inactivar producto: ", error)
    res.status(500).json({
      ok: false,
      error: "Error al inactivar el producto"
    })
    }

  })

app.put("/api/admin/productos/:id", authMiddleware, adminMiddleware, async (req, res) => {

  try{
  const { id } = req.params
  const { nombre, marca, precio, stock, estado } = req.body

  const [result] = await pool.query("UPDATE productos SET nombre = ?, marca = ?, precio = ?, stock = ?, estado = ? WHERE id_producto = ?", 
    [nombre, marca, precio, stock, estado, id])

  if(result.affectedRows === 0){
    return res.status(404).json({
      ok: false,
      error: "Producto a editar no encontrado"
    })
  }

  res.json({
    ok: true,
    mensaje: "Producto editado correctamente"
  })

  }catch(error){
    console.error("Error al editar el producto", error)
    res.status(500).json({
      ok: false,
      error: "Error al editar el producto"
    })
  }

})