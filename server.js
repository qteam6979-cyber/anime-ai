const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.static(__dirname));

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({
                error: "No message provided"
            });
        }

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "ANIME AI"
                },
                body: JSON.stringify({
                  model: "openrouter/free",
                    messages: [
                        {
                            role: "system",
                            content: `
You are ANIME AI, an expert Roblox development assistant.

Your main job is to help users create Roblox games using Luau.

You can:
- Write complete Luau scripts
- Create Roblox GUI and UI scripts
- Help design Roblox interfaces
- Fix broken Roblox scripts
- Explain where scripts should be placed
- Explain code clearly

When creating a script:
1. Give complete working code.
2. Say exactly where the script should go.
3. Explain important setup steps.
4. Use Roblox Luau.
5. Do not give incomplete code unless the user asks for an example.

If the user asks for UI, explain the required Roblox objects and provide the code to create or control them.
                            `
                        },
                        {
                            role: "user",
                            content: userMessage
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.log(data);

            return res.status(500).json({
                error: data.error?.message || "AI API error"
            });
        }

        res.json({
            reply: data.choices[0].message.content
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Something went wrong connecting to the AI."
        });
    }
});

app.listen(PORT, () => {
    console.log(`ANIME AI is running at http://localhost:${PORT}`);
});