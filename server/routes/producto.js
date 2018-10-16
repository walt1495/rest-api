const express = require('express');
const app = express();
const { verificarToken } = require('../middlewares/autenticacion');
let Producto = require('../models/producto');

// ==============================
// OBTENER TODAS LOS PRODUCTOS
// ==============================
app.get('/producto', verificarToken, (req, res) => {
    //CARGAR USUARIOS Y CATEGORIAS
    //PAGINAR PRODUCTOS
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let pagina = req.query.limite || 10;
    pagina = Number(pagina);
    Producto.find({ disponible: true })
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(pagina)
        .exec((error, productos) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error
                });
            }
            Producto.count({ disponible: true }, (err, cantidad) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        error: err
                    });
                }
                return res.json({
                    ok: true,
                    productos,
                    cantidad
                });
            });
        });
});

// ==============================
// OBTENER pRODUCTO POR ID
// ==============================
app.get('/producto/:id', verificarToken, (req, res) => {
    //CARGAR USUARIOS Y CATEGORIAS
    let id = req.params.id;
    Producto.findById(id)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((error, productoDB) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error
                });
            }
            if (!productoDB.disponible) {
                return res.status(404).json({
                    ok: false,
                    error: {
                        message: 'No existe Producto'
                    }
                });
            }
            return res.json({
                ok: true,
                producto: productoDB
            });
        });
});

// ==============================
// BUSCAR PRODUCTO
// ==============================
app.get('/producto/buscar/:termino', verificarToken, (req, res) => {

    let termino = req.params.termino;
    //CREAMOS UNA EXPRESION REGULAR A PARTIR DEL TERMINO Y LE PASAMOS Q SEA INSENSIBLE A MAYUS Y MINUS
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((error, productos) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error
                });
            }
            return res.json({
                ok: true,
                productos
            });
        });
});

// ==============================
// CREAR UN PRODUCTO
// ==============================
app.post('/producto', verificarToken, (req, res) => {
    //GRABAR CON EL USUARIO Y UNA CATEGORIA
    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });
    producto.save((error, productoDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }
        return res.json({
            ok: true,
            producto: productoDB
        });
    });
});

// ==============================
// ACTUALIZAR UN PRODUCTO
// ==============================
app.put('/producto/:id', verificarToken, (req, res) => {
    //GRABAR EL USUARIO Y UNA CATEGORIA
    let id = req.params.id;
    let body = req.body;
    let producto = {
        nombre: body.descripcion,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria
    };
    Producto.findByIdAndUpdate(id, producto, { new: true, runValidators: true }, (error, productoDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }
        if (!productoDB || !productoDB.disponible) {
            return res.status(404).json({
                ok: true,
                error: {
                    message: 'No existe Producto'
                }
            });
        }
        return res.json({
            ok: true,
            producto: productoDB
        });
    });
});

// ==============================
// BORRAR UN PRODUCTO
// ==============================
app.delete('/producto/:id', (req, res) => {
    //BORRADO LÓGICO
    let id = req.params.id;
    Producto.findByIdAndUpdate(id, { disponible: false }, (error, productoDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }
        if (!productoDB || !productoDB.disponible) {
            return res.status(404).json({
                ok: false,
                error: {
                    message: 'No existe Producto'
                }
            });
        }
        return res.json({
            ok: true,
            producto: productoDB
        });
    });
});

module.exports = app;