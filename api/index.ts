const express = require('express');
const bodyParser = require("body-parser");
const mysql = require('mysql');
const path = require('path');
const bcrypt = require('bcryptjs');  // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // For creating JSON Web Tokens (JWT)
const cors = require('cors');
require('dotenv').config();




// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456789',
  database: 'nodedatabase'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected as id ' + connection.threadId);
});

// Initialize the Express application
const app = express();
const urlencodedParser = bodyParser.urlencoded({extended:false})

// Middleware to parse JSON bodies
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));


// Enable CORS for all origins
app.use(cors({
    origin: ['https://your-frontend-domain.com', 'http://localhost:3000']
  }));

// Define the port the server will listen on
const PORT = process.env.PORT;

// Create routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'..','public','index.html')    );

});

app.get('/loginpage', (req, res) => {
    res.sendFile(path.join(__dirname,'..','public','login.html')
    );
});
app.get('/registerpage', (req, res) => {
    res.sendFile(path.join(__dirname,'..','/register.html')
    );
});


// Middleware to verify JWT and extract user information
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Assuming token is sent as "Bearer <token>"
    if (!token) {
        return res.status(401).json({ message: 'Access denied, token missing!' });
    }
    try {
        const verified = jwt.verify(token, 'strawberryshortcake');
        req.user = verified;  // req.user will now contain the user ID from the token
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token!' });
        };      
};

//Check if user is already logged in
app.get('/checklogin', authenticateToken, (req, res) => {
    res.json(req.user);
});

// POST /auth/login - Logs user in
app.post('/auth/login',urlencodedParser, async(req, res) => {
    const {username,password} = req.body;
    let dbpassword, dbusername, dbId;
    
    // Define the SQL query

    const sql = 'SELECT * FROM users WHERE Username  = ?';

    // Execute the query
    connection.query(sql,[username],async (error, rows) => {
        if (error) {
            console.error('Query error: ' + error.stack);
            return;
        }
        let results =JSON.parse(JSON.stringify(rows));
        if(Object.keys(results).length === 0){
            console.log("nuuu");
            return res.status(401).json({ message: 'Invalid username Or password' });
        }
        dbusername = results[0].Username;
        dbpassword = results[0].Password;
        dbId = results[0].Id;

        //  Compare the hashed password with the password provided by the user
        const isPasswordValid = await bcrypt.compare(password, dbpassword);
        //  const hashedPassword = await bcrypt.hash('password1', 10);
        //  console.log(hashedPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
     
        // If the password is valid, create a token
        const token = jwt.sign({ id: dbId }, 'strawberryshortcake', { expiresIn: '1h' });
        res.json({ token });

    });
 
 
    
       
});

// POST /auth/register - Registers new user
app.post('/auth/register',urlencodedParser, async(req, res) => {
    const {username,password,email,firstname,lastname} = req.body;
    
    // Hash inputted password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Define the SQL query
    const sql = ' INSERT INTO users (Username, Password, Email, Firstname, Lastname) VALUES (?, ?, ?, ?, ?)';

    // Execute the query
    connection.query(sql,[username, hashedPassword, email, firstname, lastname],async (error, rows) => {
        if (error) {
            console.error('Query error: ' + error.stack);
            if(error.code === 'ER_DUP_ENTRY'){
                res.status(403).json({ message: 'Username already exists' });
                return
            }
        }
        res.json({username,password });
    });       
});

// GET /expenses - Retrieve all expenses for the authenticated user
app.get('/expenses', authenticateToken, (req, res) => {
    const userId = req.user.id;
    // Define SQL query
    const sql = 'SELECT * FROM expenses WHERE userid  = ?';

    // Execute the query
    connection.query(sql,[userId],async (error, rows) => {
        if (error) {
            console.error('Query error: ' + error.stack);
            return;
        }
        let results =JSON.parse(JSON.stringify(rows));
        if(Object.keys(results).length === 0){
            return res.json({ message: 'User has no Transactions'});
        }
        
        res.json({results});

    });
});

// POST /expenses - Add a new expense for the authenticated user
app.post('/api/expenses', authenticateToken, (req, res) => {
    const { type, amount, name, date } = req.body;
    console.log(req.body)
    if (!type || !amount || !name || !date) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    // Define user id
    const user_id = req.user.id
    // Declare SQL Query
    const sql = 'INSERT INTO expenses (userid,amount,date,description,type) VALUES (?,?,?,?,?)';

    // Execute the query
    connection.query(sql,[user_id,amount, date, name, type],async (error, rows) => {
        if (error) {
            console.error('Query error: ' + error.stack);
            res.status(403).json({ message: 'Error Encountered' });
        }
        res.status(201).json({});;
    });

});

// Start the server and listen on the specified port
app.listen(process.env.PORT, () => console.log(`Server running`));

module.exports = app;