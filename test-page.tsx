"use client";

import React, { useState } from "react";

const TestPage: React.FC = () => {
  const [messages, setMessages] = useState([]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto">
        <div className="flex-1 overflow-hidden">
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
            <div className="w-20 h-20 opacity-30 mb-4">🤖</div>
            <p className="text-lg font-medium text-gray-600 mb-2">Welcome to AI Studio</p>
            <p className="text-sm text-gray-500 text-center max-w-md">
              Start by entering a prompt below. Your conversation, images, and videos will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;

