/**
 * Middleware de autorización por rol.
 * Debe ejecutarse siempre DESPUÉS del middleware de autenticación (auth).
 * Uso: authorize('admin', 'gerente')
 */
module.exports = (...rolesPermitidos) => (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  if (!rolesPermitidos.includes(req.usuario.rol)) {
    return res.status(403).json({
      error: `Acceso denegado. Se requiere uno de los roles: ${rolesPermitidos.join(', ')}`,
    });
  }
  next();
};
