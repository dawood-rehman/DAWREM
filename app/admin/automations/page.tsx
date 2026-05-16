"use client";

import { useCallback, useEffect, useState } from "react";
import { Zap, Play, Clock, CheckCircle, XCircle, ToggleLeft, ToggleRight, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface AutomationLog { runAt: string; status: string; message: string; }
interface Automation {
  _id: string;
  name: string;
  description: string;
  trigger: string;
  triggerConfig: Record<string, string>;
  actions: Array<{ type: string }>;
  isActive: boolean;
  lastRun?: string;
  lastRunStatus?: string;
  runCount: number;
  logs?: AutomationLog[];
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchAutomations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/automations");
      const data = await res.json();
      setAutomations(data.automations || []);
    } catch {
      toast.error("Failed to load automations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchAutomations();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchAutomations]);

  const toggleAutomation = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/automations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      setAutomations((prev) => prev.map((a) => a._id === id ? { ...a, isActive } : a));
      toast.success(isActive ? "Automation enabled" : "Automation disabled");
    } catch {
      toast.error("Failed to update");
    }
  };

  const testAutomation = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/automations/${id}/test`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Test triggered - check your email/logs");
    } catch {
      toast.error("Test failed");
    } finally {
      setTestingId(null);
    }
  };

  const activeCount = automations.filter((a) => a.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-cormorant text-velour-black font-medium">Automation Center</h1>
          <p className="text-sm text-gray-400 font-inter mt-1">{activeCount} of {automations.length} automations active</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-inter">
          <CheckCircle size={15} />
          Engine Running
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Automations", value: automations.length, icon: Zap, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Active", value: activeCount, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Runs", value: automations.reduce((s, a) => s + a.runCount, 0), icon: Play, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Paused", value: automations.length - activeCount, icon: XCircle, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat) => (
          <div key={stat.label} className="admin-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 tracking-wider uppercase font-inter mb-1">{stat.label}</p>
                <p className="text-2xl font-cormorant font-medium text-velour-black">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon size={18} className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Automations list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="admin-card">
              <div className="skeleton h-6 w-1/3 mb-2 rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
            </div>
          ))
        ) : automations.map((auto) => (
          <div key={auto._id} className={`admin-card transition-all ${!auto.isActive ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${auto.isActive ? "bg-burgundy-50" : "bg-gray-100"}`}>
                  <Zap size={16} className={auto.isActive ? "text-burgundy-900" : "text-gray-400"} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="text-sm font-medium font-inter text-velour-black">{auto.name}</h3>
                    <span className={`text-[10px] tracking-wider px-2 py-0.5 rounded-full uppercase font-inter ${
                      auto.trigger === "event" ? "bg-blue-100 text-blue-700" :
                      auto.trigger === "schedule" ? "bg-purple-100 text-purple-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {auto.trigger}
                    </span>
                    {auto.lastRunStatus && (
                      <span className={`text-[10px] tracking-wider px-2 py-0.5 rounded-full uppercase font-inter ${auto.lastRunStatus === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {auto.lastRunStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-inter">{auto.description}</p>

                  <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400 font-inter">
                    <span className="flex items-center gap-1">
                      <Play size={10} />
                      {auto.runCount} runs
                    </span>
                    {auto.lastRun && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        Last: {format(new Date(auto.lastRun), "MMM d, h:mm a")}
                      </span>
                    )}
                    <span>Trigger: <strong>{String(auto.triggerConfig?.event || auto.triggerConfig?.schedule || "manual")}</strong></span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => testAutomation(auto._id)}
                  disabled={testingId === auto._id}
                  className="text-xs border border-gray-300 px-3 py-1.5 font-inter hover:border-burgundy-900 transition-colors rounded flex items-center gap-1"
                >
                  <Play size={11} />
                  {testingId === auto._id ? "Testing..." : "Test"}
                </button>

                <button
                  onClick={() => setExpandedId(expandedId === auto._id ? null : auto._id)}
                  className="text-xs border border-gray-300 px-3 py-1.5 font-inter hover:border-burgundy-900 transition-colors rounded flex items-center gap-1"
                >
                  Logs
                  <ChevronDown size={11} className={`transition-transform ${expandedId === auto._id ? "rotate-180" : ""}`} />
                </button>

                {/* Toggle */}
                <button
                  onClick={() => toggleAutomation(auto._id, !auto.isActive)}
                  className="flex items-center gap-2"
                  title={auto.isActive ? "Disable" : "Enable"}
                >
                  {auto.isActive
                    ? <ToggleRight size={28} className="text-green-500" />
                    : <ToggleLeft size={28} className="text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Expanded logs */}
            {expandedId === auto._id && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs tracking-widest uppercase font-inter font-medium text-gray-500 mb-3">Recent Logs</h4>
                {!auto.logs?.length ? (
                  <p className="text-sm text-gray-400 font-inter">No logs yet for this automation</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {auto.logs.slice(-10).reverse().map((log, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs font-inter">
                        <span className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${log.status === "success" ? "bg-green-500" : "bg-red-500"}`} />
                        <div>
                          <span className="text-gray-500">{format(new Date(log.runAt), "MMM d, h:mm:ss a")}</span>
                          <span className="mx-2 text-gray-300">|</span>
                          <span className="text-gray-700">{log.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
