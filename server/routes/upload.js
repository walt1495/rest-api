const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const path = require('path');;
const fs = require('fs');

let Usuario = require('../models/usuario');
let Producto = require('../models/producto');

app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {
    let tipo = req.params.tipo;
    let id = req.params.id;
    let tiposPermitidos = ['productos', 'usuarios'];

    if (tiposPermitidos.indexOf(tipo) < 0) {
        return res.status(404).json({
            ok: false,
            error: {
                message: 'Solicitud no encontrada'
            }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No se ha seleccionado ningún archivo'
        });
    }
    //OBTENEMOS EL ARCHIVO ENVIADO
    let archivo = req.files.archivo;
    let nombre = archivo.name;
    let mimetype = archivo.mimetype.split('/');
    let extension = mimetype[1];

    let extPermitidas = ['png', 'jpg', 'jpeg', 'gif'];
    if (extPermitidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            error: {
                message: 'Las extensiones permitidas son: ' + extPermitidas.join(', '),
                ext: extension
            }
        });
    }

    //CAMBIAR NOMBRE AL ARCHIVO
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    //MOVEMOS EL ARCHIVO
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (error) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }

        if (tipo === 'productos') {
            imagenProducto(id, res, nombreArchivo)
        } else {
            imagenUsuario(id, res, nombreArchivo)
        }

    })
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (error, usuarioDB) => {
        if (error) {
            eliminarArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                error
            });
        }
        if (!usuarioDB) {
            eliminarArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'El Usuario no existe'
                }
            });
        }
        eliminarArchivo(usuarioDB.img, 'usuarios');
        usuarioDB.img = nombreArchivo;
        usuarioDB.save((error, usuarioGuardado) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error
                });
            }
            return res.json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (error, productoDB) => {
        if (error) {
            eliminarArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                error
            });
        }
        if (!productoDB) {
            eliminarArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Producto no encontrado'
                }
            });
        }
        eliminarArchivo(productoDB.img, 'productos');
        productoDB.img = nombreArchivo;
        productoDB.save((error, productoActualizado) => {
            if (error) {
                res.status(500).json({
                    ok: false,
                    error
                });
            }
            return res.json({
                ok: true,
                producto: productoActualizado
            });
        });
    });
}

function eliminarArchivo(nombreArchivo, tipo) {
    let pathArchivo = path.resolve(__dirname, `../../uploads/${tipo}/${nombreArchivo}`);
    if (fs.existsSync(pathArchivo)) {
        fs.unlinkSync(pathArchivo);
    }
}

module.exports = app;