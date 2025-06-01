import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BotMessage, Header, Input, Messages, UserMessage } from '../ReplyQuickPopup/ReplyQuickPopup'
import { Divider, Modal } from 'antd';
import { URL_CHAT_HISTORY, URL_CHATBOT, URL_THREADS_HISTORY } from '../../js/config';
import Api from '../../js/axios.config';
import { v4 as uuidv4 } from 'uuid';

const ChatbotPanel = ({ session, el }) => {
    const [messages, setMessages] = useState([]);
    const [nextPage, setNextPage] = useState(null);
    const [currentThreadId, setCurrentThreadId] = useState(null);
    const [threads, setThreads] = useState([]);

    const handleSend = async (text) => {
        let threadId = currentThreadId;
        if (!threadId) {
            threadId = uuidv4();
            setCurrentThreadId(threadId);
        }

        const newMessages = messages.concat(
            <div key={messages.length + 1}>
                {(messages.length > 0) && <Divider className="!m-0" />}
                <UserMessage text={text} />
                <BotMessage fetchMessage={async () => {
                    try {
                        const response = await Api.post(URL_CHATBOT, { message: text, threadId: threadId }, {}, session?.accessToken)
                        const data = response.data;
                        return data.output;
                    } catch (error) {
                        throw new Error(error.data.message);
                    }
                }} canInsert={false} />
            </div>
        )

        setMessages(newMessages);
    }

    const fetchThreadsHistory = useCallback(async () => {
        const response = await Api.getWithParams(URL_THREADS_HISTORY, {}, {}, session?.accessToken);
        const data = response.data;
        setThreads([...data]);
    }, [])

    const fetchChatHistory = useCallback(async (page, threadId) => {
        const response = await Api.getWithParams(URL_CHAT_HISTORY + `/${threadId}`, { page: page, isChatbot: true }, {}, session?.accessToken);
        const data = response.data;
        setNextPage(data.nextPage);
        return data.data;
    }, [])

    const loadMoreMessages = async () => {
        if (!nextPage) return;
        const data = await fetchChatHistory(nextPage, currentThreadId);

        const historyMessages = []
        for (let i = 0; i < data.length - 1; i++) {
            const humanMessage = data[i].message;
            const aiMessage = data[i + 1].message;

            historyMessages.push(
                <div key={messages.length + i + 1}>
                    {(historyMessages.length > 0) && <Divider className="!m-0" />}
                    <UserMessage text={humanMessage} />
                    <BotMessage preMesssage={aiMessage} canInsert={false} />
                </div>
            )
        }
        setMessages(prev => [...historyMessages, ...prev]);
    }

    async function loadChatHistory(threadId) {
        const data = await fetchChatHistory(1, threadId);
        const historyMessages = []
        for (let i = 0; i < data.length - 1; i = i + 2) {
            const humanMessage = data[i].message;
            const aiMessage = data[i + 1].message;

            historyMessages.push(
                <div key={messages.length + i + 1}>
                    {(historyMessages.length > 0) && <Divider className="!m-0" />}
                    <UserMessage text={humanMessage} />
                    <BotMessage preMesssage={aiMessage} canInsert={false} />
                </div>
            )
        }
        setMessages([...historyMessages]);
    }

    // useEffect(() => {

    //     loadChatHistory();
    // }, [currentThreadId]);

    useEffect(() => {
        fetchThreadsHistory();
    }, [])

    const onTogleHistory = () => {
        setCurrentThreadId(null);
        fetchThreadsHistory();
        setMessages([]);
    }

    const onSelectThread = (threadId) => {
        setCurrentThreadId(threadId);
        loadChatHistory(threadId);
    }

    return (
        <div className='flex flex-col h-full'>
            <Header title={"AI Assistant"} >
                <button onClick={onTogleHistory} className='items-center border-none rounded bg-transparent hover:bg-[#609cc7] text-white inline-flex font-normal align-middle justify-center outline-none'>
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAABWUlEQVR4nL3Uv05UQRTH8d1FwEolVMAGGgsihpoABYUxQGzs7OiARGMiPYkNUi9UvAKvQMsjELOuJfJHewWrj5lwEm82987uGsNJJndyz5nvzO/MmVOr3adhCLN4iXU8R6PfxcOF+WN8wjd3doubmF9iH2O9gF/wAis4Rxtv0SzETGITHXzHcg74Ay38jO/DnJqIua2EBjDZCea6fBt4WrKmhWs8KQMmiUV7VvCdJfkVJ+2kfJcBR1OiYzzq8pUCw7eFC9RLpVcsygGnQtHfNGEaO/8IrEdJrRZ/vsLvVMgZ4CmOYrzpBZyPY89UAD/guDC2C75mmeQHkdj3VbIz6dgqvRTs4vOAsBF8xV6ZM5XLuwGBB7hKbz8X9Bof0+6ZmFTQh/H0FnvtuhC7tqMRTHRdwHbITDFL/UoZj/aVOkqyX4X2lS5gLyszA26kcojmupbe90BP7H/YH/XhBdXogkRwAAAAAElFTkSuQmCC" alt="time-machine"></img>
                </button>
            </Header>
            {
                currentThreadId ? (
                    <Messages className={"flex-1"} messages={messages} loadMoreMessages={loadMoreMessages} />
                ) : (
                    <ThreadListView threads={threads} onSelectThread={onSelectThread} fetchThreadsHistory={fetchThreadsHistory} session={session} />
                )
            }
            <Input onSend={handleSend} />
        </div>
    )
}

