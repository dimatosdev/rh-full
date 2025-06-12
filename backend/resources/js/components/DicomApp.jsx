import React, { useState } from 'react';
import DicomViewer from './DicomViewer';

const DicomApp = () => {
    const [images, setImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showViewer, setShowViewer] = useState(false);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            alert('Selecione um arquivo DICOM');
            return;
        }

        setUploading(true);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('name', selectedFile.name.replace(/\.(dcm|dicom)$/i, ''));

        try {
            const response = await axios.post('/api/dicom-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Upload realizado com sucesso!');
            setSelectedFile(null);
            document.getElementById('fileInput').value = '';
            loadImages();
        } catch (error) {
            console.error('Erro no upload:', error);
            alert('Erro no upload: ' + (error.response?.data?.message || 'Erro desconhecido'));
        } finally {
            setUploading(false);
        }
    };

    const loadImages = async () => {
        try {
            const response = await axios.get('/api/dicom-images');
            setImages(response.data);
        } catch (error) {
            console.error('Erro ao carregar imagens:', error);
        }
    };

    const handleViewImage = (image) => {
        setSelectedImage(image);
        setShowViewer(true);
    };

    const handleCloseViewer = () => {
        setShowViewer(false);
        setSelectedImage(null);
    };

    const handleDeleteImage = async (imageId) => {
        if (!confirm('Tem certeza que deseja deletar esta imagem?')) {
            return;
        }

        try {
            await axios.delete(`/api/dicom-images/${imageId}`);
            alert('Imagem deletada com sucesso!');
            loadImages();
        } catch (error) {
            console.error('Erro ao deletar:', error);
            alert('Erro ao deletar imagem');
        }
    };

    React.useEffect(() => {
        loadImages();
    }, []);

    if (showViewer && selectedImage) {
        return (
            <div className="container-fluid mt-4">
                <DicomViewer
                    image={selectedImage}
                    onClose={handleCloseViewer}
                />
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <h1 className="text-center mb-4">Sistema DICOM Viewer</h1>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h3>📤 Upload DICOM</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleUpload}>
                                <div className="mb-3">
                                    <label htmlFor="fileInput" className="form-label">
                                        Arquivo DICOM (.dcm)
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="fileInput"
                                        accept=".dcm,.dicom"
                                        onChange={handleFileSelect}
                                        disabled={uploading}
                                    />
                                    {selectedFile && (
                                        <div className="form-text">
                                            Arquivo selecionado: <strong>{selectedFile.name}</strong>
                                            <br />
                                            Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={uploading || !selectedFile}
                                >
                                    {uploading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Enviando...
                                        </>
                                    ) : (
                                        '📤 Enviar Arquivo'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h3>📋 Imagens DICOM ({images.length})</h3>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={loadImages}
                                title="Atualizar lista"
                            >
                                🔄 Atualizar
                            </button>
                        </div>
                        <div className="card-body">
                            {images.length === 0 ? (
                                <div className="text-center text-muted p-4">
                                    <div className="mb-3">
                                        <i className="fas fa-file-medical fa-3x"></i>
                                    </div>
                                    <p>Nenhuma imagem DICOM encontrada.</p>
                                    <small>Faça upload de um arquivo .dcm para começar.</small>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {images.map((image) => (
                                        <div key={image.id} className="list-group-item">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1">{image.name}</h6>
                                                    <p className="mb-1 text-muted small">
                                                        <strong>Arquivo:</strong> {image.original_name}
                                                    </p>
                                                    <small className="text-muted">
                                                        <strong>Tamanho:</strong> {(image.file_size / 1024).toFixed(1)} KB
                                                        {image.description && (
                                                            <>
                                                                <br />
                                                                <strong>Descrição:</strong> {image.description}
                                                            </>
                                                        )}
                                                        <br />
                                                        <strong>Criado:</strong> {new Date(image.created_at).toLocaleString('pt-BR')}
                                                    </small>
                                                </div>
                                                <div className="btn-group-vertical btn-group-sm ms-2">
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleViewImage(image)}
                                                        title="Visualizar imagem DICOM"
                                                    >
                                                        👁️ Ver
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDeleteImage(image.id)}
                                                        title="Deletar imagem"
                                                    >
                                                        🗑️ Del
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Instruções de uso */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card bg-light">
                        <div className="card-body">
                            <h5>📖 Como usar o sistema:</h5>
                            <ol>
                                <li><strong>Upload:</strong> Selecione um arquivo DICOM (.dcm) e clique em "Enviar Arquivo"</li>
                                <li><strong>Visualizar:</strong> Clique no botão "👁️ Ver" para abrir o visualizador DICOM</li>
                                <li><strong>Ferramentas do Visualizador:</strong>
                                    <ul>
                                        <li><strong>Crosshair:</strong> Ativa régua com medidas de 5 em 5 cm</li>
                                        <li><strong>Rotacionar:</strong> Gira a imagem em 90°</li>
                                        <li><strong>Zoom:</strong> Aumenta/diminui o zoom da imagem</li>
                                        <li><strong>Reset:</strong> Volta às configurações iniciais</li>
                                    </ul>
                                </li>
                                <li><strong>Controles do Mouse:</strong>
                                    <ul>
                                        <li><strong>Botão Esquerdo:</strong> Ajustar brilho/contraste (Window/Level)</li>
                                        <li><strong>Botão Direito:</strong> Zoom</li>
                                        <li><strong>Botão do Meio:</strong> Mover imagem (Pan)</li>
                                    </ul>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DicomApp;
