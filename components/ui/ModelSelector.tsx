import React from "react";
import { ChevronDown } from "lucide-react";

type StudioMode =
  | "create-image"
  | "edit-image"
  | "compose-image"
  | "create-video";

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  mode: StudioMode;
  showStatus?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  setSelectedModel,
  mode,
  showStatus = true,
}) => {
  const getModelsForMode = (currentMode: StudioMode) => {
    if (currentMode === "create-video") {
      return [
        "veo-3.0-generate-001",
        "veo-3.0-fast-generate-001",
        "veo-2.0-generate-001",
      ];
    } else {
      // For image modes - now includes Firebase AI models
      return [
        "gemini-2.5-flash-image-preview", // Legacy API
        "gemini-2.5-flash-image", // Firebase AI SDK (Nano Banana)
        "imagen-4.0-fast-generate-001"
      ];
    }
  };

  const models = getModelsForMode(mode);

  const formatModelName = (model: string) => {
    if (model.includes("veo-3.0-fast")) return "Veo 3 - Fast";
    if (model.includes("veo-3.0")) return "Veo 3";
    if (model.includes("veo-2.0")) return "Veo 2";
    if (model === "gemini-2.5-flash-image") return "Gemini 1.5 Flash (Nano Banana API)";
    if (model.includes("gemini-2.5") && model !== "gemini-2.5-flash-image") return "Gemini 2.5 Flash (Legacy)";
    if (model.includes("imagen-4.0")) return "Imagen 4.0 Fast";
    return model;
  };

  const getModelStatus = (model: string) => {
    if (model.includes("gemini")) {
      return { status: "🟢 Free", limit: "50/day", color: "text-green-600" };
    }
    if (model.includes("imagen")) {
      return { status: "🟡 Paid", limit: "Unlimited", color: "text-yellow-600" };
    }
    if (model.includes("veo")) {
      return { status: "🟡 Paid", limit: "Varies", color: "text-yellow-600" };
    }
    return { status: "⚪ Unknown", limit: "Unknown", color: "text-gray-600" };
  };

  const currentStatus = getModelStatus(selectedModel);

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center">
        <select
          aria-label="Model selector"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="pl-3 pr-8 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-gray-500 appearance-none"
        >
          {models.map((model) => (
            <option key={model} value={model}>
              {formatModelName(model)}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      {showStatus && (
        <div className="text-xs text-gray-600">
          <span className={currentStatus.color}>{currentStatus.status}</span>
          <span className="ml-2">({currentStatus.limit})</span>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
