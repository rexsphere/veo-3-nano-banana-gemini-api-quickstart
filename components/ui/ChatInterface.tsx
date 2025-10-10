"use client";

import React, { useEffect, useRef } from "react";
import { Bot, User, AlertCircle, CheckCircle, Info, Image as ImageIcon, Video } from "lucide-react";
import Image from "next/image";

export type MessageRole = "user" | "assistant" | "system";
export type MessageType = "text" | "image" | "video" | "error" | "success" | "info";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  details?: string;
  solutions?: string[];
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  className?: string;
}

export default function ChatInterface({ messages, className = "" }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getIcon = (role: MessageRole, type: MessageType) => {
    if (role === "user") {
      return <User className="w-5 h-5" />;
    }
    
    if (type === "error") {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    if (type === "success") {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (type === "info") {
      return <Info className="w-5 h-5 text-blue-500" />;
    }
    if (type === "image") {
      return <ImageIcon className="w-5 h-5 text-purple-500" />;
    }
    if (type === "video") {
      return <Video className="w-5 h-5 text-orange-500" />;
    }
    
    return <Bot className="w-5 h-5 text-blue-600" />;
  };

  const getBubbleStyle = (role: MessageRole, type: MessageType) => {
    if (role === "user") {
      return "bg-blue-500 text-white ml-auto";
    }
    
    if (type === "error") {
      return "bg-red-50 border border-red-200 text-red-900";
    }
    if (type === "success") {
      return "bg-green-50 border border-green-200 text-green-900";
    }
    if (type === "info") {
      return "bg-blue-50 border border-blue-200 text-blue-900";
    }
    
    return "bg-gray-100 text-gray-900";
  };

  if (messages.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full text-gray-400 p-8 ${className}`}>
        <Bot className="w-20 h-20 mb-4 opacity-30" />
        <p className="text-lg font-medium text-gray-600 mb-2">Welcome to AI Studio</p>
        <p className="text-sm text-gray-500 text-center max-w-md">
          Start by entering a prompt below. Your conversation, images, and videos will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full overflow-y-auto ${className}`}>
      <div className="flex-1 space-y-4 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"} items-start`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : message.type === "error"
                  ? "bg-red-100"
                  : message.type === "success"
                  ? "bg-green-100"
                  : "bg-gray-200"
              }`}
            >
              {getIcon(message.role, message.type)}
            </div>

            {/* Message Bubble */}
            <div
              className={`flex-1 ${
                message.imageUrl || message.videoUrl ? 'max-w-full' : 'max-w-[85%] md:max-w-[75%]'
              } rounded-2xl px-4 py-3 ${getBubbleStyle(
                message.role,
                message.type
              )}`}
            >
              {/* Text Content */}
              {message.content && (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              )}

              {/* Image - Full width, easy to see */}
              {message.imageUrl && (
                <div className="mt-3 -mx-4">
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={message.imageUrl}
                      alt="Generated content"
                      width={800}
                      height={600}
                      className="w-full h-auto cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => window.open(message.imageUrl, '_blank')}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Click to open in new tab
                  </div>
                </div>
              )}

              {/* Video - Full width, easy to see */}
              {message.videoUrl && (
                <div className="mt-3 -mx-4">
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <video
                      src={message.videoUrl}
                      controls
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Details */}
              {message.details && (
                <div className="mt-2 text-xs opacity-75 font-mono bg-white/50 p-2 rounded">
                  {message.details}
                </div>
              )}

              {/* Solutions */}
              {message.solutions && message.solutions.length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="text-xs font-semibold opacity-90">💡 Solutions:</div>
                  <ul className="text-xs space-y-1 opacity-80">
                    {message.solutions.map((solution, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="font-semibold">{index + 1}.</span>
                        <span>{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Timestamp */}
              <div
                className={`text-xs mt-2 opacity-60 ${
                  message.role === "user" ? "text-right" : "text-left"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

