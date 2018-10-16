const express = require('express');
let { verificarToken, verificarAdminRole } = require('../middlewares/autenticacion');
let app = express();
const Categoria = require('../models/categoria');

// ==============================
// OBTENER TODAS LAS CATEGORIAS
// ==============================
app.get('/categoria', verificarToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((error, categorias) => {
            if (error) {
                return res.status(400).json({
                    ok: false,
                    error
                });
            }
            Categoria.count({}, (err, cantidad) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        error: err
                    });
                }
                return res.json({
                    ok: true,
                    categorias,
                    cantidad
                });
            });
        });
});

// ==============================
// MOSTRAR UNA CATEGORIA POR ID
// ==============================
app.get('/categoria/:id', verificarToken, (req, res) => {
    let id = req.params.id;
    Categoria.findById(id)
        .populate('usuario', 'nombre email')
        .exec((error, categoriaDB) => {
            if (error) {
                return res.status(400).json({
                    ok: false,
                    error
                });
            }
            return res.json({
                ok: true,
                categoria: categoriaDB
            });
        });
});

// ==============================
// CREAR NUEVA CATEGORIA
// ==============================
app.post('/categoria', [verificarToken], (req, res) => {
    //REGRESA NUEVA CATEGORIA
    //req.usuario._id
    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    categoria.save((error, categoriaDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }
        return res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ==============================
// ACTUALIZAR UNA CATEGORIA
// ==============================
app.put('/categoria/:id', [verificarToken], (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let categoria = {
        descripcion: body.descripcion
    }
    Categoria.findByIdAndUpdate(id, categoria, { runValidators: true, new: true }, (error, categoriaDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }
        if (!categoriaDB) {
            return res.status(404).json({
                ok: false,
                error: {
                    message: 'No existe categoria'
                }
            });
        }
        return res.json({
            ok: false,
            categoria: categoriaDB
        });
    });
});

// ==============================
// ELIMINAR UNA CATEGORIA
// ==============================
app.delete('/categoria/:id', [verificarToken, verificarAdminRole], (req, res) => {
    //SOLO LA PUEDA BORRAR UN ADMINISTRADOR
    //ELIMINACIÓN FÍSICA
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (error, categoriaDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }
        if (!categoriaDB) {
            return res.status(404).json({
                ok: false,
                error: {
                    message: 'No existe categoria'
                }
            });
        }
        return res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

module.exports = app;