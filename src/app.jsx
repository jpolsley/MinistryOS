/* global React, ReactDOM */

const { useState, useEffect, useMemo } = React;

/* ---------- Drag & Drop ---------- */
const RBD =
  window.ReactBeautifulDnd ||
  window.ReactBeautifulDnD ||
  window["react-beautiful-dnd"];

if (!RBD) {
  throw new Error("react-beautiful-dnd not found on window");
}

const { DragDropContext, Droppable, Draggable } = RBD;

/* ---------- Constants ---------- */
const STORAGE_KEY = "ministry_os_dashboard_v24";

const ViewType = {
  PROJECTS: "PROJECTS",
  BOARD: "BOARD",
};

const Status = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  BLOCKED: "BLOCKED",
  DONE: "DONE",
};

const InitialProjects = {
  YC26: {
    id: "YC26",
    label: "Youth Councils 2026",
    color: "#3B82F6",
    desc: "Develop and Execute Youth Councils Brief and Plan.",
    archived: false,
  },
  RENDEZVOUS: {
    id: "RENDEZVOUS",
    label: "Rendezvous",
    color: "#EC4899",
    desc: "Monthly youth gathering coordination and planning.",
    archived: false,
  },
  DISCIPLESHIP: {
    id: "DISCIPLESHIP",
    label: "Discipleship & Camp",
    color: "#10B981",
    desc: "Tracking, resource creation, and summer camp spiritual development.",
    archived: false,
  },
  LEADERSHIP: {
    id: "LEADERSHIP",
    label: "Leadership",
    color: "#8B5CF6",
    desc: "Internal committee formation and leadership development.",
    archived: false,
  },
  ADMIN: {
    id: "ADMIN",
    label: "Administration",
    color: "#52525B",
    desc: "General department upkeep, compliance, and HR goals.",
    archived: false,
  },
};

const initialTasks = [
  {
    id: "T1",
    title: "Worship Band",
    project: "YC26",
    status: Status.TODO,
  },
  {
    id: "T2",
    title: "Decor",
    project: "YC26",
    status: Status.IN_PROGRESS,
  },
  {
    id: "T3",
    title: "2026 Locations",
    project: "RENDEZVOUS",
    status: Status.BLOCKED,
  },
];

/* ---------- Components ---------- */

function Sidebar({ view, setView }) {
  return (
    <div className="w-16 bg-bg-panel border-r border-border-dim flex flex-col items-center py-6">
      <div className="w-10 h-10 rounded-xl bg-accent text-black flex items-center justify-center font-bold mb-8">
        M
      </div>
      <button
        className={`mb-4 ${view === ViewType.PROJECTS ? "text-white" : "text-zinc-500"}`}
        onClick={() => setView(ViewType.PROJECTS)}
      >
        📁
      </button>
      <button
        className={`${view === ViewType.BOARD ? "text-white" : "text-zinc-500"}`}
        onClick={() => setView(ViewType.BOARD)}
      >
        🧱
      </button>
    </div>
  );
}

function ProjectGrid({ projects }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.values(projects)
        .filter(p => !p.archived)
        .map(p => (
          <div
            key={p.id}
            className="bg-bg-card border border-border-dim rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: p.color }}
              />
              <h2 className="text-xl font-bold text-white">{p.label}</h2>
            </div>
            <p className="text-sm text-zinc-400">{p.desc}</p>
          </div>
        ))}
    </div>
  );
}

function Board({ tasks, setTasks }) {
  function onDragEnd(result) {
    if (!result.destination) return;

    const { draggableId, destination } = result;

    setTasks(prev =>
      prev.map(t =>
        t.id === draggableId
          ? { ...t, status: destination.droppableId }
          : t
      )
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto">
        {Object.values(Status).map(status => (
          <Droppable droppableId={status} key={status}>
            {provided => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-72 bg-bg-panel border border-border-dim rounded-xl p-4"
              >
                <h3 className="text-sm uppercase text-zinc-400 mb-3">
                  {status.replace("_", " ")}
                </h3>
                {tasks
                  .filter(t => t.status === status)
                  .map((t, i) => (
                    <Draggable draggableId={t.id} index={i} key={t.id}>
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-bg-card border border-border-dim rounded p-3 mb-2 text-white"
                        >
                          {t.title}
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}

/* ---------- App ---------- */

function App() {
  const [view, setView] = useState(ViewType.PROJECTS);

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY + "_projects");
    return saved ? JSON.parse(saved) : InitialProjects;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialTasks;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY + "_projects",
      JSON.stringify(projects)
    );
  }, [projects]);

  return (
    <div className="flex w-screen h-screen bg-bg-main text-text-primary">
      <Sidebar view={view} setView={setView} />

      <main className="flex-1 p-8 overflow-hidden">
        <h1 className="text-3xl font-bold text-white mb-6">
          Active Operations
        </h1>

        {view === ViewType.PROJECTS && (
          <ProjectGrid projects={projects} />
        )}

        {view === ViewType.BOARD && (
          <Board tasks={tasks} setTasks={setTasks} />
        )}
      </main>
    </div>
  );
}

/* ---------- Mount ---------- */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
