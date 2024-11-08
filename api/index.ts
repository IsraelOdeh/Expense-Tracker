require('dotenv').config();

const express = require('express');
const bodyParser = require("body-parser");
const mysql = require('mysql');
const path = require('path');
const bcrypt = require('bcryptjs');  // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // For creating JSON Web Tokens (JWT)
const cors = require('cors');
const { sql } = require('@vercel/postgres');


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
        res.status(403).sendFile(path.join(__dirname,'..','public','login.html'))
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
    

	try {
		const users = await sql`SELECT username,password,user_id FROM Users WHERE Username  = ${username} ;`;
		if (users && users.rows.length > 0) {
            dbusername = users.rows[0].username;
            dbpassword =  users.rows[0].password;
            dbId = users.rows[0].user_id;

			//  Compare the hashed password with the password provided by the user
            const isPasswordValid = await bcrypt.compare(password, dbpassword);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            // If the password is valid, create a token
            const token = jwt.sign({ id: dbId }, 'strawberryshortcake', { expiresIn: '1h' });
            res.json({ token });
		    } else {
		    	return res.status(401).json({ message: 'Invalid username Or password' });
		    }
	} catch (error) {
		console.error(error);
		res.status(500).send('Error retrieving users');
	}
       
});

// POST /auth/register - Registers new user
app.post('/auth/register',urlencodedParser, async(req, res) => {
    const {username,password,email,firstname,lastname} = req.body;
    
    // Hash inputted password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
		const users = await sql`SELECT username,email FROM Users;`;
		if (users && users.rows.length > 0) {
             
           var userMatch =false;
           var emailMatch =false;

            for (var index = 0; index < users.rows.length; ++index) {
                var row= users.rows[index];
                if(row.username == username == email){
                    userMatch = true;
                    break;
                }
                if(row.email == email){
                    emailMatch = true;
                    break;
                }
            }
            if (userMatch == true){
                res.status(403).json({ message: 'Username already exists' });
                return;
            }
            if (emailMatch == true){
                res.status(403).json({ message: 'Email is already in use' });
                return;
            }
		} else {
			res.status(404).send('Error retrieving users');
		}
	} catch (error) {
		console.error(error);
		res.status(500).send('Error retrieving users');
	}

    try {
		await sql`INSERT INTO Users (Username, Password, Email, Firstname, Lastname) VALUES (${username}, ${hashedPassword}, ${email}, ${firstname}, ${lastname});`;
         res.status(200).json({username,password });
	} catch (error) {
		console.error(error);
		res.status(500).send('Error adding user');
	}



});

// GET /expenses - Retrieve all expenses for the authenticated user
app.get('/expenses', authenticateToken, async(req, res) => {
    const userId = req.user.id;

    try {
		const users = await sql`SELECT * FROM Transaction WHERE user_id  = ${userId} ORDER BY date DESC;`;
		if (users && users.rows.length > 0) {
            res.json(users.rows);
		} else {
            return res.json({ message: 'User has no Transactions'});
		}
	} catch (error) {
		console.error(error);
		res.status(500).send('Error retrieving transactions');
	}
});

// POST /expenses - Add a new expense for the authenticated user
app.post('/api/expenses', authenticateToken, async(req, res) => {
    const { type, amount, category, description, date } = req.body;
    if (!type || !amount || !category || !description || !date) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    // Define user id
    const user_id = req.user.id
    
    try {
		await sql`INSERT INTO Transaction (user_id,amount,date,description,type,category) VALUES (${user_id}, ${amount}, ${date}, ${description}, ${type}, ${category});`;
		res.status(201).json({});;
	} catch (error) {
		console.error(error);
		res.status(500).send('Error adding transaction');
	}

});


app.post('/api/budget', authenticateToken, async(req, res) => {
    const {name, budget, month, year } = req.body;
    console.log(req.body)
    if (!name || !budget || !month || !year) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    // Get user id
    const user_id = req.user.id
    
    try {
		await sql`INSERT INTO Budgets (user_id,name, budget, month, year) VALUES (${user_id}, ${name}, ${budget}, ${month}, ${year});`;
		res.status(201).json({});;
	} catch (error) {
		console.error(error);
		res.status(500).send('Error adding budget');
	}

});


app.get('/budget', authenticateToken, async(req, res) => {
    const userId = req.user.id;

    try {
		const budget = await sql`SELECT * FROM budgets WHERE user_id  = ${userId} ORDER BY created_at DESC;`;
		if (budget && budget.rows.length > 0) {
            console.log(budget.rows)
            let budgetrow = budget.rows;
            let expenserow = null;
            try {
                const users = await sql`SELECT amount, date, category FROM Transaction WHERE user_id  = ${userId} AND type = 'expense';`;
                if (users && users.rows.length > 0) {
                    expenserow = users.rows;
                } 
                res.json({budgetrow, expenserow});
            } catch (error) {
                console.error(error);
                res.status(500).send('Error retrieving transactions');
            }
            
		} else {
            return res.json({ message: 'User has no Transactions'});
		}
	} catch (error) {
		console.error(error);
		res.status(500).send('Error retrieving transactions');
	}
});



// Start the server and listen on the specified port
app.listen(process.env.PORT, () => console.log(`Server running`));

module.exports = app;