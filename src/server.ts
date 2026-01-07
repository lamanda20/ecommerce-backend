import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE (OBLIGATOIRE)
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

const PORT = Number(process.env.PORT);

if (!PORT) {
    throw new Error("PORT is not defined");
}

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

