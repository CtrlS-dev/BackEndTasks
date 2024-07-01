const itemsRouter = require('express').Router();
const db = require('../db');
const REGEX_ITEM = /^(?=.*[a-zA-Z0-9]).{1,}$/;

// POST ITEM
itemsRouter.post('/', async (req, res) => {
  try {
    // 1. Obtener el item y checked de body
    const { text, checked } = req.body;

    // 1.1 Verificar que el item no este vacío
    if (!REGEX_ITEM.test(text)) {
      return res.status(400).json({
        error: 'El item está vacío',
      });
    }

    // 2. Crear el nuevo item en db
    const statement = db.prepare(`
    INSERT INTO items (text, checked, user_id)
    VALUES (?, ?, ?)
    RETURNING *
  `);

    const newItem = statement.get(text, checked, Number(req.query.userId));
    newItem.checked = Number(newItem.checked);
    // 4. Enviar la respuesta
    return res.status(201).json(newItem);
  } catch (error) {
    // En caso de que sea un error desconocido muestro cual es
    console.log('ERROR', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'El email ya existe',
      });
    }
    return res.status(500).json({ error: 'Hubo un error' });
  }
});

// CHECK ITEM
itemsRouter.put('/:id', async (req, res) => {
  try {
    // 1. Obtener el item del body
    const { checked } = req.body;

    // 2. Actualizar el item
    const statement = db.prepare(`
    UPDATE items
    SET 
      checked = ?
    WHERE items_id = ? AND user_id = ?
    RETURNING *
  `);
    const upgradeItem = statement.get(checked, Number(req.params.id), Number(req.query.userId));

    if (!upgradeItem) {
      return res.status(403).json({
        error: 'No tiene los permisos',
      });
    }

    // 4. Enviar la respuesta
    return res.status(200).json(upgradeItem);
  } catch (error) {
    // console.log('ERROR', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'El email ya existe',
      });
    }
    return res.status(500).json({ error: 'Hubo un error' });
  }
});

// DELETE ITEM
itemsRouter.delete('/:id', async (req, res) => {
  try {
    // Eliminar el contacto
    const statement = db.prepare(`
      DELETE FROM items
      WHERE items_id = ? AND user_id = ?
      `);
    // guardo cambios en una constante
    const { changes } = statement.run(req.params.id, req.userId);
    // si el item no existe
    if (!changes) {
      return res.status(400).json({
        message: 'El item no existe',
      });
    }

    // Si todo esta OK
    return res.status(200).json({
      message: 'El item ha sido eliminado con exito',
    });
  } catch (error) {
    // Visualizar el error
    console.log('ERROR:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'El email ya existe',
      });
    }
  }
});

module.exports = itemsRouter;
