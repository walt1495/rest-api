const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcryp = require('bcrypt');
const _ = require('underscore');
const { verificarToken, verificarAdminRole } = require('../middlewares/autenticacion');

app.get('/usuario', verificarToken, function(req, res) {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let pagina = req.query.pagina || 10;
    pagina = Number(pagina);
    Usuario.find({ estado: true })
        .skip(desde)
        .limit(pagina)
        .exec((error, usuarios) => {
            if (error) {
                return res.status(400).json({
                    ok: false,
                    error
                });
            }
            Usuario.count({ estado: true }, (err, cantidad) => {
                return res.json({
                    ok: true,
                    usuarios,
                    cantidad
                });
            });
        });
});

app.post('/usuario', [verificarToken, verificarAdminRole], function(req, res) {

    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcryp.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((error, usuarioDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }
        usuarioDB.password = null;
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.put('/usuario/:id', [verificarToken, verificarAdminRole], function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (error, usuarioDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }
        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                error: {
                    message: 'No se encontro usuario'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.delete('/usuario/:id', [verificarToken, verificarAdminRole], function(req, res) {
    let id = req.params.id;
    Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (error, usuarioDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }
        if (!usuarioDB || !usuarioDB.estado) {
            return res.status(404).json({
                ok: false,
                error: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

    /*
    Usuario.findByIdAndRemove(id, (error, usuarioDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                error:{
                    message:'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });*/
});

module.exports = app;