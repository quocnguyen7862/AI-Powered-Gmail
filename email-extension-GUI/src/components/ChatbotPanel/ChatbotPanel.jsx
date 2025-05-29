import React, { useState } from 'react'
import { BotMessage, Header, Input, Messages, UserMessage } from '../ReplyQuickPopup/ReplyQuickPopup'
import { Divider } from 'antd';
import { URL_CHATBOT } from '../../js/config';
import Api from '../../js/axios.config';

const ChatbotPanel = ({ session }) => {
    const [messages, setMessages] = useState([]);

    const handleSend = async (text) => {
        const newMessages = messages.concat(
            <div key={messages.length + 1}>
                {(messages.length > 0) && <Divider className="!m-0" />}
                <UserMessage text={text} />
                <BotMessage fetchMessage={async () => {
                    try {
                        const response = await Api.post(URL_CHATBOT, { message: text }, {}, session?.accessToken)
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

    return (
        <div className='flex flex-col h-dvh'>
            <Header />
            <Messages messages={messages} />
            <Input onSend={handleSend} />
        </div>
    )
}

export default ChatbotPanel