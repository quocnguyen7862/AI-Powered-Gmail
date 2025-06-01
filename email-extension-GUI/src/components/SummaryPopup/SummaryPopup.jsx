import { Button, Popover, Skeleton } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { URL_RE_SUMMARIZE, URL_SUMMARIZE_BY_MESSAGE } from '../../js/config';
import Api from '../../js/axios.config';
import { MarkdownPreview } from '../ReplyQuickPopup/ReplyQuickPopup';

const languages = [
    { name: "Tiếng Việt", value: "vi" },
    { name: "English", value: "en" },
    { name: "日本語", value: "ja" },
    { name: "한국어", value: "ko" },
    { name: "中文", value: "zh" },
    { name: "Español", value: "es" },
    { name: "Deutsch", value: "de" },
    { name: "Français", value: "fr" },
];

const SummaryPopup = ({ threadId, messageId, session }) => {
    const [summary, setSummary] = useState('')
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState();

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const response = await Api.post(URL_SUMMARIZE_BY_MESSAGE, { threadId: threadId, messageId: messageId }, {}, session?.accessToken);
            const data = response.data;
            setSummary(data.summary)
            setLanguage(data.language);
        } catch (error) {
            setSummary(error.data.message)
        } finally {
            setLoading(false);
        }
    };

    const reSummarize = useCallback(
        async (messageId, threadId, language) => {
            setLoading(true);
            try {
                const response = await Api.post(URL_RE_SUMMARIZE, {
                    messageId: messageId,
                    threadId: threadId,
                    language: language
                }, {}, session?.accessToken);
                const data = response.data;
                setSummary(data.summary);
                setLanguage(data.language);
            } catch (error) {
                setSummary(error.data.message)
            }
            setLoading(false);
        },
        [],
    );

    useEffect(() => {
        if (threadId && messageId) {
            fetchSummary();
        }
    }, []);

    return (
        <div className='flex text-sm rounded-[12px] max-w-[600px] leading-5 flex-col min-w-100 rounded-[3px'>
            <div className='bg-[#373b67] rounded-t-[12px] text-white text-center font-bold text-lg'>
                AI Summary
            </div>
            <div className='!p-3 flex flex-col gap-2 items-end'>
                {
                    loading ? (
                        <Skeleton className='!w-full' style={{ width: "100%" }} active />
                    ) : (
                        <div className="max-h-80 overflow-auto">
                            <MarkdownPreview markdown={summary} />
                        </div>
                    )
                }
                <div className="flex w-full items-center justify-between">
                    <select
                        disabled={loading}
                        className={
                            "font-google relative z-20 appearance-none rounded border border-stroke bg-transparent px-3 py-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary "
                        }
                        onChange={(e) => {
                            reSummarize(
                                messageId,
                                threadId,
                                e.target.value,
                            );
                        }}
                        value={language}
                    >
                        {languages.map((item, index) => {
                            return (
                                <option
                                    key={index}
                                    value={item.value}
                                    className="text-body dark:text-bodydark"
                                >
                                    {item.name}
                                </option>
                            );
                        })}
                    </select>
                    <button onClick={() => {
                        reSummarize(
                            messageId,
                            threadId,
                        );
                    }}>
                        <img
                            width="24"
                            height="24"
                            src="https://img.icons8.com/pulsar-line/48/rotate-left.png"
                            alt="rotate-left"
                            className={`${loading ? "animate-spin" : ""}`}
                        />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SummaryPopup

export const SummaryButton = ({ threadId, messageId, session }) => {
    return (
        <div className='absolute right-0 z-50'>
            <Popover content={
                <SummaryPopup threadId={threadId} messageId={messageId} session={session} />
            } trigger="click" placement='leftTop' styles={{ body: { minWidth: 400, maxHeight: 600, overflowY: 'auto', padding: 0 } }} >
                <button className='p-[10px] rounded-full border-0 hover:bg-[#f2f2f2]'>
                    <img
                        width={20}
                        height={20}
                        src="https://img.icons8.com/pulsar-color/48/fine-print.png"
                        alt="Custom Icon"
                        title="Summarize email"
                    />
                </button>
            </Popover>
        </div>
    )
}