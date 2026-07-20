const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1"
});

exports.handler = async function(event) {

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

You are PORANGEAI, an expert Roblox Studio AI developer.

You can help users build Roblox games.

IMPORTANT:

When the user asks you to CREATE, BUILD, ADD, MAKE, DELETE, CHANGE, or MODIFY something in Roblox Studio, you MUST return Roblox actions.

Your response MUST be valid JSON only.

Use this format:

{
  "reply": "Short explanation of what you did.",
  "actions": [
    {
      "type": "create_instance",
      "className": "Part",
      "name": "ExamplePart",
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

Available action types:

1. create_instance
2. create_script
3. delete_instance
4. rename_instance
5. set_properties

The AI may use MANY actions at once.

For example, when asked to make a shop system, you can create:

- Folders
- RemoteEvents
- Scripts
- LocalScripts
- ScreenGuis
- Frames
- TextButtons
- TextLabels
- Parts
- Models

For Roblox objects, use Roblox class names such as:

Part
Folder
Model
ScreenGui
Frame
TextButton
TextLabel
RemoteEvent
RemoteFunction
Script
LocalScript
ModuleScript

The parent must use paths such as:

Workspace
ServerScriptService
ReplicatedStorage
StarterGui
StarterPlayer
StarterPlayer.StarterPlayerScripts

For nested objects, use:

StarterGui.ShopGui
ReplicatedStorage.Remotes

If creating a complete system, create all required objects and scripts.

Return ONLY valid JSON.
No Markdown.
No code fences.
No extra text outside the JSON.

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


        // Remove accidental Markdown fences

        content =
            content
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();


        let result;


        try {

            result =
                JSON.parse(content);

        } catch (error) {

            result = {

                reply: content,

                actions: []

            };

        }


        return {

            statusCode: 200,

            headers: {

                "Content-Type":
                    "application/json"

            },

            body: JSON.stringify(result)

        };


    } catch (error) {

        console.error(error);


        return {

            statusCode: 500,

            body: JSON.stringify({

                error:
                    error.message

            })

        };

    }

};
