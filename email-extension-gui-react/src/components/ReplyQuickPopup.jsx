import React, { useEffect, useState } from "react";
import { Card, Button, Space, Divider } from "antd";
import TextArea from "antd/es/input/TextArea";
import Header from "./Header";
import Messages from "./Messages";
import Input from "./Input";
import BotMessage from "./BotMessage";
import UserMessage from "./UserMessage";

export default function ReplyQuickPopup() {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        async function loadWelcomeMessage() {
            setMessages([
                <>
                    <BotMessage
                        key="0"
                        fetchMessage={async () => await API.GetChatbotResponse("hi")}
                    />
                </>
            ]);
        }
        loadWelcomeMessage();
    }, []);


    const handleSend = async (text) => {
        const newMessages = messages.concat(
            <>
                <Divider className="m-0" />
                <UserMessage key={messages.length + 1} text={text} />
                <BotMessage key={messages.length + 2} fetchMessage={async () => await API.GetChatbotResponse(text)} />
            </>
        );

        setMessages(newMessages);
    }

    return (
        <div className="chatbot rounded-xl bg-[#f5f8fb] text-center flex flex-col w-[400px] max-h-[500px] overflow-hidden">
            <Header />
            <Messages messages={messages} />
            <Input onSend={handleSend} />
        </div>
    );
}

const API = {
    GetChatbotResponse: async message => {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                if (message === "hi") resolve("Welcome to chatbot!");
                else resolve("echo : " + message);
            }, 2000);
        });
    }
};