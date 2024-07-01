const supertest = require('supertest');
const app = require('../app');
const { describe, test, expect, beforeAll } = require('@jest/globals');
const db = require('../db');
// const { text } = require('express');
const api = supertest(app);
let user = undefined;

let items = [
  {
    text: 'Terminar actividad de curso',
    checked: 0,
  },
  {
    text: 'Sacar dinero del cajero',
    checked: 0,
  },
  {
    text: 'Crear BackEnd de proyecto',
    checked: 0,
  },
];

let users = [
  {
    email: 'shaddai@gmail.com',
    password: 'TopOver.000',
  },
  {
    email: 'ramos@gmail.com',
    password: 'Secret.000',
  },
];

describe('test items endpoint /api/items', () => {
  // TESTS POST
  describe('post /api/items', () => {
    beforeAll(() => {
      // Borra todos los usuarios
      db.prepare('DELETE FROM users').run();
      db.prepare('DELETE FROM items').run();

      // Crear un usuario
      user = db
        .prepare(
          `
        INSERT INTO users (email, password)
        VALUES (?, ?)
        RETURNING *
      `,
        )
        .get('shaddai@gmail.com', 'Secreto.123');
    });
    // Primer test
    test('crea una tarea cuando todo esta correcto', async () => {
      const itemsBefore = db.prepare('SELECT * FROM items').all();
      const newItem = {
        text: 'Hacer dieta',
        checked: 0,
      };
      const response = await api
        .post('/api/items')
        .query({ userId: user.user_id })
        .send(newItem)
        .expect(201)
        .expect('Content-Type', /json/);
      const itemsAfter = db.prepare('SELECT * FROM items').all();
      expect(itemsAfter.length).toBe(itemsBefore.length + 1);
      expect(response.body).toStrictEqual({
        items_id: 1,
        text: 'Hacer dieta',
        checked: 0,
        user_id: 1,
      });
    });
    // segundo test
    test('no crea un item cuando está vacía', async () => {
      const itemsBefore = db.prepare('SELECT * FROM items').all();
      const newItem = {
        text: ' ',
      };
      const response = await api
        .post('/api/items')
        .query({ userId: user.user_id })
        .send(newItem)
        .expect(400)
        .expect('Content-Type', /json/);
      const itemsAfter = db.prepare('SELECT * FROM items').all();
      expect(itemsAfter.length).toBe(itemsBefore.length);
      expect(response.body).toStrictEqual({
        error: 'El item está vacío',
      });
    });
    // tercer test
    test('no crea un item cuando el usuario no inicio sesion', async () => {
      const itemsBefore = db.prepare('SELECT * FROM items').all();
      const newItem = {
        text: 'Pagar alquiler',
        checked: 0,
      };
      await api.post('/api/items').query({ user_id: null }).send(newItem).expect(403);
      const itemsAfter = db.prepare('SELECT * FROM items').all();
      expect(itemsAfter.length).toBe(itemsBefore.length);
    });
  });
  // TESTS PUT
  describe('put /api/items', () => {
    beforeAll(() => {
      // Borra todos los usuarios
      db.prepare('DELETE FROM users').run();
      db.prepare('DELETE FROM items').run();

      // Crear un usuario
      users = users.map((user) => {
        return db
          .prepare(
            `
      INSERT INTO users (email, password)
      VALUES (?, ?)
      RETURNING *
    `,
          )
          .get(user.email, user.password);
      });

      // Crear un item
      items = items.map((item) => {
        return db
          .prepare(
            `
          INSERT INTO items (text, checked, user_id)
          VALUES (?, ?, ?)
          RETURNING *
        `,
          )
          .get(item.text, item.checked, users[0].user_id);
      });
    });
    // Primer test
    test('actualiza item cuando todo esta correcto', async () => {
      const updatedParams = {
        text: 'Terminar actividad de curso',
        checked: 1,
      };
      const response = await api
        .put(`/api/items/${items[0].items_id}`)
        .query({ userId: users[0].user_id })
        .send(updatedParams)
        .expect(200)
        .expect('Content-Type', /json/);
      expect(response.body).toStrictEqual({
        items_id: 1,
        text: 'Terminar actividad de curso',
        checked: 1,
        user_id: 1,
      });
    });
    test('no actualiza cuando no es el usuario', async () => {
      const itemsBefore = db.prepare('SELECT * FROM items').all();
      const newItem = {
        text: 'Terminar actividad de curso',
        checked: 0,
      };
      await api.put('/api/items').query({ user_id: null }).send(newItem).expect(403);
      const itemsAfter = db.prepare('SELECT * FROM items').all();
      expect(itemsAfter.length).toBe(itemsBefore.length);
      // const response = await api;
      // .put(`/api/items/${items[0].items_id}`)
      // .query({ userId: null })
      // .send(newItem)
      // .expect(403);
      // .expect('Content-Type', /json/);
      // expect(response.body).toStrictEqual({
      //   error: 'No tiene los permisos',
      // });
    });
  });

  describe('delete /api/items', () => {
    beforeAll(() => {
      // Borra todos los usuarios y los items
      db.prepare('DELETE FROM users').run();
      db.prepare('DELETE FROM items').run();

      // Crear un contacto
      users = users.map((user) => {
        return db
          .prepare(
            `
      INSERT INTO users (email, password)
      VALUES (?, ?)
      RETURNING *
    `,
          )
          .get(user.email, user.password);
      });

      // Crear un item
      items = items.map((item) => {
        return db
          .prepare(
            `
          INSERT INTO items (text, checked, user_id)
          VALUES (?, ?, ?)
          RETURNING *
        `,
          )
          .get(item.text, item.checked, users[0].user_id);
      });
    });
    // Primer test
    test('elimina un item', async () => {
      const item = items[0];

      const response = await api
        .delete(`/api/items/${item.items_id}`)
        .query({ userId: users[0].user_id })
        .expect(200)
        .expect('Content-Type', /json/);
      expect(response.body).toStrictEqual({
        message: 'El item ha sido eliminado con exito',
      });
    });
    // Segundo test
    test('no elimina un item cuando el item no existe', async () => {
      const response = await api
        .delete(`/api/items/1000`)
        .query({ userId: users[0].user_id })
        .expect(400)
        .expect('Content-Type', /json/);
      expect(response.body).toStrictEqual({
        message: 'El item no existe',
      });
    });
    // Tercer test
    test('no elimina un item cuando no es el usuario correspondiente', async () => {
      const response = await api
        .delete(`/api/items/${items[1].items_id}`)
        .query({ userId: users[1].user_id })
        .expect(400)
        .expect('Content-Type', /json/);
      expect(response.body).toStrictEqual({
        message: 'El item no existe',
      });
    });
  });
});
