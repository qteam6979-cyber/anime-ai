const OpenAI = require("openai");


const client =
    new OpenAI({

        apiKey:
            process.env.OPENROUTER_API_KEY,

        baseURL:
            "https://openrouter.ai/api/v1"

    });


exports.handler =
    async function(event) {


        if (

            event.httpMethod !==
            "POST"

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

You control Roblox Studio through actions.

Return ONLY valid JSON.

No Markdown.

No code blocks.

No text outside JSON.

Always use:

{
  "reply": "Short explanation",
  "actions": []
}

When the user asks to create, build, add, put, make, delete, rename, modify, or change something in Roblox Studio, return the actions required.

Example:

{
  "reply": "Created a black Part in Workspace.",
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

Supported actions:

create_instance
create_script
delete_instance
rename_instance
set_properties

Valid parents:

Workspace
ServerScriptService
ReplicatedStorage
StarterGui
StarterPlayer
StarterPlayer.StarterPlayerScripts

Nested paths are allowed.

If the user asks for a complete system, create all required objects and scripts using multiple actions.

If the user asks a normal question that does not change Roblox Studio:

{
  "reply": "Your answer",
  "actions": []
}

Always return valid JSON.

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
                content.trim();


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


            }


            catch (

                error

            ) {


                const firstBrace =
                    content.indexOf(
                        "{"
                    );


                const lastBrace =
                    content.lastIndexOf(
                        "}"
                    );


                if (

                    firstBrace !==
                    -1

                    &&

                    lastBrace !==
                    -1

                ) {


                    const extracted =
                        content.substring(

                            firstBrace,

                            lastBrace + 1

                        );


                    try {


                        result =
                            JSON.parse(
                                extracted
                            );


                    }


                    catch (

                        jsonError

                    ) {


                        result = {

                            reply:
                                "The AI returned invalid JSON.",

                            actions:
                                []

                        };

                    }

                }


                else {


                    result = {

                        reply:
                            content,

                        actions:
                            []

                    };

                }

            }


            if (

                !Array.isArray(
                    result.actions
                )

            ) {

                result.actions =
                    [];

            }


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


        }


        catch (

            error

        ) {


            console.error(
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
