const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const verifyToken = require('../middleware/authMiddleware');
const { getCurrentMalaysiaMySQLDate } = require('../helper/helper');

exports.createRecord = async (req, res) => {
    verifyToken(req, res, async () => {
        try {
            const { PatientId, HeartRate, BloodPressure, BloodSugar, Notes } = req.body;

            const Id = uuidv4();
            const now = getCurrentMalaysiaMySQLDate();
            const CreatorId = req.user?.id || req.user?.userId;

            const sql = `INSERT INTO HealthRecords 
                        (Id, PatientId, HeartRate, BloodPressure, BloodSugar, Notes, CreatedBy, DatetimeCreated, UpdatedBy, DatetimeUpdated) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const values = [
                Id,
                PatientId,
                HeartRate,
                BloodPressure,
                BloodSugar,
                Notes || null,
                CreatorId,
                now,
                CreatorId,
                now
            ];

            await db.execute(sql, values);

            res.status(201).json({
                message: "Health record saved successfully",
                RecordId: Id
            });
        } catch (error) {
            console.error("Health API Error:", error.sqlMessage || error);
            res.status(500).json({ error: "Failed to save health data" });
        }
    });
};