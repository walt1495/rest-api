const jwt = require('jsonwebtoken');

// ============================
//  Verificar Token
// ========================
let verificarToken = (req, res, next) => {
    let token = req.get('token');
    jwt.verify(token, process.env.SEED, (error, decoded) => {
        if (error) {
            return res.status(401).json({
                ok: false,
                error
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
}

// ============================
//  Verificar AdminRole
// ========================
let verificarAdminRole = (req, res, next) => {
    let usuario = req.usuario;
    if (usuario.role !== "ADMIN_ROLE") {
        return res.status(401).json({
            ok: false,
            error: {
                message: 'No Cuenta con los permisos para realizar esta acción'
            }
        });
    }
    next();
}

// ============================
//  Verificar token para imagen
// ========================
let verificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (error, decoded) => {
        if (error) {
            return res.status(401).json({
                ok: false,
                error
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
}

module.exports = {
    verificarToken,
    verificarAdminRole,
    verificaTokenImg
}