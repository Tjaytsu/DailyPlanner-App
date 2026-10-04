import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Check, Copy, Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Generic 24-Hour Schedule (05.00 AM to 04.00 AM) with clean dummy placeholders
const DEFAULT_TIME_SLOTS = [
  {
    time: "05.00 AM",
    activity: "Morning Routine & Meditation",
    completed: false,
  },
  { time: "06.00 AM", activity: "Exercise / Walk", completed: false },
  { time: "07.00 AM", activity: "Breakfast & Family Time", completed: false },
  { time: "08.00 AM", activity: "Deep Work Session 1", completed: false },
  { time: "09.00 AM", activity: "Deep Work Session 1", completed: false },
  {
    time: "10.00 AM",
    activity: "Team Sync & Communications",
    completed: false,
  },
  { time: "11.00 AM", activity: "Core Project Tasks", completed: false },
  { time: "12.00 PM", activity: "Lunch Break", completed: false },
  { time: "01.00 PM", activity: "Lunch Break", completed: false },
  { time: "02.00 PM", activity: "Deep Work Session 2", completed: false },
  { time: "03.00 PM", activity: "Deep Work Session 2", completed: false },
  { time: "04.00 PM", activity: "Admin & Email Catchup", completed: false },
  { time: "05.00 PM", activity: "Wrap up Work & Review", completed: false },
  { time: "06.00 PM", activity: "Rest & Personal Time", completed: false },
  {
    time: "07.00 PM",
    activity: "Learning / Skill Development",
    completed: false,
  },
  {
    time: "08.00 PM",
    activity: "Learning / Skill Development",
    completed: false,
  },
  { time: "09.00 PM", activity: "Reading & Unwind", completed: false },
  { time: "10.00 PM", activity: "Rest", completed: false },
  { time: "11.00 PM", activity: "Night Reflection", completed: false },
  { time: "12.00 AM", activity: "Sleep", completed: false },
  { time: "01.00 AM", activity: "Sleep", completed: false },
  { time: "02.00 AM", activity: "Sleep", completed: false },
  { time: "03.00 AM", activity: "Sleep", completed: false },
  { time: "04.00 AM", activity: "Sleep", completed: false },
];

const DEFAULT_PRIORITIES = [
  "Complete core project deliverable",
  "Review weekly goals",
];
const DEFAULT_TODOS = [
  "Check priority emails",
  "Submit daily progress summary",
];
const DEFAULT_GOALS = [
  "Focus for 4+ hours on high-value work",
  "Maintain healthy routine",
];

