"use client";

import React from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export type MessageType = "error" | "success" | "info" | "warning";

export interface ChatMessage {
  id: string;
  type: MessageType;
  title: string;
  message: string;
  details?: string;
  solutions?: string[];
  timestamp: Date;
}

interface ChatMessageProps {
  message: ChatMessage;
  onDismiss: (id: string) => void;
}

export default function ChatMessageComponent({ message, onDismiss }: ChatMessageProps) {
  const getIcon = () => {
    switch (message.type) {
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (message.type) {
      case "error":
        return "bg-red-50 border-red-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getTextColor = () => {
    switch (message.type) {
      case "error":
        return "text-red-900";
      case "success":
        return "text-green-900";
      case "warning":
        return "text-yellow-900";
      case "info":
      default:
        return "text-blue-900";
    }
  };

  return (
    <div className={`rounded-lg border-2 p-4 mb-3 shadow-md ${getBackgroundColor()}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className={`font-semibold text-sm ${getTextColor()}`}>
            {message.title}
          </div>
          
          {/* Message */}
          <div className={`text-sm mt-1 ${getTextColor()} opacity-90`}>
            {message.message}
          </div>
          
          {/* Details */}
          {message.details && (
            <div className={`text-xs mt-2 ${getTextColor()} opacity-75 font-mono bg-white/50 p-2 rounded`}>
              {message.details}
            </div>
          )}
          
          {/* Solutions */}
          {message.solutions && message.solutions.length > 0 && (
            <div className="mt-3">
              <div className={`text-xs font-semibold ${getTextColor()} mb-1`}>
                💡 Solutions:
              </div>
              <ul className={`text-xs ${getTextColor()} opacity-80 space-y-1`}>
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
          <div className={`text-xs mt-2 ${getTextColor()} opacity-60`}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
        
        {/* Dismiss button */}
        <button
          onClick={() => onDismiss(message.id)}
          className={`ml-2 p-1 rounded hover:bg-white/50 transition-colors ${getTextColor()}`}
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


