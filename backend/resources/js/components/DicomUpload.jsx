import React, { useState } from 'react';
import axios from 'axios';

const DicomUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileName = selectedFile.name.toLowerCase();
            if (!fileName.endsWith('.dcm') && !fileName.endsWith('.dicom')) {
                setError('Por favor, selecione apenas arquivos DICOM (.dcm)');
                return;
            }
            setFile(selectedFile);
            setName(selectedFile.name.replace(/\.(dcm|dicom)$/i, ''));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file || !name) {
            setError('Por favor, selecione um arquivo e digite um nome');
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);
        formData.append('description', description);
        formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

        try {
            const response = await axios.post('/api/dicom-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setFile(null);
            setName('');
            setDescription('');
            document.getElementById('fileInput').value = '';

            if (onUploadSuccess) {
                onUploadSuccess(response.data);
            }

            alert('Imagem DICOM enviada com sucesso!');
        } catch (error) {
            console.error('Erro no upload:', error);
            setError(error.response?.data?.error || 'Erro ao enviar arquivo');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3>Upload de Imagem DICOM</h3>
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="fileInput" className="form-label">
                            Arquivo DICOM (.dcm)
                        </label>
                        <input
                            type="file"
                            className="form-control"
                            id="fileInput"
                            accept=".dcm,.dicom"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                            Nome da Imagem
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={uploading}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">
                            Descrição (opcional)
                        </label>
                        <textarea
                            className="form-control"
                            id="description"
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={uploading}
                        />
                    </div>

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={uploading || !file}
                    >
                        {uploading ? 'Enviando...' : 'Enviar Imagem DICOM'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DicomUpload;
