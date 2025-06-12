import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DicomList = ({ refreshTrigger, onImageSelect }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchImages = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/dicom-images');
            setImages(response.data);
            setError('');
        } catch (error) {
            console.error('Erro ao carregar imagens:', error);
            setError('Erro ao carregar lista de imagens');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, [refreshTrigger]);

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja deletar esta imagem?')) {
            return;
        }

        try {
            await axios.delete(`/api/dicom-images/${id}`, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });
            setImages(images.filter(img => img.id !== id));
            alert('Imagem deletada com sucesso!');
        } catch (error) {
            console.error('Erro ao deletar:', error);
            alert('Erro ao deletar imagem');
        }
    };

    if (loading) {
        return <div className="text-center">Carregando imagens...</div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="card">
            <div className="card-header">
                <h3>Imagens DICOM ({images.length})</h3>
            </div>
            <div className="card-body">
                {images.length === 0 ? (
                    <p className="text-muted">Nenhuma imagem DICOM encontrada.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Arquivo Original</th>
                                    <th>Tamanho</th>
                                    <th>Data</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {images.map((image) => (
                                    <tr key={image.id}>
                                        <td>{image.name}</td>
                                        <td>{image.original_name}</td>
                                        <td>{(image.file_size / 1024).toFixed(1)} KB</td>
                                        <td>{new Date(image.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary me-2"
                                                onClick={() => onImageSelect(image)}
                                            >
                                                Visualizar
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(image.id)}
                                            >
                                                Deletar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DicomList;
