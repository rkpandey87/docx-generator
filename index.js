const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
app.use(bodyParser.json());

// Health check (optional but useful)
app.get("/", (req, res) => {
    res.send("DOCX Generator API is running 🚀");
});

app.post("/generate-docx", (req, res) => {
    try {
        const { Name, Email, Amount } = req.body;

        // Load template file
        const filePath = path.join(__dirname, "template.docx");
        const content = fs.readFileSync(filePath, "binary");

        // Load DOCX into memory
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true
        });

        // Replace placeholders
        doc.setData({
            Name: Name || "Default Name",
            Email: Email || "noemail@example.com",
            Amount: Amount || "0"
        });

        doc.render();

        // Generate DOCX buffer
        const buffer = doc.getZip().generate({
            type: "nodebuffer"
        });

        // Convert to Base64
        const base64File = buffer.toString("base64");

        res.json({
            success: true,
            file: base64File
        });

    } catch (error) {
        console.error("Error generating DOCX:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// IMPORTANT for Render deployment
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
