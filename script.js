const welcomeScreen =
    document.getElementById(
        "welcomeScreen"
    );


const app =
    document.getElementById(
        "app"
    );


const enterButton =
    document.getElementById(
        "enterButton"
    );


const sendButton =
    document.getElementById(
        "sendButton"
    );


const messageInput =
    document.getElementById(
        "messageInput"
    );


const messages =
    document.getElementById(
        "messages"
    );


const newChatButton =
    document.getElementById(
        "newChatButton"
    );


const chatList =
    document.getElementById(
        "chatList"
    );


const robloxConnectButton =
    document.getElementById(
        "robloxConnectButton"
    );


const robloxStatus =
    document.getElementById(
        "robloxStatus"
    );


// ==================================
// LOCAL ROBLOX BRIDGE
// ==================================

const BRIDGE_URL =
    "http://127.0.0.1:8765";


// ==================================
// ENTER PORANGEAI
// ==================================

enterButton.addEventListener(

    "click",

    function() {

        welcomeScreen.classList.add(
            "hidden"
        );

        app.classList.remove(
            "hidden"
        );

    }

);


// ==================================
// ADD MESSAGE
// ==================================

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


    if (

        type === "user"

    ) {

        message.classList.add(
            "user-message"
        );

    }

    else {

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


// ==================================
// SEND ACTIONS TO BRIDGE
// ==================================

async function sendRobloxActions(

    actions

) {


    if (

        !Array.isArray(
            actions
        )

        ||

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

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:

                        JSON.stringify({

                            type:
                                "actions",

                            actions:
                                actions

                        })

                }

            );


        if (

            !response.ok

        ) {

            return false;

        }


        const data =
            await response.json();


        return (

            data.success ===
            true

        );


    }


    catch (

        error

    ) {


        console.error(
            error
        );


        return false;

    }

}


// ==================================
// SEND MESSAGE TO PORANGEAI
// ==================================

async function sendMessage() {


    const message =
        messageInput.value.trim();


    if (

        !message

    ) {

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
                "/chat",

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:

                        JSON.stringify({

                            message:
                                message

                        })

                }

            );


        const data =
            await response.json();


        const thinkingMessage =
            messages.lastElementChild;


        if (

            thinkingMessage

        ) {

            thinkingMessage.remove();

        }


        if (

            data.error

        ) {


            addMessage(

                "❌ AI Error: " +
                data.error,

                "ai"

            );


            return;

        }


        if (

            Array.isArray(
                data.actions
            )

            &&

            data.actions.length > 0

        ) {


            addMessage(

                "⚙️ Sending actions to Roblox Studio...",

                "ai"

            );


            const sent =
                await sendRobloxActions(

                    data.actions

                );


            if (

                sent

            ) {


                addMessage(

                    "✅ " +

                    (

                        data.reply

                        ||

                        "Done! Roblox Studio was updated."

                    ),

                    "ai"

                );

            }


            else {


                addMessage(

                    "⚠️ Actions were created, but Roblox Studio did not receive them. Check that bridge.py is running and the plugin is connected.",

                    "ai"

                );

            }

        }


        else {


            addMessage(

                data.reply

                ||

                "The AI did not return any actions.",

                "ai"

            );

        }


    }


    catch (

        error

    ) {


        const thinkingMessage =
            messages.lastElementChild;


        if (

            thinkingMessage

        ) {

            thinkingMessage.remove();

        }


        addMessage(

            "❌ Could not connect to the AI server.",

            "ai"

        );


        console.error(
            error
        );

    }

}


// ==================================
// SEND BUTTON
// ==================================

sendButton.addEventListener(

    "click",

    sendMessage

);


// ==================================
// ENTER TO SEND
// ==================================

messageInput.addEventListener(

    "keydown",

    function(

        event

    ) {


        if (

            event.key ===
            "Enter"

            &&

            !event.shiftKey

        ) {


            event.preventDefault();


            sendMessage();

        }

    }

);


// ==================================
// CHECK ROBLOX CONNECTION
// ==================================

async function checkRobloxConnection() {


    try {


        const response =
            await fetch(

                BRIDGE_URL +
                "/status"

            );


        if (

            !response.ok

        ) {

            throw new Error(
                "Bridge offline"
            );

        }


        const data =
            await response.json();


        if (

            data.pluginConnected ===
            true

        ) {


            robloxStatus.textContent =
                "🟢 Roblox Studio Connected";

        }


        else {


            robloxStatus.textContent =
                "🔴 Roblox Studio Not Connected";

        }


    }


    catch (

        error

    ) {


        robloxStatus.textContent =
            "🔴 Bridge Not Running";

    }

}


// ==================================
// CONNECTION BUTTON
// ==================================

robloxConnectButton.addEventListener(

    "click",

    checkRobloxConnection

);


// Check every 3 seconds

setInterval(

    checkRobloxConnection,

    3000

);


// ==================================
// NEW CHAT
// ==================================

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

                chatList.children.length
                + 1

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
