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
    const [currentThread, setCurrentThread] = useState(null);
    const [threads, setThreads] = useState([
        { title: "Thread 1", preview: "This is a preview of thread 1" },
        { title: "Thread 2", preview: "This is a preview of thread 2" },
        { title: "Thread 3", preview: "This is a preview of thread 3" }
    ]);
    const [isThreadsView, setIsThreadsView] = useState(true);


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
            <Header onClick={() => setIsThreadsView(true)} />
            {
                isThreadsView ? (
                    <ThreadListView threads={threads} />
                ) : (
                    <Messages messages={messages} />
                )
            }
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

function ThreadListView({ threads, onSelectThread }) {
    return (
        <div className="thread-list-view rounded-[3px] bg-white flex flex-col w-[400px] h-[500px] overflow-hidden shadow-md border border-gray-300">
            <div className="flex-1 overflow-auto">
                <ul className="divide-y divide-gray-200">
                    {threads.length > 0 && (
                        threads.map((thread, index) => (
                            <li key={index}>
                                <button
                                    className="w-full text-left p-[12px_16px] hover:bg-[#f5f5f5] focus:outline-none"
                                    onClick={() => onSelectThread(thread)}
                                >
                                    <div className="text-base font-medium text-[#005b9c] truncate">
                                        {thread.title || `Thread ${index + 1}`}
                                    </div>
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    )
}