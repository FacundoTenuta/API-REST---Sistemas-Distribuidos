const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'API REST - Sistemas Distribuidos',
            description: "Una pequeña API REST para un trabajo de la materia Sistemas Distribuidos",
            contact: {
                name: "Facundo Tenuta"
            },
            servers: [""]
        }
    },
    apis: ["index.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Routes
/**
 * @swagger
 * /posts:
 *  get:
 *      description: Use to request all posts
 *      tags: 
 *        - posts
 *      responses:
 *          '200':
 *            description: A successful response
 */
app.get("/posts", (req, res) => {

    db.all("SELECT * FROM posts", [], (err, data) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.status(200).json({data});
      });

});

/**
 * @swagger
 * /posts/{post_id}:
 *  get:
 *      description: Use to request one post
 *      tags: 
 *        - posts
 *      responses:
 *          '200':
 *            description: A successful response
 */
app.get("/posts/:id", (req, res) => {

    // var params = [req.params.id]
    db.get(`SELECT * FROM posts where post_id = ?`, [req.params.id], (err, data) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.status(200).json(data);
    });

    // res.status(200).json({
    //     metodo: "get",
    //     info: "esto es una api rest"
    // })

});


/**
 * @swagger
 * /posts:
 *  post:
 *      description: Use to create a post
 *      tags: 
 *        - posts
 *      parameters:
 *        - in: body
 *          name: title
 *          required: true
 *          schema:
 *              type: string
 *        - in: body
 *          name: description
 *          required: true
 *          schema:
 *              type: string
 *      responses:
 *          '201':
 *            description: A successful response
 */
app.post('/posts', (req, res) => {

    const { title, description } = req.body;
    db.run(`INSERT INTO posts (title, description) VALUES (?,?)`,
        [title, description],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": err.message })
                return;
            }
            res.status(201).json({result})
        });

});


/**
 * @swagger
 * /posts/{post_id}:
 *  delete:
 *      description: Use to delete a post
 *      tags: 
 *        - posts
 *      parameters:
 *        - in: header
 *          name: post_id
 *          schema:
 *              type: integer
 *      responses:
 *          '202':
 *            description: A successful response
 */
app.delete(`/posts/:id`, (req, res) => {

    const { id } = req.params;

    db.run(`DELETE FROM posts WHERE post_id = ?`,
        [id],
        function (err, result) {
            if (err) {
                res.status(400).json({ result })
                return;
            }
            res.status(200).json({ result })
        });

});


/**
 * @swagger
 * /posts/{post_id}:
 *  put: 
 *      description: Use to update one post
 *      tags: 
 *        - posts
 *      parameters:
 *        - in: header
 *          name: post_id
 *          schema:
 *              type: integer
 *      responses:
 *          '202':
 *            description: A successful response
 */
app.put('/posts/:id', (req, res) => {

    var reqBody = req.body;
    var reqId = req.params.id;
    db.run(`UPDATE posts set title = ?, description = ? WHERE post_id = ?`,
        [reqBody.title, reqBody.description, reqId],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.status(200).json({ updatedID: this.changes });
        });

});


app.listen(3000, () => {
    console.log(`Server running on port ${ 3000 }`);
});

// DB connection
const db = new sqlite3.Database('./sqlite.db', (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {

        db.run('CREATE TABLE posts(post_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, title NVARCHAR(20), description NVARCHAR(200))', (err) => {
            if (err) {
                console.log("Table already exists.");
            }
            // let insert = 'INSERT INTO posts (title, description) VALUES (?,?)';
            // db.run(insert, ["Docker", "Docker es un proyecto de código abierto que automatiza el despliegue de aplicaciones dentro de contenedores de software, proporcionando una capa adicional de abstracción y automatización de virtualización de aplicaciones en múltiples sistemas operativos."]);
        });
    }
});