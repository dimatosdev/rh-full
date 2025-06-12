import React, { useState } from 'react';

const DicomInstructions = () => {
    const [showInstructions, setShowInstructions] = useState(false);

    return (
        <>
            <button
                className="btn btn-outline-info btn-sm"
                onClick={() => setShowInstructions(true)}
                title="Como usar o visualizador"
            >
                <i className="fas fa-question-circle me-1"></i>
                Ajuda
            </button>

            {showInstructions && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Como usar o Visualizador DICOM
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowInstructions(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-12">
                                        <h6><i className="fas fa-mouse me-2"></i>Controles do Mouse:</h6>
                                        <ul className="list-unstyled ms-3">
                                            <li><strong>Arrastar:</strong> Ajustar Window/Level (brilho/contraste)</li>
                                            <li><strong>Scroll:</strong> Zoom in/out</li>
                                            <li><strong>Mover mouse:</strong> Mostrar crosshair (se ativado)</li>
                                        </ul>
                                    </div>
                                </div>

                                <hr />

                                <div className="row">
                                    <div className="col-12">
                                        <h6><i className="fas fa-tools me-2"></i>Ferramentas:</h6>
                                        <div className="row">
                                            <div className="col-6">
                                                <ul className="list-unstyled">
                                                    <li><i className="fas fa-search-plus text-primary"></i> <strong>Zoom In</strong></li>
                                                    <li><i className="fas fa-search-minus text-primary"></i> <strong>Zoom Out</strong></li>
                                                </ul>
                                            </div>
                                            <div className="col-6">
                                                <ul className="list-unstyled">
                                                    <li><i className="fas fa-crosshairs text-success"></i> <strong>Crosshair</strong></li>
                                                    <li><i className="fas fa-undo text-primary"></i> <strong>Reset</strong></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                <div className="row">
                                    <div className="col-12">
                                        <h6><i className="fas fa-info me-2"></i>Informações:</h6>
                                        <ul className="list-unstyled ms-3">
                                            <li><strong>Zoom:</strong> Nível de ampliação atual</li>
                                            <li><strong>W/L:</strong> Window Width / Window Level</li>
                                            <li><strong>X/Y:</strong> Coordenadas do mouse (quando crosshair ativo)</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="alert alert-info">
                                    <i className="fas fa-lightbulb me-2"></i>
                                    <strong>Dica:</strong> Use o botão direito do mouse para diferentes funções em versões futuras!
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setShowInstructions(false)}
                                >
                                    Entendi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DicomInstructions;
