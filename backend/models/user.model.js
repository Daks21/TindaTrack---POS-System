const bcrypt = require('bcrypt');

const users = [
  {
    id: 1,
    fullName: 'Admin User',
    email: 'admin@celsopos.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

const findByEmail = (email) => users.find(u => u.email === email) || null;

const findById = (id) => users.find(u => u.id === id) || null;

const createUser = ({ fullName, email, password, role = 'cashier' }) => {
  const user = {
    id: users.length + 1,
    fullName,
    email,
    password,
    role,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  return user;
};

module.exports = { findByEmail, createUser, findById };
