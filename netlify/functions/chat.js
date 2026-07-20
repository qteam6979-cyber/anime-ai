const OpenAI = require("openai");

const client = new OpenAI({

    apiKey:
        process.env.OPENROUTER_API_KEY,

    baseURL:
        "https://openrouter.ai/api/v1"

});


exports.handler = async function(event) {


    if (
        event.httpMethod !== "POST"
    ) {


        return {

            statusCode:
                405,

            body:
                JSON.stringify({

                    error:
                        "Method not allowed"

                })

        };

    }


    try {


        const body =
            JSON.parse(

                event.body ||
                "{}"

            );


        const userMessage =
            body.message;


        if (
            !userMessage
        ) {


            return {

                statusCode:
                    400,

                body:
                    JSON.stringify({

                        error:
                            "No message provided"

                    })

            };

        }


        const response =
            await client.chat.completions.create({

                model:
                    "deepseek/deepseek-chat-v3-0324:free",

                messages: [

                    {

                        role:
                            "system",

                        content: `

You are PorangeAI.

You are an AI developer that can control Roblox Studio.

You MUST return ONLY valid JSON.

NEVER return Markdown.

NEVER use code blocks.

NEVER write text outside JSON.

Your response MUST ALWAYS have this exact format:

{
  "reply": "Short explanation",
  "actions": []
}

IMPORTANT:

When the user asks you to create, build, add, put, make, delete, rename, modify, or change something in Roblox Studio, you MUST return the required actions.

The actions will be sent directly to a Roblox Studio plugin.

EXAMPLE:

User:
Put a black part in Workspace.

Return:

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

For a Folder:

{
  "type": "create_instance",
  "className": "Folder",
  "name": "MyFolder",
  "parent": "Workspace"
}

For a Script:

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

If the user asks for a complete system, create ALL necessary objects and scripts using multiple actions.

For example, a complete shop system may require:

Folder
RemoteEvent
Script
LocalScript
ScreenGui
Frame
TextButton
TextLabel

Do not just explain how to build something.

Actually return the actions needed to build it.

If the user asks a normal question that does not require Roblox Studio changes, return:

{
  "reply": "Your answer",
  "actions": []
}

ALWAYS RETURN VALID JSON.

`

                    },

                    {

                        role:
                            "user",

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
            "RAW AI RESPONSE:"
        );


        console.log(
            content
        );


        content =
            content
                .trim();


        // Remove Markdown code blocks

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


        // First, try to parse the whole response

        try {


            result =
                JSON.parse(
                    content
                );


        } catch (
            error
        ) {


            // If extra text exists, extract JSON

            const firstBrace =
                content.indexOf(
                    "{"
                );


            const lastBrace =
                content.lastIndexOf(
                    "}"
                );


            if (

                firstBrace !== -1

                &&

                lastBrace !== -1

            ) {


                const jsonText =
                    content.substring(

                        firstBrace,

                        lastBrace + 1

                    );


                try {


                    result =
                        JSON.parse(
                            jsonText
                        );


                } catch (
                    jsonError
                ) {


                    result = {

                        reply:
                            "The AI returned invalid JSON.",

                        actions:
                            []

                    };

                }


            } else {


                result = {

                    reply:
                        content,

                    actions:
                        []

                };

            }

        }


        // Always make sure actions is an array

        if (

            !Array.isArray(
                result.actions
            )

        ) {


            result.actions =
                [];

        }


        // Always make sure reply exists

        if (

            !result.reply

        ) {


            result.reply =
                "Command processed.";

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

            statusCode:
                200,

            headers: {

                "Content-Type":
                    "application/json"

            },

            body:

                JSON.stringify(
                    result
                )

        };


    } catch (
        error
    ) {


        console.error(
            "CHAT FUNCTION ERROR:",
            error
        );


        return {

            statusCode:
                500,

            body:

                JSON.stringify({

                    error:
                        error.message

                })

        };

    }

};
