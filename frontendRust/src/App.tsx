import { useEffect, useState } from "react";

type Note = { id: string; text: string };

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");

  async function load() {
    const res = await fetch("/api/notes");
    setNotes(await res.json());
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const created: Note = await res.json();
    setNotes((n) => [...n, created]);
    setText("");
  }

  async function remove(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes((n) => n.filter((x) => x.id !== id));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "40px auto",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <h1>Rust + React: Notes</h1>

      <form
        onSubmit={addNote}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note…"
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        />
        <button type="submit" style={{ padding: "8px 14px", borderRadius: 8 }}>
          Add
        </button>
      </form>

      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
        {notes.map((n) => (
          <li
            key={n.id}
            style={{
              padding: 12,
              border: "1px solid #eee",
              borderRadius: 10,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{n.text}</span>
            <button
              onClick={() => remove(n.id)}
              style={{
                border: "none",
                background: "#f5f5f5",
                borderRadius: 8,
                padding: "6px 10px",
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
