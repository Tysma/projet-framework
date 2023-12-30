import express from "express";
import bodyParser from "body-parser";
import mariadb from "mariadb";
import bcrypt from "bcrypt";
import path from "path";

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  //port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 5,
});

console.log("ENV vars", process.env);
console.log("database pool", pool);

const app = express();
app.use(bodyParser.json());

app.use(express.static('/home/mathysc/www/public'));

app.get('/', (req, res) => {
    res.sendFile('/home/mathysc/www/public/index.html');
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

// ADD

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

// READ 

app.get("/api/shoes", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const shoes = await connection.query(
      "SELECT id, name, marque, taille FROM CARDS"
    );

    res.json(shoes);
  } catch (error) {
    console.error("Erreur lors de la récupération des cartes :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des cartes",
    });
  } finally {
    await connection.end();
  }
});

// ADD (verification de la meme carte en bdd)

app.post("/api/ajout/cards", async (req, res) => {
  const newCard = req.body;

  const connection = await pool.getConnection();
  try {
    const existingCard = await connection.query(
      "SELECT * FROM CARDS WHERE name = ? AND marque = ? AND taille = ?",
      [newCard.name, newCard.marque, newCard.taille]
    );

    if (existingCard.length > 0) {
      res.status(409).json({
        message: "Une carte avec ces détails existe déjà",
      });
    } else {
      await connection.query(
        "INSERT INTO CARDS (name, marque, taille) VALUES (?, ?, ?)",
        [newCard.name, newCard.marque, newCard.taille]
      );

      res.json({ message: "Carte ajoutée avec succès" });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de la carte :", error);
    res.status(500).json({
      message: "Erreur serveur lors de l'ajout de la carte",
    });
  } finally {
    await connection.end();
  }
});

// UPDATE

app.post("/api/shoes/update", async (req, res) => {
  const updatedShoes = req.body;
  console.log("Update", updatedShoes);

  const connection = await pool.getConnection();
  try {
    const existingShoes = await connection.query(
      "SELECT * FROM CARDS WHERE name = ?",
      [updatedShoes.name]
    );

    if (existingShoes.length > 0) {
      await connection.query(
        "UPDATE CARDS SET marque = ?, taille = ? WHERE name = ?",
        [
          updatedShoes.marque,
          updatedShoes.taille,
          updatedShoes.name,
        ]
      );

      res.json({
        message: "Mis à jour avec succès",
      });
    } else {
      res.status(409).json({
        message: "La carte n'existe pas dans la bdd",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la mise à jour",
    });
  } finally {
    await connection.end();
  }
});

// DELETE (condition de verification)

app.post("/api/shoes/delete", async (req, res) => {
  const deleteShoes = req.body;
  console.log("Delete", deleteShoes);

  const connection = await pool.getConnection();
  try {
    const existingShoes = await connection.query(
      "SELECT * FROM CARDS WHERE name = ?",
      [deleteShoes.name]
    );

    if (existingShoes.length > 0) {
      await connection.query("DELETE FROM CARDS WHERE name = ?", [
        deleteShoes.name,
      ]);

      res.json({
        message: "Supprimé avec succès",
      });
    } else {
      res.status(409).json({
        message: "Cette carte n'existe pas dans la base de données",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la mise à jour",
    });
  } finally {
    await connection.end();
  }
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});