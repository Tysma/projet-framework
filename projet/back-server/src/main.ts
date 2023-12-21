import express from "express";
import bodyParser from "body-parser";
import mariadb from "mariadb";
import bcrypt from "bcrypt";

// const pool = mariadb.createPool({
//   host: process.env.DB_HOST ?? "localhost",
//   port: 8889,
//   user: process.env.DB_USER ?? "mathyss",
//   password: process.env.DB_PASSWORD ?? "mathys",
//   database: process.env.DB_DATABASE ?? "test",
//   connectionLimit: 5,
// });

const pool = mariadb.createPool({
  host: "localhost",
  port: 8889,
  user: "mathyss",
  password: "mathys",
  database: "test",
  connectionLimit: 5,
});



console.log("ENV vars", process.env);
console.log("database pool", pool);

const app = express();
app.use(bodyParser.json());

//VISUALISER

app.get("/api/cards", async (req, res) => {
  const connection = await pool.getConnection();
  const cards = await connection.query("SELECT * from CARDS");
  await connection.end();
  res.json(cards);
});

// LOGIN

app.post("/api/auth/login", async (req, res) => {

  const user = req.body;
  console.log("login request for user", user);

  try {
    const connection = await pool.getConnection();
    const queryResult = await connection.query(
      "SELECT id, password FROM users WHERE mail = ?",
      [user.mail]
    );

    console.log(queryResult);

    if (queryResult.length > 0) {
      const storedPassword = queryResult[0].password;
      const passwordMatch = await bcrypt.compare(user.password, storedPassword);

      if (passwordMatch) {
        const token = `${user.mail}-${Number(new Date()).toString(36)}`;

        await connection.query(
          "INSERT INTO users_tokens (id_user, token) VALUES (?, ?)",
          [queryResult[0].id, token]
        );

        res.json({
          token,
        });
      } else {
        res.status(401).json({ message: "Mot de passe incorrect" });
      }
    } else {
      res.status(401).json({ message: "Aucun utilisateur trouvé avec cet email" });
    }

    await connection.end();
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la vérification de l'utilisateur",
    });
  }
});



// REGISTER

app.post("/api/auth/register", async (req, res) => {
  const user = req.body;
  console.log("register request for user", user);

  const connection = await pool.getConnection();
  try {
    const existingUser = await connection.query(
      "SELECT * FROM users WHERE mail = ?",
      [user.mail]
    );

    if (existingUser.length > 0) {
      res.status(409).json({
        message: "Un utilisateur existe déjà avec cette adresse mail",
      });
    } else {
      // permet de crypter le mot de passe à l'aide de bcrypt
      const hashedPassword = await bcrypt.hash(user.password, 1);

      await connection.query("INSERT INTO users (mail, password) VALUES (?, ?)",
      [user.mail, hashedPassword]);

      res.json({ message: "Utilisateur créé avec succès" });
    }
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la création de l'utilisateur",
    });
  } finally {
    await connection.end();
  }
});

// Ajout

app.post("/api/ajout/cards", async (req, res) => {
  const newCard = req.body;
  console.log("Ajout de nouvelle carte:", newCard);

  const connection = await pool.getConnection();
  try {
    await connection.query(
      "INSERT INTO cards (name, marque, taille) VALUES (?, ?, ?)",
      [newCard.name, newCard.marque, newCard.taille]
    );

    res.json({ message: "Carte ajoutée avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la carte :", error);
    res.status(500).json({
      message: "Erreur serveur lors de l'ajout de la carte",
    });
  } finally {
    await connection.end();
  }
});

// FAVORITES

// app.get("/api/cards/favorites", async (req, res) => {
//   // on récupère le header dans une var
//   const authHeader = req.headers.authorization;
//   console.log("req.headers.authorization", authHeader);
  // On vérifie que le header existe et que sa valeur commence par bearer
//   if (
//     authHeader == null ||
//     !authHeader.toLocaleLowerCase().startsWith("bearer ")
//   ) {
//     res.sendStatus(403);
//     return;
//   }

//   // On isole le token
//   const token = authHeader.substring("bearer ".length);
//   const connection = await pool.getConnection();
//   // Récupération du token de la BDD
//   const userIds = await connection.query(
//     "SELECT id_user FROM USERS_TOKENS WHERE token = ?",
//     [token]
//   );
//   console.log("Found user ids", userIds);
//   connection.end();
//   if (userIds.length != 1) {
//     console.warn("no unique user id found", userIds);
//     res.status(403).end();
//     return;
//   }
//   const userId = userIds[0].id_user;
//   const favorites = await connection.query(
//     `select CARDS.id, CARDS.name, CARDS.attack, CARDS.type 
//       from CARDS INNER JOIN USERS_CARDS 
//       on USERS_CARDS.id_card = CARDS.id 
//       AND USERS_CARDS.id_user = ?`,
//     [userId]
//   );
//   res.send(favorites);
// });

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});