export function DailyPlanner() {
  const plannerRef = useRef<HTMLDivElement>(null);

  // 1. Initialize State from LocalStorage (or fall back to clean dummy defaults)
  const [date, setDate] = useState(() => {
    return (
      localStorage.getItem("rkl_planner_date") ||
      new Date().toISOString().split("T")[0]
    );
  });

  const [timeSlots, setTimeSlots] = useState(() => {
    const saved = localStorage.getItem("rkl_planner_timeSlots");
    return saved ? JSON.parse(saved) : DEFAULT_TIME_SLOTS;
  });

  const [priorities, setPriorities] = useState<string[]>(() => {
    const saved = localStorage.getItem("rkl_planner_priorities");
    return saved ? JSON.parse(saved) : DEFAULT_PRIORITIES;
  });

  const [todos, setTodos] = useState<string[]>(() => {
    const saved = localStorage.getItem("rkl_planner_todos");
    return saved ? JSON.parse(saved) : DEFAULT_TODOS;
  });

  const [goals, setGoals] = useState<string[]>(() => {
    const saved = localStorage.getItem("rkl_planner_goals");
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });

  const [copied, setCopied] = useState(false);
  const [newPriority, setNewPriority] = useState("");
  const [newTodo, setNewTodo] = useState("");
  const [newGoal, setNewGoal] = useState("");

  // 2. Automatically save state updates to LocalStorage whenever anything changes
  useEffect(() => {
    localStorage.setItem("rkl_planner_date", date);
    localStorage.setItem("rkl_planner_timeSlots", JSON.stringify(timeSlots));
    localStorage.setItem("rkl_planner_priorities", JSON.stringify(priorities));
    localStorage.setItem("rkl_planner_todos", JSON.stringify(todos));
    localStorage.setItem("rkl_planner_goals", JSON.stringify(goals));
  }, [date, timeSlots, priorities, todos, goals]);

  // Toggle activity completion status
  const toggleActivityComplete = (index: number) => {
    const updated = [...timeSlots];
    updated[index].completed = !updated[index].completed;
    setTimeSlots(updated);
  };

  // Update activity text
  const handleActivityChange = (index: number, text: string) => {
    const updated = [...timeSlots];
    updated[index].activity = text;
    setTimeSlots(updated);
  };

  // Reset day back to fresh dummy template
  const handleResetDay = () => {
    if (
      window.confirm(
        "Are you sure you want to reset the planner to default values?",
      )
    ) {
      setTimeSlots(DEFAULT_TIME_SLOTS);
      setPriorities(DEFAULT_PRIORITIES);
      setTodos(DEFAULT_TODOS);
      setGoals(DEFAULT_GOALS);
      setDate(new Date().toISOString().split("T")[0]);
    }
  };

  // Export Planner as PNG Image
  const exportAsImage = async () => {
    if (plannerRef.current === null) return;
    try {
      const dataUrl = await toPng(plannerRef.current, { cacheBust: true });
      const link = document.createElement("a");
      link.download = `RKL-Daily-Planner-${date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export image:", err);
    }
  };

  // Copy formatted text summary for WhatsApp / Messaging
  const copyToClipboard = () => {
    let summary = `📋 *DAILY PLANNER TRACKER* (${date})\n`;
    summary += `*RAISING KINGDOM LEADERS*\n\n`;

    summary += `🔥 *TOP PRIORITIES:*\n`;
    priorities.forEach((p) => (summary += `• ${p}\n`));

    summary += `\n⏰ *HOURLY SCHEDULE:*\n`;
    timeSlots.forEach((slot) => {
      if (slot.activity.trim()) {
        const check = slot.completed ? "✅" : "⏳";
        summary += `${check} *${slot.time}*: ${slot.activity}\n`;
      }
    });

    summary += `\n✅ *TO DO LIST:*\n`;
    todos.forEach((t) => (summary += `• ${t}\n`));

    summary += `\n🎯 *DAILY GOALS:*\n`;
    goals.forEach((g) => (summary += `• ${g}\n`));

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-foreground">Date:</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-auto"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleResetDay}
            className="text-muted-foreground hover:text-destructive"
          >
            Reset Day
          </Button>

          <Button variant="outline" onClick={copyToClipboard} className="gap-2">
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied for WhatsApp!" : "Copy Text Summary"}
          </Button>

          <Button onClick={exportAsImage} className="gap-2">
            <Download className="h-4 w-4" /> Export as Image
          </Button>
        </div>
      </div>

      {/* Capturable Canvas */}
      <div
        ref={plannerRef}
        className="bg-background text-foreground border rounded-2xl p-6 sm:p-8 shadow-md grid grid-cols-1 md:grid-cols-12 gap-8"
      >
        {/* Main Content Area */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          <div className="border-b pb-4">
            <h1 className="text-3xl font-extrabold tracking-wider text-primary uppercase">
              Daily Planner
            </h1>
            <p className="text-xs tracking-widest text-muted-foreground uppercase font-semibold">
              Raising Kingdom Leaders Tracker
            </p>
            <div className="mt-2 text-sm font-medium text-foreground">
              <span className="text-muted-foreground">DATE:</span> {date}
            </div>
          </div>

          {/* Time Schedule Table */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
              <span className="col-span-1 text-center">Done</span>
              <span className="col-span-4 pl-2">Time</span>
              <span className="col-span-7 pl-2">Activities</span>
            </div>

            <div className="divide-y divide-border">
              {timeSlots.map(
                (
                  slot: { time: string; activity: string; completed: boolean },
                  index: number,
                ) => (
                  <div
                    key={index}
                    className={`grid grid-cols-12 items-center py-1.5 transition-colors rounded-md px-1 ${
                      slot.completed ? "bg-muted/40" : "hover:bg-muted/20"
                    }`}
                  >
                    <div className="col-span-1 flex justify-center">
                      <input
                        type="checkbox"
                        checked={slot.completed}
                        onChange={() => toggleActivityComplete(index)}
                        className="h-4 w-4 rounded border-muted-foreground text-primary focus:ring-primary cursor-pointer"
                      />
                    </div>

                    <span className="col-span-4 pl-2 text-xs font-mono font-semibold text-muted-foreground">
                      {slot.time}
                    </span>

                    <div className="col-span-7 border-l pl-3">
                      <Input
                        variant="ghost"
                        value={slot.activity}
                        onChange={(e) =>
                          handleActivityChange(index, e.target.value)
                        }
                        className={`h-7 text-xs sm:text-sm border-none focus-visible:ring-1 bg-transparent px-1 ${
                          slot.completed
                            ? "line-through text-muted-foreground font-normal"
                            : "font-medium"
                        }`}
                        placeholder="Add activity..."
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-5 lg:col-span-4 space-y-6 border-l pl-0 md:pl-6">
          {/* Top Priorities */}
          <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-2">
              Top Priorities
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm">
              {priorities.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {item}
                  </span>
                  <button
                    onClick={() =>
                      setPriorities(priorities.filter((_, i) => i !== idx))
                    }
                    className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="New priority..."
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newPriority.trim()) {
                    setPriorities([...priorities, newPriority.trim()]);
                    setNewPriority("");
                  }
                }}
              />
              <Button
                size="sm"
                className="h-8 px-2"
                onClick={() => {
                  if (newPriority.trim()) {
                    setPriorities([...priorities, newPriority.trim()]);
                    setNewPriority("");
                  }
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* To Do List */}
          <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-2">
              To Do List
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm">
              {todos.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    {item}
                  </span>
                  <button
                    onClick={() => setTodos(todos.filter((_, i) => i !== idx))}
                    className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="New todo..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTodo.trim()) {
                    setTodos([...todos, newTodo.trim()]);
                    setNewTodo("");
                  }
                }}
              />
              <Button
                size="sm"
                className="h-8 px-2"
                onClick={() => {
                  if (newTodo.trim()) {
                    setTodos([...todos, newTodo.trim()]);
                    setNewTodo("");
                  }
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Daily Goals */}
          <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-2">
              Daily Goals
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm">
              {goals.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {item}
                  </span>
                  <button
                    onClick={() => setGoals(goals.filter((_, i) => i !== idx))}
                    className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="New goal..."
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newGoal.trim()) {
                    setGoals([...goals, newGoal.trim()]);
                    setNewGoal("");
                  }
                }}
              />
              <Button
                size="sm"
                className="h-8 px-2"
                onClick={() => {
                  if (newGoal.trim()) {
                    setGoals([...goals, newGoal.trim()]);
                    setNewGoal("");
                  }
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
