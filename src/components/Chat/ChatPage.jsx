import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../api/axiosInstance";
import { API_ROUTES } from "../../api/apiRoutes";
import { FiSend, FiUser, FiCpu } from "react-icons/fi";

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await axiosInstance.get(API_ROUTES.CHAT.GET_MESSAGES);
            // The API returns a list of messages directly based on the user request example
            // Sort by createdAt to ensure correct order if not already sorted
            const sortedMessages = response.data.sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
            setMessages(sortedMessages);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const question = input;
        setInput("");
        setLoading(true);

        // Optimistically add user message
        const tempUserMessage = {
            id: Date.now(), // Temporary ID
            message: question,
            senderType: "USER",
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempUserMessage]);

        try {
            const response = await axiosInstance.post(API_ROUTES.CHAT.ASK, {
                question: question,
            });

            const answer = response.data;

            // Add assistant response
            const assistantMessage = {
                id: Date.now() + 1,
                message: answer.answer,
                senderType: "ASSISTANT",
                createdAt: answer.timestamp || new Date().toISOString(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            // Optionally handle error in UI
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden m-4">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                    <FiCpu size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">AI Assistant</h2>
                    <p className="text-sm text-gray-500">Ask me anything about the company</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, index) => {
                    const isUser = msg.senderType === "USER";
                    return (
                        <div
                            key={msg.id || index}
                            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`flex max-w-[80%] gap-3 ${isUser ? "flex-row-reverse" : "flex-row"
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                                        }`}
                                >
                                    {isUser ? <FiUser size={16} /> : <FiCpu size={16} />}
                                </div>
                                <div
                                    className={`p-4 rounded-2xl shadow-sm whitespace-pre-wrap ${isUser
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                                        }`}
                                >
                                    {msg.message}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex max-w-[80%] gap-3 flex-row">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100 text-purple-600">
                                <FiCpu size={16} />
                            </div>
                            <div className="p-4 rounded-2xl bg-white border border-gray-100 rounded-tl-none shadow-sm">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                        <span>Send</span>
                        <FiSend size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;
