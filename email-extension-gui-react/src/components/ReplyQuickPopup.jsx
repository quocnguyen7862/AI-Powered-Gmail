import React, { useState } from "react";
import { Card, Button, Space } from "antd";
import TextArea from "antd/es/input/TextArea";

export default function ReplyQuickPopup() {
    const [value, setValue] = useState('');

    return (
        <Card
            className="w-[380px] rounded-[8px] shadow-2xl border border-gray-200"
            styles={{ body: { padding: 0, border: 0 } }}
        >
            <div className="mx-4 mt-2 mb-4">
                <Space.Compact style={{ width: '100%' }} className="mt-3 rounded-lg text-sm" direction="vertical">
                    <TextArea
                        className="rounded-b-none"
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