const welcomeScreen =
    document.getElementById("welcomeScreen");

const app =
    document.getElementById("app");

const enterButton =
    document.getElementById("enterButton");

const sendButton =
    document.getElementById("sendButton");

const messageInput =
    document.getElementById("messageInput");

const messages =
    document.getElementById("messages");

const newChatButton =
    document.getElementById("newChatButton");

const chatList =
    document.getElementById("chatList");

const robloxConnectButton =
    document.getElementById(
        "robloxConnectButton"
    );

const robloxStatus =
    document.getElementById(
        "robloxStatus"
    );


// =====================================
// LOCAL ROBLOX BRIDGE
// =====================================

const BRIDGE_URL =
    "http://127.0.0.1:8765";


// =====================================
// ENTER APP
// =====================================

enterButton.addEventListener(
    "click",
    () => {

        welcomeScreen.classList.add(
            "hidden"
        );

        app.classList.remove(
            "hidden"
        );

    }
);


// =====================================
// ADD MESSAGE
// =====================================

function addMessage(
    text,
    type
) {

    const message =
        document.createElement(
            "div"
        );


    message.classList.add(
        "message"
    );


    if (type === "user") {

        message.classList.add(
            "user-message"
        );

    } else {

        message.classList.add(
            "ai-message"
        );

    }


    message.textContent =
        text;


    messages.appendChild(
        message
    );


    messages.scrollTop =
        messages.scrollHeight;

}


// =====================================
// SEND ROBLOX COMMAND
// =====================================

async function sendRobloxActions(
    actions
) {

    if (
        !actions ||
        actions.length === 0
    ) {

        return false;

    }


    try {

        const response =
            await fetch(

                BRIDGE_URL +
                "/send-command",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        type: "actions",

                        actions:
                            actions

                    })

                }

            );


        const data =
            await response.json();


        return data.success === true;


    } catch (error) {

        console.error(
            "Bridge error:",
            error
        );


        return false;

    }

}


// =====================================
// SEND MESSAGE
// =====================================

async function sendMessage() {

    const message =
        messageInput.value.trim();


    if (!message) {

        return;

    }


    addMessage(
        message,
        "user"
    );


    messageInput.value =
        "";


    addMessage(
        "PORANGEAI is working...",
        "ai"
    );


    try {


        const response =
            await fetch(

                "/.netlify/functions/chat",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        message:
                            message

                    })

                }

            );


        const data =
            await response.json();


        const thinkingMessage =
            messages.lastElementChild;


        thinkingMessage.remove();


        // ============================
        // SEND ACTIONS TO ROBLOX
        // ============================

        if (

            data.actions &&

            data.actions.length > 0

        ) {


            const sent =
                await sendRobloxActions(
                    data.actions
                );


            if (sent) {


                addMessage(

                    "✅ " +
                    (
                        data.reply ||
                        "Done! The changes were sent to Roblox Studio."
                    ),

                    "ai"

                );


            } else {


                addMessage(

                    "⚠️ AI created the actions, but Roblox Studio could not receive them. Make sure bridge.py and the plugin are running.",

                    "ai"

                );

            }


        } else {


            addMessage(

                data.reply ||
                "The AI did not return any actions.",

                "ai"

            );

        }


    } catch (error) {


        const thinkingMessage =
            messages.lastElementChild;


        if (
            thinkingMessage
        ) {

            thinkingMessage.remove();

        }


        addMessage(

            "Could not connect to the AI server.",

            "ai"

        );


        console.error(
            error
        );

    }

}


// =====================================
// SEND BUTTON
// =====================================

sendButton.addEventListener(

    "click",

    sendMessage

);


// =====================================
// ENTER TO SEND
// =====================================

messageInput.addEventListener(

    "keydown",

    function(event) {


        if (

            event.key === "Enter" &&

            !event.shiftKey

        ) {


            event.preventDefault();


            sendMessage();

        }

    }

);


// =====================================
// ROBLOX CONNECTION CHECK
// =====================================

robloxConnectButton.addEventListener(

    "click",

    async function() {


        robloxStatus.textContent =
            "🟡 Checking Roblox Studio...";


        try {


            const response =
                await fetch(

                    BRIDGE_URL +
                    "/status"

                );


            const data =
                await response.json();


            if (

                data.pluginConnected

            ) {


                robloxStatus.textContent =
                    "🟢 Roblox Studio Connected";


            } else {


                robloxStatus.textContent =
                    "🔴 Roblox Studio Not Connected";


            }


        } catch (error) {


            robloxStatus.textContent =
                "🔴 Bridge Not Running";


        }

    }

);


// =====================================
// NEW CHAT
// =====================================

newChatButton.addEventListener(

    "click",

    function() {


        const chat =
            document.createElement(
                "div"
            );


        chat.classList.add(
            "chat-item"
        );


        chat.textContent =
            "New Chat " +
            (
                chatList.children.length + 1
            );


        chatList.appendChild(
            chat
        );


        chat.addEventListener(

            "click",

            function() {


                document
                    .querySelectorAll(
                        ".chat-item"
                    )
                    .forEach(

                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }

                    );


                chat.classList.add(
                    "active"
                );


                messages.innerHTML =
                    "";

            }

        );

    }

);
