import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Converts a CamelCase slug into a spaced name.
 * e.g. "JorgeLinharesDeCarvalho" → "Jorge Linhares De Carvalho"
 */
function parseName(slug: string): string {
  return slug.replace(/([A-Z])/g, ' $1').trim();
}

interface Props {
  onClose: () => void;
}

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

function ConfirmationForm({ onClose }: Props) {
  const [names, setNames] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('convidados') ?? '';
    if (!raw.trim()) {
      setNames(['']);
      return;
    }

    const parsed = raw.split('-').map(parseName);
    setNames(parsed);
    setLoading(true);

    axios
      .get<{ alreadyConfirmed: string[]; notConfirmed: string[] }>(
        `${API}/rsvp/check?names=${encodeURIComponent(parsed.join(','))}`
      )
      .then(({ data }) => {
        if (data.notConfirmed.length === 0) {
          setAlreadyConfirmed(true);
        }
        // else: show the form pre-filled — user must click Confirmar
      })
      .catch(() => {
        // silently ignore check errors; user can still submit manually
      })
      .finally(() => setLoading(false));
  }, []);

  const updateName = (i: number, val: string) => {
    setNames(prev => prev.map((n, idx) => (idx === i ? val : n)));
  };

  const addGuest = () => setNames(prev => [...prev, '']);
  const removeGuest = (i: number) => setNames(prev => prev.filter((_, idx) => idx !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validNames = names.map(n => n.trim()).filter(Boolean);
    if (!validNames.length) return;
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.get<{ alreadyConfirmed: string[]; notConfirmed: string[] }>(
        `${API}/rsvp/check?names=${encodeURIComponent(validNames.join(','))}`
      );
      if (data.notConfirmed.length === 0) {
        setAlreadyConfirmed(true);
      } else {
        await axios.post(`${API}/rsvp`, { names: data.notConfirmed, attending: true });
        setSubmitted(true);
      }
    } catch {
      setError('Erro ao confirmar presença. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {loading ? (
          <p className="modal-text">Confirmando presença...</p>
        ) : alreadyConfirmed ? (
          <>
            <h2 className="modal-title">Presença já confirmada!</h2>
            <p className="modal-text">Você já confirmou sua presença. Até lá! 🎉</p>
            <button className="btn-confirm" onClick={onClose}>Fechar</button>
          </>
        ) : submitted ? (
          <>
            <h2 className="modal-title">Presença Confirmada!</h2>
            <p className="modal-text">
              Mal podemos esperar para celebrar com você!
            </p>
            <button className="btn-confirm" onClick={onClose}>
              Fechar
            </button>
          </>
        ) : (
          <>
            <h2 className="modal-title">Confirmar Presença</h2>
            <p className="modal-text">Confirme seus dados abaixo</p>
            <form onSubmit={submit}>
              {names.map((name, i) => (
                <div key={i} className="name-row">
                  <input
                    className="name-input"
                    type="text"
                    value={name}
                    onChange={e => updateName(i, e.target.value)}
                    placeholder={`Nome do convidado ${i + 1}`}
                    required
                  />
                  {names.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeGuest(i)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addGuest}>
                + Adicionar convidado
              </button>
              {error && <p className="error-text">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm">
                  Confirmar
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ConfirmationForm;
