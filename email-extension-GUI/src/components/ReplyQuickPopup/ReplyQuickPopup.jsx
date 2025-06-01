import React, { useEffect, useRef, useState } from "react";
import { Card, Button, Space, Typography, Divider, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import Api from "../../js/axios.config";
import { URL_SUMMARIZE_BY_DRAFT, URL_REPLY_GENERATE, URL_REPLY_SCENARIO, URL_CHAT_HISTORY } from "../../js/config";
import { Remarkable } from "remarkable";

const { Title, Text } = Typography;

export default function ReplyQuickPopup({ threadId, draftId, composeView, session }) {
    const [value, setValue] = useState('');
    const [summary, setSummary] = useState('');
    const [scenarios, setScenarios] = useState([]);
    const [reply, setReply] = useState('');
    const [messageId, setMessageId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [nextPage, setNextPage] = useState(null);

    const fetchSummary = async () => {
        try {
            const response = await Api.post(URL_SUMMARIZE_BY_DRAFT, { threadId: threadId, draftId: draftId }, {}, session?.accessToken)
            const data = response.data;
            setMessageId(data.messageId);
            return data.summary;
        }
        catch (error) {
            throw new Error(error.data.message);
        }
    };

    const fetchScenarios = async (messageId) => {
        try {

            const response = await Api.getWithParams(URL_REPLY_SCENARIO, { messageId: messageId }, {}, session?.accessToken)
            const data = response.data;
            return data;
        } catch (error) {
            return error.data
        }
    };

    const fetchChatHistory = async (page) => {
        const response = await Api.getWithParams(URL_CHAT_HISTORY + `/${draftId}`, { page: page }, {}, session?.accessToken)
        const data = response.data;
        setNextPage(data.nextPage);
        return data.data;
    }

    const loadMoreMessages = async () => {
        if (!nextPage) return;
        const data = await fetchChatHistory(nextPage);

        const historyMessages = []
        for (let i = 0; i < data.length - 1; i = i + 2) {
            const humanMessage = data[i].message;
            const aiMessage = data[i + 1].message;

            historyMessages.push(
                <div key={messages.length + i + 1}>
                    {(historyMessages.length > 0) && <Divider className="!m-0" />}
                    <UserMessage text={humanMessage} />
                    <BotMessage preMesssage={aiMessage} composeView={composeView} canInsert={true} />
                </div>
            )
        }
        setMessages(prev => [...historyMessages, ...prev]);
    }

    useEffect(() => {
        async function loadChatHistory() {
            const data = await fetchChatHistory(1);
            const historyMessages = []
            for (let i = 0; i < data.length - 1; i = i + 2) {
                const humanMessage = data[i].message;
                const aiMessage = data[i + 1].message;

                historyMessages.push(
                    <div key={messages.length + i + 1}>
                        {(historyMessages.length > 0) && <Divider className="!m-0" />}
                        <UserMessage text={humanMessage} />
                        <BotMessage preMesssage={aiMessage} composeView={composeView} canInsert={true} />
                    </div>
                )
            }
            setMessages(prev => [...prev, ...historyMessages]);
        }

        if (!!draftId) {
            if (!!threadId) {
                setMessages([
                    <BotMessage key={0} fetchMessage={fetchSummary} />
                ])
            }
            loadChatHistory();
        }
    }, [threadId, draftId]);

    useEffect(() => {
        if (!!messageId && messages.length === 0) {
            fetchScenarios(messageId).then((data) => {
                setScenarios([...data.output.map((item) => ({ ...item, messageId: data.messageId }))]);
            })
        }
    }, [messageId])

    const handleScenarioClick = async (scenario) => {
        const newMessages = messages.concat(
            <dev key={messages.length + 1}>
                <Divider className="!m-0" />
                <UserMessage text={scenario.description} />
                <BotMessage fetchMessage={async () => {
                    try {
                        const response = await Api.post(URL_REPLY_GENERATE, { draftId: draftId, messageId: scenario.messageId, title: scenario.title, description: scenario.description }, {}, session?.accessToken)
                        const data = response.data;
                        return data.output;
                    } catch (error) {
                        throw new Error(error.data.message);
                    }
                }} canInsert={true} composeView={composeView} />
            </dev>
        )

        setMessages(newMessages);
    }

    const handleSend = async (text) => {
        const newMessages = messages.concat(
            <div key={messages.length + 1}>
                {(messages.length > 0) && <Divider className="!m-0" />}
                <UserMessage text={text} />
                <BotMessage fetchMessage={async () => {
                    try {
                        const response = await Api.post(URL_REPLY_GENERATE, { draftId: draftId, title: text, description: text }, {}, session?.accessToken)
                        const data = response.data;
                        return data.output;
                    } catch (error) {
                        throw new Error(error.data.message);
                    }
                }} canInsert={true} composeView={composeView} />
            </div>
        )

        setMessages(newMessages);
    }

    return (
        <div className="chatbot rounded-[3px] bg-white text-center flex flex-col w-[400px] h-[500px] overflow-hidden">
            <Header title={"AI Generated Reply"} />
            <Messages className="h-dvh" messages={messages} loadMoreMessages={loadMoreMessages} />
            <Input onSend={handleSend} scenarios={scenarios} handleScenarioClick={handleScenarioClick} />
        </div>
    );
}

export const Header = ({ title, children }) => {
    return (
        <div className="flex bg-[#373b67] p-1" style={{ position: "sticky", top: 0, zIndex: 1000 }}>
            <p className="header w-full flex-1 text-center max-h-[58px] text-base font-bold text-white" >
                &nbsp;{title}
            </p>
            {children}
        </div>
    )
}

export const Messages = ({ messages, loadMoreMessages, className }) => {
    const el = useRef(null);

    const handleScroll = async (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollTop === 0 && loadMoreMessages !== undefined) {
            await loadMoreMessages();
        }
    }

    useEffect(() => {
        el.current.scrollIntoView({ block: "end", behavior: "smooth" })
    }, [messages]);

    return (
        <div className={`${className ? className : ""} text-sm leading-5 messages w-full overflow-auto flex flex-col p-[10px_0]`} onScroll={handleScroll}>
            {messages}
            <div id="el" ref={el} />
        </div>
    )
}

export const Input = ({ onSend, scenarios, handleScenarioClick }) => {
    const [text, setText] = React.useState('');

    const handleInputChange = (e) => {
        setText(e.target.value);
    }

    const handleSend = (e) => {
        e.preventDefault();
        onSend(text);
        setText("");
    }

    return (
        <div className='input bg-[#f5f5f5] w-full' style={{ bottom: 0, position: "sticky" }}>
            {scenarios?.length > 0 && (
                <ul className='divide-y divide-slate-200'>
                    {scenarios.map((scenario, index) => (
                        <li key={index} className='first:pt-0 last:pb-0 flex flex-col'>
                            <button className='text-left p-[8px_16px] hover:bg-[#ebebeb]' onClick={() => { handleScenarioClick(scenario) }}>{scenario.title}</button>
                        </li>
                    ))}
                </ul>
            )}
            <div className='relative m-[8px_16px_16px_16px]'>
                <form onSubmit={handleSend}>
                    <input
                        className='text-base border-0 rounded-md shadow-[0px_1px_4px_0.5px_#7f7f7f4d] border-t-[1px_solid_#eee] opacity-[1] outline-[none] p-[16px_52px_16px_10px] w-full focus:outline-none'
                        type='text'
                        onChange={handleInputChange}
                        value={text}
                        placeholder='Type your message...'
                    />
                    <button type='submit' disabled={text == ""} className='bg-transparent border-0 rounded-br-xl shadow-none cursor-pointer fill-[#4a4a4a] opacity-[1] outline-none p-[14px_16px_12px_16px] absolute right-0 top-0'>
                        <svg
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 500 500"
                        >
                            <g>
                                <g>
                                    <polygon points="0,497.25 535.5,267.75 0,38.25 0,216.75 382.5,267.75 0,318.75" />
                                </g>
                            </g>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )
}

export const BotMessage = ({ fetchMessage, canInsert, isSummary, composeView, preMesssage }) => {
    const [isLoading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        async function loadMessage() {
            setLoading(true);
            try {
                const msg = await fetchMessage();
                setMessage(msg);
            } catch (error) {
                setMessage(error.message)
                setIsError(true);
            }
            setLoading(false);
        }

        if (fetchMessage !== undefined) {
            loadMessage();
        } else {
            setMessage(preMesssage);
        }
    }, [fetchMessage]);

    const handleInsert = () => {
        const markup = renderMarkdownToHTML(message);
        composeView.insertHTMLIntoBodyAtCursor(markup?.__html)
    }

    const writeToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(message);
        } catch (error) { }
    }

    return (
        <div className='message-container w-full relative' >
            <div className='bot-message flex flex-col gap-2 w-[97%] p-4 m-[5px] text-justify'>
                {isLoading ? "..." : (
                    <>
                        <MarkdownPreview markdown={message} />
                        {(canInsert && !isError) && (
                            <div className='items-center flex gap-2 justify-between'>
                                <div className='items-center flex gap-2'>
                                    <button onClick={handleInsert} className='px-2 leading-8 items-center border-none rounded box-border bg-[#005b9c] hover:bg-[#003d69] text-white inline-flex font-bold justify-center outline-none'>Insert</button>
                                </div>
                                <div className='items-center flex gap-2'>
                                    <button onClick={writeToClipboard} className='px-2 min-h-8 items-center border-none rounded box-border bg-transparent hover:bg-[#ebebeb] hover:shadow-[inset_0_0_0_1px_#a8a8a8] text-white inline-flex font-normal align-middle justify-center outline-none'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" fill="none" viewBox="0 0 16 16" aria-hidden="true" data-icon="InterfaceCopy" stroke="transparent">
                                            <path stroke="#646B81" strokeLinecap="round" strokeLinejoin="round" d="M7.053 10.842v1.908c0 .69.56 1.25 1.25 1.25h4.447c.69 0 1.25-.56 1.25-1.25V8.303c0-.69-.56-1.25-1.25-1.25h-1.908M8.947 3.25v4.447c0 .69-.56 1.25-1.25 1.25H3.25c-.69 0-1.25-.56-1.25-1.25V3.25C2 2.56 2.56 2 3.25 2h4.447c.69 0 1.25.56 1.25 1.25"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export const UserMessage = ({ text }) => {
    return (
        <div className="message-container w-full">
            <div className="user-message text-justify float-right p-[15px_10px] m-3 rounded-[20px_20px_1px_20px] bg-[#cccccc] text-black">{text}</div>
        </div>
    )
}

const renderMarkdownToHTML = (markdown) => {
    const md = new Remarkable();
    const renderedHTML = md.render(markdown);
    return { __html: renderedHTML };
}

export const MarkdownPreview = ({ markdown }) => {
    const markup = renderMarkdownToHTML(markdown);
    return <div dangerouslySetInnerHTML={markup} />;
}