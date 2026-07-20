const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1"
});

exports.handler = async function (event) {

    if (event.httpMethod !== "POST") {

        return {
            statusCode: 405,
            body: JSON.stringify({
                error: "Method not allowed"
            })
        };

    }

    try {

        const body =
            JSON.parse(event.body || "{}");

        const userMessage =
            body.message;


        if (!userMessage) {

            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "No message provided"
                })
            };

        }


        const response =
            await client.chat.completions.create({

                model: "openrouter/free",

                messages: [

                    {
                        role: "system",

                        content: `

You are PorangeAI.

You are an AI developer that can control Roblox Studio.

The user can ask you to create, modify, delete, or build things in Roblox Studio.

You MUST return ONLY valid JSON.

Do not use Markdown.
Do not use code blocks.
Do not write text outside the JSON.

Your response MUST ALWAYS have this format:

{
  "reply": "Short explanation",
  "actions": []
}

When the user asks to make something in Roblox Studio, put the required actions inside the actions array.

Example:

User:
Put a black part in Workspace.

Response:

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

Supported action types:

create_instance
create_script
delete_instance
rename_instance
set_properties

For scripts:

{
  "type": "create_script",
  "name": "MyScript",
  "parent": "ServerScriptService",
  "scriptType": "Script",
  "source": "print('Hello')"
}

For a LocalScript:

{
  "type": "create_script",
  "name": "MyLocalScript",
  "parent": "StarterPlayer.StarterPlayerScripts",
  "scriptType": "LocalScript",
  "source": "print('Hello')"
}

For a ModuleScript:

{
  "type": "create_script",
  "name": "MyModule",
  "parent": "ReplicatedStorage",
  "scriptType": "ModuleScript",
  "source": "local module = {} return module"
}

You can create multiple actions in one response.

If the user asks to create a complete system, create all necessary objects and scripts.

For example, a shop system may need:

Folder
RemoteEvent
Script
LocalScript
ScreenGui
Frame
TextButton
TextLabel

Available Roblox parents:

Workspace
ServerScriptService
ReplicatedStorage
StarterGui
StarterPlayer
StarterPlayer.StarterPlayerScripts

Nested paths are allowed.

Example:

StarterGui.ShopGui

ReplicatedStorage.Remotes

If the user asks a normal question and does not want anything changed in Roblox Studio, return:

{
  "reply": "Your answer",
  "actions": []
}

Always return valid JSON.

`

                    },

                    {

                        role: "user",

                        content:
                            userMessage

                    }

                ]

            });


        let content =
            response
                .choices[0]
                .message
                .content;


        console.log(
            "RAW AI RESPONSE:",
            content
        );


        content =
            content
                .replace(
                    /```json/gi,
                    ""
                )
                .replace(
                    /```/g,
                    ""
                )
                .trim();


        let result;


        try {

            result =
                JSON.parse(
                    content
                );

        } catch (error) {

            console.log(
                "AI RETURNED INVALID JSON"
            );


            result = {

                reply:
                    content,

                actions: []

            };

        }


        return {

            statusCode: 200,

            headers: {

                "Content-Type":
                    "application/json"

            },

            body:
                JSON.stringify(
                    result
                )

        };


    } catch (error) {

        console.error(
            error
        );


        return {

            statusCode: 500,

            body:
                JSON.stringify({

                    error:
                        error.message

                })

        };

    }

};
