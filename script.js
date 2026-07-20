const welcomeScreen = document.getElementById("welcomeScreen");
const app = document.getElementById("app");

const enterButton = document.getElementById("enterButton");
const sendButton = document.getElementById("sendButton");

const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");

const newChatButton = document.getElementById("newChatButton");
const chatList = document.getElementById("chatList");

let chats = [];
let currentChat = null;

enterButton.addEventListener("click", () => {
    welcomeScreen.classList.add("hidden");
    app.classList.remove("hidden");
});

function addMessage(text, type) {

    const message = document.createElement("div");

    message.classList.add("message");

    if (type === "user") {
        message.classList.add("user-message");
    } else {
        message.classList.add("ai-message");
    }

    message.textContent = text;

    messages.appendChild(message);

    messages.scrollTop = messages.scrollHeight;
}

async function sendMessage() {

    const message = messageInput.value.trim();

    if (!message) return;

    addMessage(message, "user");

    messageInput.value = "";

    addMessage("ANIME AI is thinking...", "ai");

    try {

        const response = await fetch("/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });

        const data = await response.json();

        const thinkingMessage =
            messages.lastElementChild;

        thinkingMessage.remove();

        if (data.reply) {
            addMessage(data.reply, "ai");
        } else {
            addMessage(
                "Error: " + data.error,
                "ai"
            );
        }

    } catch (error) {

        const thinkingMessage =
            messages.lastElementChild;

        thinkingMessage.remove();

        addMessage(
            "Could not connect to the AI server.",
            "ai"
        );
    }
}

sendButton.addEventListener(
    "click",
    sendMessage
);

messageInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }

    }
);

newChatButton.addEventListener(
    "click",
    () => {

        const chat = document.createElement("div");

        chat.classList.add("chat-item");

        chat.textContent =
            "New Chat " +
            (chatList.children.length + 1);

        chatList.appendChild(chat);

        chat.addEventListener(
            "dblclick",
            () => {

                const newName =
                    prompt(
                        "Rename this chat:",
                        chat.textContent
                    );

                if (newName) {
                    chat.textContent = newName;
                }

            }
        );

        chat.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".chat-item")
                    .forEach(item => {
                        item.classList.remove("active");
                    });

                chat.classList.add("active");

                messages.innerHTML = "";
            }
        );

    }
);