import React from 'react';

const DicomUpload = ({
    dragActive,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleUpload,
    handleFileSelect,
    uploading,
    selectedFile
}) => (
    <div
        className={`card dicom-drop-area${dragActive ? ' drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ cursor: 'pointer' }}
    >
        <div className="card-header">
            <h3>Upload</h3>
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
                        accept=".dcm"
                        onChange={handleFileSelect}
                        disabled={uploading}
                    />
                    <div className="form-text">
                        {dragActive
                            ? <span className="text-primary">Solte o arquivo .dcm aqui...</span>
                            : 'Arraste e solte um arquivo .dcm ou clique para selecionar.'}
                    </div>
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
                        'Enviar'
                    )}
                </button>
            </form>
        </div>
    </div>
);

export default DicomUpload;
