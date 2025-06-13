import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import DicomApp from './components/DicomApp';

// Configurar axios
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

// Renderizar app
const container = document.getElementById('dicom-app');
if (container) {
    const root = createRoot(container);
    root.render(<DicomApp />);
}
