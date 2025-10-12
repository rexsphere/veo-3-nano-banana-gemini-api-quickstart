"use client";

import React from "react";

export interface GenerationParams {
  temperature: number;
  topP: number;
  maxOutputTokens: number;
  safetyLevel: "off" | "low" | "medium" | "high";
}

interface ParameterControlsProps {
  params: GenerationParams;
  onChange: (params: GenerationParams) => void;
  modelType: "gemini" | "imagen" | "veo";
  className?: string;
}

export default function ParameterControls({
  params,
  onChange,
  modelType,
  className = "",
}: ParameterControlsProps) {
  // Only show parameters for Gemini models (Firebase AI SDK supports these)
  if (modelType !== "gemini") {
    return null;
  }

  const updateParam = <K extends keyof GenerationParams>(
    key: K,
    value: GenerationParams[K]
  ) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className={`space-y-4 p-4 bg-white/50 rounded-lg border border-gray-200 ${className}`}>
      <div className="text-sm font-semibold text-gray-700 mb-3">
        🎛️ Generation Parameters
      </div>

      {/* Temperature */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-gray-600">
            Temperature
          </label>
          <span className="text-xs text-gray-500">{params.temperature.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={params.temperature}
          onChange={(e) => updateParam("temperature", parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="text-xs text-gray-400">
          Controls randomness (0 = focused, 2 = creative)
        </div>
      </div>

      {/* Top P */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-gray-600">
            Top P
          </label>
          <span className="text-xs text-gray-500">{params.topP.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={params.topP}
          onChange={(e) => updateParam("topP", parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="text-xs text-gray-400">
          Nucleus sampling (lower = more focused)
        </div>
      </div>

      {/* Max Tokens */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-gray-600">
            Max Output Tokens
          </label>
          <span className="text-xs text-gray-500">{params.maxOutputTokens}</span>
        </div>
        <select
          value={params.maxOutputTokens}
          onChange={(e) => updateParam("maxOutputTokens", parseInt(e.target.value))}
          className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1024">1,024 (Short)</option>
          <option value="2048">2,048 (Medium)</option>
          <option value="4096">4,096 (Long)</option>
          <option value="8192">8,192 (Very Long)</option>
          <option value="16384">16,384 (Max)</option>
          <option value="32768">32,768 (Extended)</option>
        </select>
        <div className="text-xs text-gray-400">
          Maximum length of generated response
        </div>
      </div>

      {/* Safety Level */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-gray-600">
            Safety Filter
          </label>
          <span className="text-xs text-gray-500 capitalize">{params.safetyLevel}</span>
        </div>
        <select
          value={params.safetyLevel}
          onChange={(e) => updateParam("safetyLevel", e.target.value as GenerationParams["safetyLevel"])}
          className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="off">🟢 Off (Most Creative)</option>
          <option value="low">🟡 Low (Block Extreme)</option>
          <option value="medium">🟠 Medium (Block Moderate+)</option>
          <option value="high">🔴 High (Block Most)</option>
        </select>
        <div className="text-xs text-gray-400">
          Content safety filtering level
        </div>
      </div>

      {/* Presets */}
      <div className="pt-2 border-t border-gray-200">
        <div className="text-xs font-medium text-gray-600 mb-2">Quick Presets</div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onChange({
              temperature: 0.3,
              topP: 0.8,
              maxOutputTokens: 2048,
              safetyLevel: "medium",
            })}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            🎯 Precise
          </button>
          <button
            onClick={() => onChange({
              temperature: 1.0,
              topP: 0.95,
              maxOutputTokens: 4096,
              safetyLevel: "low",
            })}
            className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
          >
            ⚖️ Balanced
          </button>
          <button
            onClick={() => onChange({
              temperature: 1.8,
              topP: 0.98,
              maxOutputTokens: 8192,
              safetyLevel: "off",
            })}
            className="px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded hover:bg-pink-200 transition-colors"
          >
            🎨 Creative
          </button>
        </div>
      </div>
    </div>
  );
}


