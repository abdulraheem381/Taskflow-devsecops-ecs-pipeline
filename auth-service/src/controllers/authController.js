const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function createAuthController({ db, jwtSecret, jwtExpiresIn }) {
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash)
    VALUES (@name, @email, @password_hash)
  `);
  const findUserByEmail = db.prepare(`
    SELECT id, name, email, password_hash, created_at
    FROM users
    WHERE email = ?
  `);
  const findUserById = db.prepare(`
    SELECT id, name, email, created_at
    FROM users
    WHERE id = ?
  `);

  function signToken(user) {
    return jwt.sign(
      { sub: user.id, email: user.email, name: user.name },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );
  }

  return {
    register(req, res) {
      const existingUser = findUserByEmail.get(req.body.email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const password_hash = bcrypt.hashSync(req.body.password, 10);
      const result = insertUser.run({
        name: req.body.name,
        email: req.body.email,
        password_hash
      });

      const user = findUserById.get(result.lastInsertRowid);
      const token = signToken(user);

      return res.status(201).json({ token, user });
    },

    login(req, res) {
      const user = findUserByEmail.get(req.body.email);
      if (!user || !bcrypt.compareSync(req.body.password, user.password_hash)) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = signToken(user);

      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        }
      });
    },

    me(req, res) {
      const user = findUserById.get(req.user.id);
      return res.json({ user });
    }
  };
}

module.exports = createAuthController;

