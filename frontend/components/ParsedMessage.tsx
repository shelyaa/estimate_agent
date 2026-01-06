interface AgentMessage {
    status: string;
    message?: string;
    tasks?: {
        task: string;
        milestone: string;
        estimate_hours: Record<string, number>;
        historical_reference: string;
    }[];
    confidence?: string;
    risks?: string[];
    understood_requirements_summary?: string[];
    missing_or_unclear_areas?: { area: string; problem: string }[];
    clarification_questions?: { id: number; priority: string; question: string }[];
}

interface MessageProps {
    msg: { content: AgentMessage };
}

export const AgentMessageView = ({ msg }: MessageProps) => {
 let data;
if (typeof msg.content === "string") {
  try {
    data = JSON.parse(msg.content);
  } catch (e) {
    console.error("Помилка парсингу JSON:", e);
    return <div>{msg.content}</div>; 
  }
} else {
  data = msg.content; 
}

    switch (data.status) {
        case "ready_for_estimation":
            return (
                <div className="flex flex-col gap-6 p-4">
                    <div className="text-blue-600 font-semibold">
                        Status: {data.status.replaceAll("_", " ")}
                    </div>

                    <h2 className="text-lg font-semibold">Tasks for Estimation</h2>
                    <ul className="space-y-3">
                        {data.tasks?.map((t, idx) => (
                            <li
                                key={idx}
                                className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded space-y-2"
                            >
                                <div className="font-medium text-gray-800">{t.task}</div>
                                <div className="text-sm text-gray-700">Milestone: {t.milestone}</div>

                                {/* Estimate Hours */}
                                <div className="text-sm text-gray-600">
                                    <div className="font-medium mb-1">Estimate Hours:</div>
                                    <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-gray-700 text-xs">
                                        {Object.entries(t.estimate_hours).map(([key, val]) => (
                                            <li key={key} className="flex justify-between">
                                                <span className="capitalize">{key.replaceAll("_", " ")}</span>
                                                <span>{val}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Historical Reference */}
                                {t.historical_reference && (
                                    <div className="text-xs text-gray-500">
                                        Historical Reference: {t.historical_reference}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    {data.risks && data.risks.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold mt-4">⚠️ Risks</h2>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                                {data.risks.map((r, i) => (
                                    <li key={i}>{r}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {data.confidence && (
                        <div className="text-sm text-gray-600 mt-2">
                            Confidence: <span className="font-semibold">{data.confidence}</span>
                        </div>
                    )}
                </div>
            );

        case "clarification_required":
            return (
                <div className="flex flex-col gap-6 p-4">
                    <div className="text-yellow-600 font-semibold">
                        Status: {data.status.replaceAll("_", " ")}
                    </div>

                    <h2 className="text-lg font-semibold">✅ Understood Requirements</h2>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {data.understood_requirements_summary?.map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>

                    <h2 className="text-lg font-semibold mt-4">⚠️ Missing / Unclear Areas</h2>
                    <ul className="space-y-2">
                        {data.missing_or_unclear_areas?.map((m, idx) => (
                            <li key={idx} className="border-l-4 border-yellow-400 bg-yellow-50 p-3 rounded">
                                <div className="font-medium text-gray-800">{m.area}</div>
                                <div className="text-gray-700">{m.problem}</div>
                            </li>
                        ))}
                    </ul>

                    <h2 className="text-lg font-semibold mt-4">❓ Clarification Questions</h2>
                    <ul className="space-y-2">
                        {data.clarification_questions?.map((q) => (
                            <li
                                key={q.id}
                                className={`border-l-4 p-3 rounded ${
                                    q.priority === "high"
                                        ? "border-red-500 bg-red-50"
                                        : q.priority === "medium"
                                            ? "border-yellow-500 bg-yellow-50"
                                            : "border-gray-400 bg-gray-50"
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-800">{q.question}</span>
                                    <span
                                        className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                                            q.priority === "high"
                                                ? "bg-red-500 text-white"
                                                : q.priority === "medium"
                                                    ? "bg-yellow-400 text-gray-800"
                                                    : "bg-gray-400 text-white"
                                        }`}
                                    >
                    {q.priority.toUpperCase()}
                  </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            );

        case "error":
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 font-medium">
                    Error: {data.message || "Unknown error"}
                </div>
            );

        default:
            return (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded text-gray-700">
                    Unknown message format
                </div>
            );
    }
};
