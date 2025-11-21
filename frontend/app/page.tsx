'use client';
import { useEffect, useState, useRef } from 'react';

type FormState = { name: string; email: string; message: string };
const QUEUE_KEY = 'offline_forms_queue';

async function postForm(base: string, form: FormState) {
  const cleanBase = base?.replace(/\/+$/g, '') ?? '';
  const url = `${cleanBase}/forms`;
  console.debug('[postForm] POST ->', url, 'payload:', form);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(form),
  });
  if (!res.ok) {
    let bodyText = '';
    try {
      bodyText = await res.text();
    } catch (e) {
      /* ignore read error */
    }
    console.error('[postForm] non-ok response', { status: res.status, bodyText });
    throw new Error(`status:${res.status} body:${bodyText}`);
  }
  const json = await res.json();
  console.debug('[postForm] success', json);
  return json;
}

function readQueue(): FormState[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FormState[];
  } catch {
    return [];
  }
}

function writeQueue(q: FormState[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

async function flushQueue(base: string) {
  const queue = readQueue();
  if (!queue.length) return;
  const remaining: FormState[] = [];
  for (const [idx, item] of queue.entries()) {
    try {
      const data = await postForm(base, item);
      console.log('flushed form created', { index: idx, data });
    } catch (err) {
      console.error('failed to flush queued item', { index: idx, err });
      remaining.push(item);
    }
  }
  writeQueue(remaining);

  // If there are still remaining items and we're online, retry after a short delay.
  if (remaining.length && typeof window !== 'undefined' && navigator.onLine) {
    console.log(`retrying flush for ${remaining.length} remaining items in 5s`);
    setTimeout(() => {
      flushQueue(base).catch((e) => console.error('retry flush error', e));
    }, 5000);
  }
}

export default function Page() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [showStored, setShowStored] = useState(false);
  const [showOnline, setShowOnline] = useState(false);
  const [queuedCount, setQueuedCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return readQueue().length;
  });
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const initialOnlineRef = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = async () => {
      try {
        await flushQueue(base);
        setQueuedCount(readQueue().length);
        if (!initialOnlineRef.current) {
          setShowOnline(true);
          setTimeout(() => setShowOnline(false), 3000);
        }
      } catch (e) {
        console.error('flush error', e);
      }
      initialOnlineRef.current = false;
    };

    window.addEventListener('online', handleOnline);

    if (navigator.onLine) {
      // initial mount and already online — flush silently without showing toast
      handleOnline();
    } else {
      // start in offline mode: when the online event fires later, show the toast
      initialOnlineRef.current = false;
    }

    return () => window.removeEventListener('online', handleOnline);
  }, [base, initialOnlineRef]);

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const showStoredPopup = () => {
    setShowStored(true);
    setTimeout(() => setShowStored(false), 3000);
  };

  const queueForm = (f: FormState) => {
    const q = readQueue();
    q.push(f);
    writeQueue(q);
    setQueuedCount(q.length);
    showStoredPopup();
    console.log('queued offline', f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return console.error('name, email and message are required');
    setLoading(true);
    try {
      if (typeof window !== 'undefined' && !navigator.onLine) {
        queueForm(form);
        setForm({ name: '', email: '', message: '' });
        return;
      }
      const data = await postForm(base, form);
      console.log('form created', data);
      setForm({ name: '', email: '', message: '' });
      setQueuedCount(readQueue().length);
    } catch (err) {
      queueForm(form);
      setForm({ name: '', email: '', message: '' });
      console.error('submit error — queued', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#fff', padding: 24 }}>
      <div style={{ position: 'absolute', top: 18, right: 18, fontSize: 14, color: '#111', fontWeight: 600 }}>
        queued: {queuedCount}
      </div>
      {showOnline && (
        <div role="status" aria-live="polite" style={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          top: 18,
          background: '#16a34a',
          color: '#fff',
          padding: '10px 16px',
          borderRadius: 8,
          boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
          fontSize: 14,
          zIndex: 1000,
        }}>
          Back online
        </div>
      )}
      <form onSubmit={submit} style={{ width: 420, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input name="name" value={form.name} onChange={change} placeholder="Name" style={{ padding: 10, fontSize: 16, border: '1px solid #333', borderRadius: 6, color: '#111' }} />
        <input name="email" value={form.email} onChange={change} placeholder="Email" style={{ padding: 10, fontSize: 16, border: '1px solid #333', borderRadius: 6, color: '#111' }} />
        <textarea name="message" value={form.message} onChange={change} rows={6} placeholder="Message" style={{ padding: 10, fontSize: 16, border: '1px solid #333', borderRadius: 6, color: '#111' }} />
        <button type="submit" disabled={loading} style={{ padding: 10, fontSize: 16, border: 'none', borderRadius: 6, cursor: 'pointer', background: '#000', color: '#fff' }}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {showStored && (
        <div role="status" aria-live="polite" style={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 36,
          background: '#111',
          color: '#fff',
          padding: '10px 16px',
          borderRadius: 8,
          boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
          fontSize: 14,
        }}>
          Message Stored
        </div>
      )}
    </div>
  );
}
