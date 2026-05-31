import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Loader, euros } from '../components/ui';
import './Panier.css';

export default function Panier() {
  const [voyage, setVoyage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paiement, setPaiement] = useState({ titulaire: '', numero: '', expiration: '', cvv: '' });
  const [paying, setPaying] = useState(false);
  const [reservation, setReservation] = useState(null);

  const load = useCallback(async () => {
    try {
      const d = await api.get('/voyages/panier');
      setVoyage(d.voyage);
    } catch (e) { setError(e.message || 'Erreur de chargement.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function upd(k, v) { setPaiement(p => ({ ...p, [k]: v })); }

  async function retirerEtape(id) { await api.del(`/voyages/etapes/${id}`); load(); }
  async function retirerActivite(id) { await api.del(`/voyages/activites/${id}`); load(); }

  async function payer(e) {
    e.preventDefault();
    setPaying(true); setError('');
    try {
      const d = await api.post('/reservations', {
        id_voyage: voyage.id_voyage,
        methode_paiement: 'carte',
        infos_paiement: paiement,
      });
      setReservation(d.reservation);
    } catch (e2) {
      setError(e2.message || 'Le paiement a échoué.');
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <div className="page"><Loader /></div>;

  if (reservation) {
    return (
      <div className="panier-page page">
        <div className="container section">
          <div className="card-dark panier-confirm">
            <div className="panier-confirm__check">✓</div>
            <h1 className="display-md">Réservation confirmée !</h1>
            <p className="mt-8">Votre référence : <strong>{reservation.reference}</strong></p>
            <p className="muted mt-8" style={{ color: '#bbb' }}>Montant : {euros(reservation.montant_total)}</p>
            <Link to="/profil" className="btn btn--lime mt-24">Voir mes réservations</Link>
          </div>
        </div>
      </div>
    );
  }

  const etapes = voyage?.etapes || [];
  const vide = etapes.length === 0;

  return (
    <div className="panier-page page">
      <div className="container section">
        <h1 className="display-xl panier-title">MON PANIER</h1>

        {vide ? (
          <div className="card panier-empty">
            <p>Votre panier est vide.</p>
            <Link to="/destinations" className="btn btn--dark mt-16">Explorer les destinations</Link>
          </div>
        ) : (
          <div className="panier-layout">
            {/* Récapitulatif */}
            <div className="card-dark panier-recap">
              <h3 className="mb-16">Récapitulatif — {voyage.titre}</h3>
              {etapes.map(et => (
                <div key={et.id_etape} className="panier-etape">
                  <div className="flex-between">
                    <strong>{et.destination?.nom}</strong>
                    <button className="pill pill--sm pill--ghost" onClick={() => retirerEtape(et.id_etape)}>Retirer</button>
                  </div>
                  <ul className="panier-items">
                    {et.transport && <li><span>{et.transport.compagnie}</span><span>{euros(et.transport.prix)}</span></li>}
                    {et.hebergement && <li><span>{et.hebergement.nom} ({et.nuits || 1} nuit(s))</span><span>{euros(et.hebergement.prix_nuit * (et.nuits || 1))}</span></li>}
                    {(et.activites || []).map(a => (
                      <li key={a.id_etape_activite}>
                        <span>{a.nom} ({a.nb_personnes} pers.)
                          <button className="panier-x" onClick={() => retirerActivite(a.id_etape_activite)}>×</button>
                        </span>
                        <span>{euros(a.prix_calcule)}</span>
                      </li>
                    ))}
                    {!et.transport && !et.hebergement && (et.activites || []).length === 0 && (
                      <li className="muted" style={{ color: '#999' }}>Aucune prestation pour cette étape.</li>
                    )}
                  </ul>
                </div>
              ))}
              <hr className="divider" />
              <div className="flex-between panier-total">
                <span>Total</span>
                <span>{euros(voyage.prix_total)}</span>
              </div>
            </div>

            {/* Paiement */}
            <form className="card panier-pay" onSubmit={payer}>
              <h3 className="mb-16">Paiement (simulation)</h3>
              <div className="field"><label>Titulaire de la carte</label>
                <input className="input" value={paiement.titulaire} onChange={e => upd('titulaire', e.target.value)} required /></div>
              <div className="field"><label>Numéro de carte</label>
                <input className="input" value={paiement.numero} onChange={e => upd('numero', e.target.value)} placeholder="4242 4242 4242 4242" required /></div>
              <div className="grid grid-2 gap-16">
                <div className="field"><label>Expiration</label>
                  <input className="input" value={paiement.expiration} onChange={e => upd('expiration', e.target.value)} placeholder="MM/AA" required /></div>
                <div className="field"><label>CVV</label>
                  <input className="input" value={paiement.cvv} onChange={e => upd('cvv', e.target.value)} placeholder="123" required /></div>
              </div>
              {error && <p className="panier-error">{error}</p>}
              <button className="btn btn--dark btn--block btn--lg mt-8" disabled={paying}>
                {paying ? 'Traitement…' : `Payer ${euros(voyage.prix_total)} (simulation)`}
              </button>
              <p className="panier-secure">Paiement 100% sécurisé (simulation)</p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
