module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) return next();
    return res.redirect('/login');
  },

  isAdmin: (req, res, next) => {
    if (req.isAuthenticated() && req.user.rol === 'admin') {
      return next();
    }
    return res.status(403).send('Acceso denegado: Solo administradores');
  }
};

// Este middleware verifica si el usuario está autenticado y si tiene el rol de administrador.