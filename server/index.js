import express from "express"
import pkg from "pg"; // This is how you import a package in ES6 modules
import cors from "cors"

const { Pool } = pkg;

const app = express()

app.use(express.json())
app.use(cors())

const pool = new Pool({
  user: 'postgres',      // Your PostgreSQL username
  host: 'localhost',     // Database host, typically localhost
  database: 'proto_DB',     // Your database name
  password: 'root',      // Your PostgreSQL password
  port: 5432,            // Default PostgreSQL port
});



  app.get("/", (req,res)=>{
    res.json("Hello this is the backend !")
  })


  app.get("/ot", async (req, res) => {
    const q = "SELECT * FROM OTH_DAT";
    try {
        const result = await pool.query(q);
        res.status(200).json({ status: "success", data: result.rows });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

app.get("/cmd", async (req, res) => {
  const q = "SELECT * FROM OTL_DAT";
  try {
      const result = await pool.query(q);
      res.status(200).json({ status: "success", data: result.rows });
  } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
  }
});

/*

app.get("/ot", (req, res) => {
    const q = "SELECT * FROM OTH_DAT";
    pool.query(q, (err, data) => {
      if (err) {
        return res.status(500).json({ error: err.message });  // Return an error message if something goes wrong
      }
      return res.json(data.rows);  // Return only the rows with the actual data
    });
  });

  app.get("/cmd", (req, res) => {
    const q = "SELECT * FROM OTL_DAT";
    pool.query(q, (err, data) => {
      if (err) {
        return res.status(500).json({ error: err.message });  // Return an error message if something goes wrong
      }
      return res.json(data.rows);  // Return only the rows with the actual data
    });
  });

  

  app.post("/books",(req,res)=>{
    const q = "INSERT INTO books (TITLE,ABOUT,COVER) VALUES ($1, $2, $3) RETURNING *";
    //const values=["Title from BE","About from BE","Cover from BE"]
    const values=[req.body.title,req.body.about,req.body.cover]
    pool.query(q,values,(err, data) => {
        if (err) {
            return res.status(500).json({ error: err.message });  // Return an error message if something goes wrong
          }
        
      return res.json("The book has been created .");  // Return the inserted row
    })   
  })

  app.delete("/books/:id", (req,res)=>{
    const bookId= req.params.id;
    const q ="DELETE FROM books where id=$1"

    pool.query(q,[bookId],(err,data)=>{
      if(err) return res.json(err)
      return res.json("Book deleted !")
    })
  })

  app.put("/books/:id", (req,res)=>{
    const bookId= req.params.id;
    const q ="UPDATE books SET title=$1 , about=$2 WHERE id=$3"
    const values=[
      req.body.title,req.body.about,bookId
    ]
    pool.query(q,values,(err,data)=>{
      if(err) return res.json(err)
      return res.json("Book updated !")
    })
  })

  */


app.listen(8800, ()=>{

    console.log("Connected to backend!")
})