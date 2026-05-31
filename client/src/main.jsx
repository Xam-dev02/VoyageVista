import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

import Home from './pages/Home';
import Auth from './pages/Auth';
import Catalogue from './pages/Catalogue';
import DestinationDetail from './pages/DestinationDetail';
import Hebergements from './pages/Hebergements';
import Activites from './pages/Activites';
import Transports from './pages/Transports';
import Itineraire from './pages/Itineraire';
import Panier from './pages/Panier';
import Profil from './pages/Profil';
import Notifications from './pages/Notifications';
import Favoris from './pages/Favoris';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardPrestataire from './pages/DashboardPrestataire';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<App />}>
            <Route path="/" element={<Home />} />
            <Route path="/connexion" element={<Auth />} />
            <Route path="/destinations" element={<Catalogue />} />
            <Route path="/destinations/:id" element={<DestinationDetail />} />
            <Route path="/hebergements" element={<Hebergements />} />
            <Route path="/activites" element={<Activites />} />
            <Route path="/transports" element={<Transports />} />
            <Route path="/itineraire" element={<ProtectedRoute roles={['voyageur','admin']}><Itineraire /></ProtectedRoute>} />
            <Route path="/panier" element={<ProtectedRoute><Panier /></ProtectedRoute>} />
            <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/favoris" element={<ProtectedRoute><Favoris /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardAdmin /></ProtectedRoute>} />
            <Route path="/prestataire" element={<ProtectedRoute roles={['prestataire','admin']}><DashboardPrestataire /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
