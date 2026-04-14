const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const app = express();
app.use(bodyParser.json());

// Health check
app.get("/", (req, res) => {
    res.send("DOCX Generator API is running 🚀");
});

// Generate DOCX API
app.post("/generate-docx", (req, res) => {
    try {
        const { Name, Email, Amount } = req.body;

        // Load template
        const filePath = path.join(__dirname, "template.docx");
        const content = fs.readFileSync(filePath, "binary");

        const zip = new PizZip(content);

        // ✅ IMPORTANT: Custom delimiters { }
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: {
                start: "{",
                end: "}"
            }
        });

        // Set data
        doc.setData({
            Name: Name || "Default Name",
            Email: Email || "noemail@example.com",
            Amount: Amount || "0"
        });

        // Render document
        try {
            doc.render();
        } catch (error) {
            console.log("Render Error:", JSON.stringify(error, null, 2));
            throw error;
        }

        // Generate buffer
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
        console.error("FULL ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message,
            details: error.properties || error
        });
    }
});

// Start server (ONLY ONCE)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
