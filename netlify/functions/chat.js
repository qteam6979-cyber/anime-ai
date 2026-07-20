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

        const body = JSON.parse(
            event.body || "{}"
        );

        const userMessage = body.message;

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

                // Use a specific model instead of
                // openrouter/free
                model:
                    "deepseek/deepseek-chat-v3-0324:free",

                messages: [

                    {
                        role: "system",

                        content: `
You are PorangeAI.

You are a Roblox Studio AI developer.

You can control Roblox Studio by returning actions.

The user can ask you to:

- Create Parts
- Create folders
- Create Models
- Create GUIs
- Create Scripts
- Create LocalScripts
- Create ModuleScripts
- Create RemoteEvents
- Create complete systems
- Delete objects
- Rename objects
- Change properties
- Build game systems

IMPORTANT:

You MUST return ONLY valid JSON.

NEVER use Markdown.

NEVER use code blocks.

NEVER write anything outside the JSON.

Your response MUST ALWAYS have this exact structure:

{
  "reply": "Short explanation",
  "actions": []
}

If the user asks you to create or change something in Roblox Studio, the actions array MUST contain the actions needed to do it.

EXAMPLE:

User:
Put a black part in Workspace.

You MUST return:

{
  "reply": "Created a black anchored black Part in Workspace.",
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

For multiple objects, return multiple actions.

Example:

{
  "reply": "Created a folder and a part.",
  "actions": [
    {
      "type": "create_instance",
      "className": "Folder",
      "name": "MyFolder",
      "parent": "Workspace"
    },
    {
      "type": "create_instance",
      "className": "Part",
      "name": "MyPart",
      "parent": "Workspace",
      "properties": {
        "Anchored": true
      }
    }
  ]
}

For scripts use:

{
  "type": "create_script",
  "name": "MyScript",
  "parent": "ServerScriptService",
  "scriptType": "Script",
  "source": "print('Hello')"
}

For LocalScripts use:

{
  "type": "create_script",
  "name": "MyLocalScript",
  "parent": "StarterPlayer.StarterPlayerScripts",
  "scriptType": "LocalScript",
  "source": "print('Hello')"
}

For ModuleScripts use:

{
  "type": "create_script",
  "name": "MyModule",
  "parent": "ReplicatedStorage",
  "scriptType": "ModuleScript",
  "source": "local module = {} return module"
}

Supported action types:

create_instance
create_script
delete_instance
rename_instance
set_properties

Available Roblox locations:

Workspace
ServerScriptService
ReplicatedStorage
StarterGui
StarterPlayer
StarterPlayer.StarterPlayerScripts

Nested paths are allowed.

Examples:

StarterGui.ShopGui

ReplicatedStorage.Remotes

If the user asks for a complete system, create everything needed.

For example, a shop system can include:

- Folder
- RemoteEvent
- Script
- LocalScript
- ScreenGui
- Frame
- TextButton
- TextLabel

When the user asks to create something, DO NOT just explain how to do it.

Actually return the actions needed to create it.

For example, if the user says:

"Make a shop UI"

you must return actions that create the UI.

If the user asks a normal question that does not require changing Roblox Studio, return:

{
  "reply": "Your answer",
  "actions": []
}

Always return valid JSON.
`
                    },

                    {
                        role: "user",
                        content: userMessage
                    }

                ]

            });


        let content =
            response.choices[0].message.content;


        console.log(
            "RAW AI RESPONSE:"
        );

        console.log(
            content
        );


        // Remove Markdown code fences
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
                JSON.parse(content);


            // Make sure actions always exists
            if (
                !Array.isArray(
                    result.actions
                )
            ) {

                result.actions = [];

            }


            // Make sure reply exists
            if (
                !result.reply
            ) {

                result.reply =
                    "Command processed.";

            }


        } catch (error) {

            console.log(
                "AI RETURNED INVALID JSON:"
            );

            console.log(
                content
            );


            result = {

                reply:
                    "The AI returned an invalid command format.",

                actions: []

            };

        }


        console.log(
            "FINAL RESULT:"
        );

        console.log(
            JSON.stringify(
                result,
                null,
                2
            )
        );


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
            "CHAT FUNCTION ERROR:",
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
