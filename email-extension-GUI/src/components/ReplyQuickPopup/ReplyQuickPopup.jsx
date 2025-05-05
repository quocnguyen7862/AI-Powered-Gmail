import React, { useEffect, useState } from "react";
import { Card, Button, Space, Typography, Divider, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import Api from "../../js/axios.config";
import { URL_SUMMARIZE_BY_DRAFT, URL_SUMMARIZE_GENERATE, URL_SUMMARIZE_SCENARIO } from "../../js/config";

const { Title, Text } = Typography;

export default function ReplyQuickPopup({ threadId, draftId, composeView }) {
    const [value, setValue] = useState('');
    const [summary, setSummary] = useState('');
    const [scenarios, setScenarios] = useState([]);
    const [reply, setReply] = useState('');

    const fetchSummary = async () => {
        const response = await Api.post(URL_SUMMARIZE_BY_DRAFT, { threadId: threadId, draftId: draftId })
        const data = response.data;
        return data;
    };

    const fetchScenarios = async (messageId) => {
        const response = await Api.getWithParams(URL_SUMMARIZE_SCENARIO, { messageId: messageId })
        const data = response.data;
        return data;
    };

    const handleScenarioClick = async (scenario) => {
        const response = await Api.post(URL_SUMMARIZE_GENERATE, { messageId: scenario.messageId, title: scenario.title, description: scenario.description })
        const data = response.data;
        return data;
    }

    useEffect(() => {
        fetchSummary().then((data) => {
            setSummary(data.summary);
            fetchScenarios(data.messageId).then((data) => {
                setScenarios([...data.output.map((item) => ({ ...item, messageId: data.messageId }))]);
            })
        })
    }, [threadId, draftId]);

    console.log("🚀 ~ ReplyQuickPopup ~ onClickInsertReply:", composeView)
    return (
        <Card
            className="!w-[380px] !rounded-none !my-3"
            styles={{ body: { padding: 0, border: 0 } }}
        >
            {
                (summary && summary.length > 0) ?
                    <div>
                        <Title level={5} className="!mb-2">Sender's intent</Title>
                        <Text className="!text-gray-700">{summary}</Text>
                    </div> : null
            }
            {
                (reply && reply.length > 0) ?
                    <div>
                        <Divider className="!my-4" />
                        <div>
                            <Title level={5} className="!mb-2">Your reply</Title>
                            <Text className="!text-gray-700">{reply}</Text>
                            <Button onClick={() => {
                                composeView.insertHTMLIntoBodyAtCursor(reply)
                            }}>Insert</Button>
                        </div>
                    </div> : null
            }
            {
                (summary && summary.length > 0) ?
                    <div>
                        <Divider className="!my-4" />
                        <div>
                            <Title level={5} className="!mb-2">How do you want to reply?</Title>
                            <Text className="!text-gray-500">Here are some ideas</Text>
                            <div className="!mt-3">
                                {
                                    scenarios.map((scenario, index) => {
                                        console.log("🚀 ~ scenarios.map ~ scenario:", scenario)
                                        return (
                                            <Button key={index} onClick={() => { handleScenarioClick(scenario).then(value => setReply(value.text)) }} className="!mr-2 !mb-2" type="default">
                                                {scenario.icon} {scenario.title}
                                            </Button>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <Divider className="!my-4" />
                    </div> : null
            }
            <div>
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