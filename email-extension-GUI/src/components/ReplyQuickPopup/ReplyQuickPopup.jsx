import React, { useEffect, useState } from "react";
import { Card, Button, Space } from "antd";
import TextArea from "antd/es/input/TextArea";
import Api from "../../js/axios.config";
import { URL_SUMMARIZE_BY_CONTENT } from "../../js/config";

export default function ReplyQuickPopup({ threadId, inboxContent }) {
    const [value, setValue] = useState('');
    const [summary, setSummary] = useState('');

    useEffect(() => {
        const response = Api.postApiNonAuth(URL_SUMMARIZE_BY_CONTENT, { threadId, content: inboxContent })
    }, []);

    return (
        <Card
            className="!w-[380px] !rounded-none !my-3"
            styles={{ body: { padding: 0, border: 0 } }}
        >
            <div className="!mx-4 !mt-2 !mb-4">
                <div>
                    {summary}
                </div>
                <Space.Compact style={{ width: '100%' }} className="!mt-3 !rounded-lg !text-sm" direction="vertical">
                    <TextArea
                        className="!rounded-b-none"
                        placeholder='Try "Write an ode to the em dash"'
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        autoSize={{ minRows: 1, maxRows: 12 }}
                    />
                    <Button>
                        Submit
                    </Button>
                </Space.Compact>
            </div>
        </Card >
    );
}