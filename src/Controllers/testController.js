const testController = {
  getWelcome: (req, res) => {
    res.send('Backend de Proyecto Base de Datos funcionando correctamente (MVC)');
  },
  getHealth: (req, res) => {
    res.json({ 
      message: "El backend est respondiendo correctamente", 
      status: "ok",
      timestamp: new Date()
    });
  }
};

module.exports = testController;
