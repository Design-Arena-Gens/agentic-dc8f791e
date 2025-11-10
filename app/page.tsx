'use client';

import { useEffect, useMemo, useState } from 'react';

const MAX_CHARS = 280;
const CATEGORIES = ['Product', 'Design', 'Engineering', 'Career', 'Life', 'Other'] as const;

type Category = typeof CATEGORIES[number];

type Submission = {
  id: string;
  text: string;
  categories: Category[];
  createdAt: number;
};

function loadSubmissions(): Submission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('wdwy_submissions');
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Submission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSubmissions(subs: Submission[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('wdwy_submissions', JSON.stringify(subs));
}

export default function Page() {
  const [text, setText] = useState('');
  const [selected, setSelected] = useState<Category[]>([]);
  const [submitted, setSubmitted] = useState<Submission | null>(null);
  const [subs, setSubs] = useState<Submission[]>([]);

  useEffect(() => {
    setSubs(loadSubmissions());
  }, []);

  const remaining = MAX_CHARS - text.length;
  const isValid = text.trim().length >= 5 && text.trim().length <= MAX_CHARS;

  const topCategories = useMemo(() => {
    const counts = new Map<Category, number>();
    for (const c of CATEGORIES) counts.set(c, 0);
    for (const s of subs) {
      for (const c of s.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .filter(([, n]) => n > 0)
      .slice(0, 6);
  }, [subs]);

  function toggleCategory(c: Category) {
    setSelected((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  function handleSubmit() {
    if (!isValid) return;
    const s: Submission = {
      id: Math.random().toString(36).slice(2),
      text: text.trim(),
      categories: selected,
      createdAt: Date.now(),
    };
    const next = [s, ...subs].slice(0, 1000);
    setSubs(next);
    saveSubmissions(next);
    setSubmitted(s);
    setText('');
    setSelected([]);
  }

  function copyShare() {
    const url = 'https://agentic-dc8f791e.vercel.app';
    const shareText = `What do you want? I answered here: ${url}`;
    navigator.clipboard.writeText(shareText).catch(() => {});
  }

  return (
    <main className="container">
      <section className="card">
        <h1 className="title">What do you want?</h1>
        <p className="subtitle">Say it clearly. One idea per submission.</p>

        <div className="field">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            rows={5}
            placeholder="I want..."
            className="input"
            aria-label="Your answer"
          />
          <div className="meta">
            <span className={remaining < 0 ? 'danger' : ''}>{remaining}</span>
            <button
              className="primary"
              onClick={handleSubmit}
              disabled={!isValid}
            >
              Submit
            </button>
          </div>
        </div>

        <div className="categories">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${selected.includes(c) ? 'chip--on' : ''}`}
              onClick={() => toggleCategory(c)}
              aria-pressed={selected.includes(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="actions">
          <button className="ghost" onClick={copyShare}>Copy share message</button>
          <a className="link" href="https://agentic-dc8f791e.vercel.app" target="_blank" rel="noreferrer">Open site</a>
        </div>

        {submitted && (
          <div className="thanks" role="status">
            <strong>Thanks!</strong> Your answer was saved locally.
          </div>
        )}
      </section>

      <section className="grid">
        <div className="panel">
          <h2>Recent answers</h2>
          {subs.length === 0 ? (
            <p className="muted">No answers yet. Be the first.</p>
          ) : (
            <ul className="list">
              {subs.slice(0, 20).map((s) => (
                <li key={s.id} className="item">
                  <div className="text">{s.text}</div>
                  {s.categories.length > 0 && (
                    <div className="tags">
                      {s.categories.map((c) => (
                        <span key={c} className="tag">{c}</span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <h2>Trending categories</h2>
          {topCategories.length === 0 ? (
            <p className="muted">Nothing yet.</p>
          ) : (
            <ul className="list list--compact">
              {topCategories.map(([c, n]) => (
                <li key={c} className="row">
                  <span>{c}</span>
                  <span className="count">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
