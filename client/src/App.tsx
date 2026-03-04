import React, { useState } from 'react';
import ConfirmationForm from './components/ConfirmationForm';
import './index.css';

function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="page">
      {/* top — place background.jpg in client/public/ */}
      <section className="top">
        <div className="top-overlay">
          <h1 className="couple-names">
            Alandesson <span className="amp">e</span> Maria Clara
          </h1>
          <p className="invite-text">
            Convidam você para celebrar o nosso casamento
          </p>
        </div>
      </section>

      {/* Details */}
      <section className="details">
        <div className="detail-item">
          <span className="detail-label">Quando</span>
          <span className="detail-value">01 de Março de 2027</span>
        </div>
        <div className="divider" />
        <div className="detail-item">
          <span className="detail-label">Local</span>
          <span className="detail-value">Igreja Dom Bosco</span>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <button className="btn-confirm" onClick={() => setShowModal(true)}>
          Confirmar Presença
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <a
          href="https://maps.google.com/?q=Igreja+Dom+Bosco"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          📍 Ver localização no mapa
        </a>
      </footer>

      {showModal && <ConfirmationForm onClose={() => setShowModal(false)} />}
    </div>
  );
}

export default App;
