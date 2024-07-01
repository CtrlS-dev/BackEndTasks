const db = require('.');

// crear mi tabla de usuarios
const createUsersTable = async () => {
  const statement = db.prepare(`

    CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  
    )
  `);
  statement.run(); //para correr mi funcion
  console.log('Tabla de usuarios creada'); //Compruebo que todo este correcto
};

// Crear mi tabla de ITEMS
const createItemsTable = async () => {
  const statement = db.prepare(`

  CREATE TABLE items (
    items_id INTEGER PRIMARY KEY,
    text TEXT NOT NULL,
    checked INTERGER NOT NULL DEFAULT 0,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id)
      REFERENCES users (user_id)
      ON DELETE CASCADE
  )
  `);
  statement.run();
  console.log('Tabla de contactos creada');
};

const createTables = async () => {
  await createUsersTable();
  await createItemsTable();
};

createTables();
