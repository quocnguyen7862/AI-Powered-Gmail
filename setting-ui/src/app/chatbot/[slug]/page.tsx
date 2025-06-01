"use client";
import Api from "@/axios.config";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { URL_CHAT_HISTORY, URL_CHATBOT } from "@/constants/endpoints";
import { Divider } from "antd";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Remarkable } from "remarkable"; // Markdown parser

const Thread = ({ params }: { params: { slug: string } }) => {
  const [messages, setMessages] = useState<React.ReactNode[]>([]);
  const [nextPage, setNextPage] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  const fetchChatHistory = useCallback(
    async (page: number, threadId: string) => {
      const response = await Api.getWithParams(
        URL_CHAT_HISTORY + `/${threadId}`,
        { page: page, isChatbot: true },
      );
      const data = response.data;
      setNextPage(data.nextPage);
      return data.data;
    },
    [],
  );

  async function loadChatHistory(threadId: string) {
    const data = await fetchChatHistory(1, threadId);

    const historyMessages: React.ReactNode[] = [];
    for (let i = 0; i < data.length - 1; i = i + 2) {
      const humanMessage = data[i].message;
      const aiMessage = data[i + 1].message;

      historyMessages.push(
        <div key={messages.length + i + 1}>
          {historyMessages.length > 0 && <Divider className="!m-0" />}
          <UserMessage text={humanMessage} />
          <BotMessage preMesssage={aiMessage} />
        </div>,
      );
    }
    setMessages([...historyMessages]);
  }

  const loadMoreMessages = async () => {
    if (!nextPage) return;
    const data = await fetchChatHistory(nextPage, params.slug);

    const historyMessages: React.ReactNode[] = [];
    for (let i = 0; i < data.length - 1; i++) {
      const humanMessage = data[i].message;
      const aiMessage = data[i + 1].message;

      historyMessages.push(
        <div key={messages.length + i + 1}>
          {historyMessages.length > 0 && <Divider className="!m-0" />}
          <UserMessage text={humanMessage} />
          <BotMessage preMesssage={aiMessage} />
        </div>,
      );
    }
    setMessages((prev) => [...historyMessages, ...prev]);
  };

  const handleSend = async (text: string) => {
    const newMessages = messages.concat(
      <div key={messages.length + 1}>
        {messages.length > 0 && <Divider className="!m-0" />}
        <UserMessage text={text} />
        <BotMessage
          fetchMessage={async () => {
            try {
              const response = await Api.post(URL_CHATBOT, {
                message: text,
                threadId: params.slug,
              });
              const data = response.data;
              return data.output;
            } catch (error: any) {
              throw new Error(error.data.message);
            }
          }}
        />
      </div>,
    );

    setMessages(newMessages);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    // Gọi lần đầu
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    loadChatHistory(params.slug);
  }, [params.slug]);

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [document.body.scrollHeight]);

  useEffect(() => {
    if (scrollY === 0) {
      loadMoreMessages();
    }
  }, [scrollY]);

  return (
    <DefaultLayout>
      <div className="mx-auto h-full">
        <Breadcrumb pageName="AI Assistant" />
        <div className="grid h-full grid-cols-5 gap-8">
          <div className="col-span-5">
            <div className="flex h-full flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <Messages className="flex-1" messages={messages} />
              <Input onSend={handleSend} />
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Thread;

type MessagesProps = {
  messages: Array<React.ReactNode>;
  className?: string;
};

export const Messages: React.FC<MessagesProps> = ({ messages, className }) => {
  return (
    <div
      className={`${className ? className : ""} messages flex w-full flex-col overflow-auto p-[10px_0]`}
    >
      {messages}
    </div>
  );
};

type InputProps = {
  onSend: (text: string) => void;
};

export const Input: React.FC<InputProps> = ({ onSend }) => {
  const [text, setText] = React.useState("");

  const handleInputChange = (e: any) => {
    setText(e.target.value);
  };

  const handleSend = (e: any) => {
    e.preventDefault();
    onSend(text);
    setText("");
  };

  return (
    <div className="input sticky bottom-0 w-full bg-white">
      <div className="relative m-[8px_16px_16px_16px]">
        <form onSubmit={handleSend}>
          <input
            className="font-google w-full rounded-md border-0 border-t-[1px_solid_#eee] p-[16px_52px_16px_10px] text-base opacity-[1] shadow-[0px_1px_4px_0.5px_#7f7f7f4d] outline-[none] focus:outline-none"
            type="text"
            onChange={handleInputChange}
            value={text}
            placeholder="Type your message..."
          />
          <button
            type="submit"
            disabled={text == ""}
            className=" absolute right-0 top-0 cursor-pointer rounded-br-xl border-0 bg-transparent fill-[#4a4a4a] p-[14px_16px_12px_16px] opacity-[1] shadow-none outline-none"
          >
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
  );
};

type BotMessageProps = {
  fetchMessage?: () => Promise<string>;
  preMesssage?: string;
};

export const BotMessage: React.FC<BotMessageProps> = ({
  fetchMessage,
  preMesssage,
}) => {
  const [isLoading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [isError, setIsError] = React.useState(false);

  useEffect(() => {
    async function loadMessage() {
      setLoading(true);
      try {
        if (fetchMessage) {
          const msg = await fetchMessage();
          setMessage(msg);
        }
      } catch (error: any) {
        setMessage(error.message);
        setIsError(true);
      }
      setLoading(false);
    }

    if (fetchMessage !== undefined) {
      loadMessage();
    } else {
      setMessage(preMesssage ?? "");
    }
  }, [fetchMessage]);

  const writeToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch (error) {}
  };

  return (
    <div className="message-container relative w-full">
      <div className="font-google bot-message m-[5px] flex w-[97%] flex-col gap-2 p-4 text-justify text-black">
        {isLoading ? (
          "..."
        ) : (
          <>
            <MarkdownPreview markdown={message} />
          </>
        )}
      </div>
    </div>
  );
};

interface RenderMarkdownToHTMLResult {
  __html: string;
}

const renderMarkdownToHTML = (markdown: string): RenderMarkdownToHTMLResult => {
  const md = new Remarkable();
  const renderedHTML = md.render(markdown);
  return { __html: renderedHTML };
};

export const MarkdownPreview: React.FC<{ markdown: string }> = ({
  markdown,
}) => {
  const markup = renderMarkdownToHTML(markdown);
  return <div dangerouslySetInnerHTML={markup} />;
};

export const UserMessage: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="message-container w-full">
      <div className="font-google user-message float-right m-3 rounded-[20px_20px_1px_20px] bg-[#cccccc] p-[15px_10px] text-justify text-black">
        {text}
      </div>
    </div>
  );
};
