const express = require("express");
const dotenv = require("dotenv");

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

        console.log("USER:", userMessage);

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    "Authorization":
                        `Bearer ${process.env.OPENROUTER_API_KEY}`,

                    "HTTP-Referer":
                        "http://localhost:3000",

                    "X-Title":
                        "PorangeAI"
                },

                body: JSON.stringify({

                    model:
                        "deepseek/deepseek-chat-v3-0324:free",

                    messages: [

                        {
                            role: "system",

                            content: `

You are PorangeAI.

You control Roblox Studio through actions.

You MUST return ONLY valid JSON.

Your response MUST ALWAYS look like this:

{
  "reply": "short explanation",
  "actions": []
}

When the user asks to create, build, add, put, make, delete, rename, or modify something in Roblox Studio, you MUST put actions in the actions array.

Supported actions:

create_instance
create_script
delete_instance
rename_instance
set_properties

Example:

{
  "reply": "Created a black anchored Part in Workspace.",
  "actions": [
    {
      "type": "create_instance",
      "className": "Part",
      "name": "BlackPart",
      "parent": "Workspace",
      "properties": {
        "Color": [0, 0, 0],
        "Size": [4, 1, 4],
        "Anchored": true
      }
    }
  ]
}

For scripts:

{
  "type": "create_script",
  "name": "MyScript",
  "parent": "ServerScriptService",
  "scriptType": "Script",
  "source": "print('Hello')"
}

For LocalScripts:

{
  "type": "create_script",
  "name": "MyLocalScript",
  "parent": "StarterPlayer.StarterPlayerScripts",
  "scriptType": "LocalScript",
  "source": "print('Hello')"
}

For ModuleScripts:

{
  "type": "create_script",
  "name": "MyModule",
  "parent": "ReplicatedStorage",
  "scriptType": "ModuleScript",
  "source": "local module = {} return module"
}

Available parents:

Workspace
ServerScriptService
ReplicatedStorage
StarterGui
StarterPlayer
StarterPlayer.StarterPlayerScripts

Nested paths are allowed.

If the user asks for something to be created in Roblox Studio, DO NOT only explain it.

RETURN THE ACTIONS.

If the user asks a normal question, return:

{
  "reply": "answer",
  "actions": []
}

ALWAYS RETURN VALID JSON.

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

        console.log(
            "OPENROUTER RESPONSE:",
            JSON.stringify(data, null, 2)
        );

        if (!response.ok) {

            return res.status(500).json({

                error:
                    data.error?.message ||
                    "OpenRouter API error"

            });

        }

        let content =
            data.choices?.[0]?.message?.content;

        if (!content) {

            return res.status(500).json({

                error:
                    "AI returned no content"

            });

        }

        content =
            content
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

        let result;

        try {

            result =
                JSON.parse(content);

        } catch (error) {

            console.log(
                "AI JSON ERROR:",
                content
            );

            const firstBrace =
                content.indexOf("{");

            const lastBrace =
                content.lastIndexOf("}");

            if (
                firstBrace !== -1 &&
                lastBrace !== -1
            ) {

                const jsonText =
                    content.substring(
                        firstBrace,
                        lastBrace + 1
                    );

                result =
                    JSON.parse(jsonText);

            } else {

                return res.status(500).json({

                    error:
                        "AI returned invalid JSON",

                    raw:
                        content

                });

            }

        }

        if (
            !Array.isArray(
                result.actions
            )
        ) {

            result.actions = [];

        }

        if (
            !result.reply
        ) {

            result.reply =
                "Command completed.";

        }

        console.log(
            "FINAL ACTION COUNT:",
            result.actions.length
        );

        res.json(result);

    } catch (error) {

        console.error(
            "SERVER ERROR:",
            error
        );

        res.status(500).json({

            error:
                error.message

        });

    }

});

app.listen(
    PORT,
    () => {

        console.log(
            `PorangeAI running at http://localhost:${PORT}`
        );

    }

);
