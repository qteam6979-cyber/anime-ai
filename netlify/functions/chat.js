exports.handler = async function (event) {
    try {
        if (event.httpMethod !== "POST") {
            return {
                statusCode: 405,
                body: JSON.stringify({
                    error: "Method not allowed"
                })
            };
        }

        const { message } = JSON.parse(event.body || "{}");

        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "No message provided"
                })
            };
        }

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "https://your-site.netlify.app",
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
                            content: message
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: data.error?.message || "AI API error"
                })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                reply: data.choices[0].message.content
            })
        };

    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Something went wrong connecting to the AI."
            })
        };
    }
};
