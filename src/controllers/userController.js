const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    const { Name, Email, Password, Role } = req.body;

    // 1. Validation: Ensure all fields are provided
    if (!Name || !Email || !Password || !Role) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Password, saltRounds);

        // 2. Generate a Guid for the new user
        const newId = uuidv4();
        
        // 3. SQL Query matching your standardized columns
        const query = `
            INSERT INTO Users (Id, Name, Email, Password, Role, CreatedBy) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        // For registration, CreatedBy is the user themselves (newId)
        await db.execute(query, [newId, Name, Email, hashedPassword, Role, newId]);

        res.status(201).json({
            message: "User registered successfully!",
            userId: newId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during registration.", error: error.message });
    }
};


exports.loginUser = async (req, res) => {
    try {
        const { Email, Password } = req.body;
        const jwtSecret = process.env.JWT_SECRET;

        if (!Email || !Password) {
            return res.status(400).json({ error: 'Email and Password are required' });
        }

        if (!jwtSecret) {
            return res.status(500).json({ error: 'JWT secret is not configured' });
        }

        // 1. Find the user by Email
        const [rows] = await db.execute(
            'SELECT * FROM Users WHERE Email = ?', 
            [Email]
        );

        if (rows.length === 0) {
            // Senior Engineer Tip: Use generic messages for security
            return res.status(401).json({ error: "Invalid Email or Password" });
        }

        const user = rows[0];

        // 2. Compare the provided password with the Hashed password in DB
        const isMatch = await bcrypt.compare(Password, user.Password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid Email or Password" });
        }

        const tokenPayload = {
            id: user.Id,
            email: user.Email,
            role: user.Role
        };

        const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '1h' });

        res.status(200).json({ 
            message: "Login successful", 
            token,
            user: {
                id: user.Id,
                name: user.Name,
                email: user.Email,
                role: user.Role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Login process failed" });
    }
};