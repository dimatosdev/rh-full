import React, { useState } from 'react';
import { FaTrash, FaEye, FaSync, FaFile, FaCalendar, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { GrStorage } from "react-icons/gr";

const DicomList = ({
    images,
    loadImages,
    handleViewImage,
    handleDeleteImage
}) => {
    const [editingId, setEditingId] = useState(null);
    const [newName, setNewName] = useState('');

    const handleEditClick = (image) => {
        setEditingId(image.id);
        setNewName(image.name);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewName('');
    };

    const handleSaveEdit = async (image) => {
        try {
            await axios.put(`/api/dicom-images/${image.id}`, { name: newName });
            setEditingId(null);
            setNewName('');
            loadImages();
        } catch (e) {
            alert('Erro ao atualizar nome');
        }
    };

    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h3>Imagens ({images.length})</h3>
                <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={loadImages}
                    title="Atualizar lista"
                >
                    <FaSync />
                </button>
            </div>
            <div className="card-body">
                {images.length === 0 ? (
                    <div className="text-center text-muted p-4">
                        <div className="mb-3">
                            <i className="fas fa-file-medical fa-3x"></i>
                        </div>
                        <p>Nenhuma imagem encontrada.</p>
                        <small>Faça upload de um arquivo .dcm</small>
                    </div>
                ) : (
                    <div className="list-group list-group-flush">
                        {images.map((image) => (
                            <div key={image.id} className="list-group-item">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                        {editingId === image.id ? (
                                            <div className="mb-1">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm d-inline w-auto"
                                                    value={newName}
                                                    onChange={e => setNewName(e.target.value)}
                                                    maxLength={255}
                                                />
                                                <button
                                                    className="btn btn-success btn-sm ms-2"
                                                    onClick={() => handleSaveEdit(image)}
                                                    title="Salvar"
                                                >
                                                    <FaCheck />
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm ms-1"
                                                    onClick={handleCancelEdit}
                                                    title="Cancelar"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="mb-1 text-muted small">
                                                <FaFile /> <strong>{image.name}</strong> <span className="text-secondary">({image.original_name})</span>
                                            </p>
                                        )}
                                        <small className="text-muted">
                                            <GrStorage /> {(image.file_size / 1024).toFixed(1)} KB
                                            {image.description && (
                                                <>
                                                    <br />
                                                    <strong>Descrição:</strong> {image.description}
                                                </>
                                            )}
                                            <br />
                                            <FaCalendar /> {new Date(image.created_at).toLocaleString('pt-BR')}
                                        </small>
                                    </div>
                                    <div className="btn-group btn-group-sm ms-2">
                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => handleViewImage(image)}
                                            title="Visualizar imagem DICOM"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => handleEditClick(image)}
                                            title="Editar nome"
                                            disabled={editingId === image.id}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleDeleteImage(image.id)}
                                            title="Deletar imagem"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DicomList;