export default ChatbotPanel

function ThreadListView({ threads, onSelectThread, fetchThreadsHistory, session }) {
    const [chatId, setChatId] = useState("");
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const el = useRef(null);

    useEffect(() => {
        el.current.scrollIntoView({ block: "end", behavior: "smooth" })
    }, []);

    const handleDelete = async () => {
        setConfirmLoading(true);
        try {
            const response = await Api.deleteWithParams(
                URL_CHAT_HISTORY + "/" + chatId,
                { isChatbot: true },
                {},
                session?.accessToken
            );
            fetchThreadsHistory();
        } catch (err) {
        } finally {
            setConfirmLoading(false);
            setChatId("");
            setOpen(false);
        }
    };

    return (
        <div className="thread-list-view rounded-[3px] h-dvh bg-white flex flex-col shadow-md border border-gray-300">
            <div className="flex-1">
                <div id="el" ref={el} />
                <ul className="divide-y divide-gray-200">
                    {threads.length > 0 && (
                        threads.map((thread, index) => (
                            <li key={index}>
                                <div className='flex gap-2 justify-between hover:bg-[#f5f5f5] p-[12px_16px]'>
                                    <button
                                        className="w-full text-left focus:outline-none"
                                        onClick={() => onSelectThread(thread.key)}
                                    >
                                        <div className="text-base font-medium text-[#005b9c] truncate">
                                            {thread.value || `Thread ${index + 1}`}
                                        </div>
                                    </button>
                                    <button
                                        className="hover:text-red-600"
                                        onClick={() => {
                                            setChatId(thread.key);
                                            setOpen(true);
                                        }}
                                    >
                                        <svg
                                            className="fill-current"
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10.556 4a1 1 0 0 0-.97.751l-.292 1.14h5.421l-.293-1.14A1 1 0 0 0 13.453 4h-2.897Zm6.224 1.892-.421-1.639A3 3 0 0 0 13.453 2h-2.897A3 3 0 0 0 7.65 4.253l-.421 1.639H4a1 1 0 1 0 0 2h.1l1.215 11.425A3 3 0 0 0 8.3 22h7.4a3 3 0 0 0 2.984-2.683l1.214-11.425H20a1 1 0 1 0 0-2h-3.22Zm1.108 2H6.112l1.192 11.214A1 1 0 0 0 8.3 20h7.4a1 1 0 0 0 .995-.894l1.192-11.214ZM10 10a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Z"
                                                clipRule="evenodd"
                                            ></path>
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
            <Modal
                className="max-w-[450px]"
                title="Delete chat?"
                open={open}
                onOk={handleDelete}
                confirmLoading={confirmLoading}
                okButtonProps={{ className: "!bg-red-600 !hover:bg-opacity-90" }}
                okText="Delete"
                onCancel={() => setOpen(false)}
            >
                <p>This will delete .</p>
            </Modal>
        </div>
    )
}