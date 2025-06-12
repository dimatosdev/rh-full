import React, { useEffect, useRef, useState } from 'react';

const DicomViewer = ({ image, onClose }) => {
    const elementRef = useRef();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageLoaded, setImageLoaded] = useState(false);
    const [tools, setTools] = useState({
        crosshair: false,
        rotation: 0,
        scale: 1
    });

    useEffect(() => {
        if (elementRef.current) {
            // Habilitar cornerstone no elemento
            window.cornerstone.enable(elementRef.current);

            if (image) {
                loadDicomImage();
            }

            return () => {
                // Cleanup
                try {
                    if (elementRef.current) {
                        window.cornerstone.disable(elementRef.current);
                    }
                } catch (e) {
                    console.log('Elemento já foi desabilitado');
                }
            };
        }
    }, [image]);

    const loadDicomImage = async () => {
        if (!image || !elementRef.current) return;

        setLoading(true);
        setError('');
        setImageLoaded(false);

        try {
            // URL da imagem DICOM
            const imageUrl = `/storage/${image.file_path}`;

            console.log('Carregando imagem:', imageUrl);

            // Carregar imagem usando WADO Image Loader
            const loadedImage = await window.cornerstone.loadImage(`wadouri:${imageUrl}`);

            // Exibir imagem
            await window.cornerstone.displayImage(elementRef.current, loadedImage);

            // Configurar viewport inicial
            const viewport = window.cornerstone.getDefaultViewportForImage(elementRef.current, loadedImage);
            window.cornerstone.setViewport(elementRef.current, viewport);

            setImageLoaded(true);
            setupTools();

            console.log('Imagem DICOM carregada com sucesso!');

        } catch (error) {
            console.error('Erro ao carregar imagem DICOM:', error);
            setError('Erro ao carregar imagem DICOM. Verifique se o arquivo é válido.');
        } finally {
            setLoading(false);
        }
    };

    const setupTools = () => {
        if (!elementRef.current) return;

        try {
            // Limpar ferramentas existentes
            window.cornerstoneTools.clearToolState(elementRef.current, 'Crosshairs');

            // Adicionar ferramentas
            const ZoomTool = window.cornerstoneTools.ZoomTool;
            const PanTool = window.cornerstoneTools.PanTool;
            const WwwcTool = window.cornerstoneTools.WwwcTool;
            const CrosshairsTool = window.cornerstoneTools.CrosshairsTool;

            window.cornerstoneTools.addTool(ZoomTool);
            window.cornerstoneTools.addTool(PanTool);
            window.cornerstoneTools.addTool(WwwcTool);
            window.cornerstoneTools.addTool(CrosshairsTool);

            // Configurar mouse bindings
            window.cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 }); // Botão esquerdo
            window.cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 2 }); // Botão direito
            window.cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 4 }); // Botão do meio

        } catch (error) {
            console.error('Erro ao configurar ferramentas:', error);
        }
    };

    const handleRotate = () => {
        if (!elementRef.current || !imageLoaded) return;

        try {
            const newRotation = (tools.rotation + 90) % 360;
            setTools(prev => ({ ...prev, rotation: newRotation }));

            const viewport = window.cornerstone.getViewport(elementRef.current);
            viewport.rotation = (newRotation * Math.PI) / 180;
            window.cornerstone.setViewport(elementRef.current, viewport);
        } catch (error) {
            console.error('Erro ao rotacionar:', error);
        }
    };

    const handleCrosshair = () => {
        if (!elementRef.current || !imageLoaded) return;

        try {
            const newCrosshair = !tools.crosshair;
            setTools(prev => ({ ...prev, crosshair: newCrosshair }));

            if (newCrosshair) {
                // Ativar crosshair
                window.cornerstoneTools.setToolActive('Crosshairs', { mouseButtonMask: 1 });
            } else {
                // Desativar crosshair e voltar para window/level
                window.cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 });
            }
        } catch (error) {
            console.error('Erro ao configurar crosshair:', error);
        }
    };

    const handleReset = () => {
        if (!elementRef.current || !imageLoaded) return;

        try {
            window.cornerstone.reset(elementRef.current);
            setTools({ crosshair: false, rotation: 0, scale: 1 });
            setupTools();
        } catch (error) {
            console.error('Erro ao resetar:', error);
        }
    };

    const handleZoom = (factor) => {
        if (!elementRef.current || !imageLoaded) return;

        try {
            const viewport = window.cornerstone.getViewport(elementRef.current);
            viewport.scale *= factor;
            viewport.scale = Math.max(0.1, Math.min(10, viewport.scale)); // Limitar zoom
            window.cornerstone.setViewport(elementRef.current, viewport);
            setTools(prev => ({ ...prev, scale: viewport.scale }));
        } catch (error) {
            console.error('Erro ao fazer zoom:', error);
        }
    };

    return (
        <div className="dicom-viewer-container">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3>Visualizador DICOM - {image?.name}</h3>
                    <div>
                        <div className="btn-group me-2" role="group">
                            <button
                                className={`btn btn-sm ${tools.crosshair ? 'btn-success' : 'btn-outline-secondary'}`}
                                onClick={handleCrosshair}
                                disabled={loading || !imageLoaded}
                                title="Crosshair com Régua"
                            >
                                ✚ Crosshair
                            </button>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={handleRotate}
                                disabled={loading || !imageLoaded}
                                title="Rotacionar 90°"
                            >
                                ↻ Rotacionar
                            </button>
                            <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleZoom(1.25)}
                                disabled={loading || !imageLoaded}
                                title="Zoom In"
                            >
                                🔍+
                            </button>
                            <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleZoom(0.8)}
                                disabled={loading || !imageLoaded}
                                title="Zoom Out"
                            >
                                🔍-
                            </button>
                            <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={handleReset}
                                disabled={loading || !imageLoaded}
                                title="Resetar"
                            >
                                🏠 Reset
                            </button>
                        </div>
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={onClose}
                        >
                            ✕ Fechar
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {loading && (
                        <div className="text-center p-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Carregando...</span>
                            </div>
                            <p className="mt-2">Carregando imagem DICOM...</p>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="position-relative">
                        <div
                            ref={elementRef}
                            style={{
                                width: '100%',
                                height: '600px',
                                backgroundColor: '#000',
                                border: '1px solid #ccc'
                            }}
                            className={loading ? 'd-none' : ''}
                        />

                        {imageLoaded && (
                            <div className="position-absolute top-0 start-0 p-2 text-white small bg-dark bg-opacity-75">
                                <div>Zoom: {(tools.scale * 100).toFixed(0)}%</div>
                                <div>Rotação: {tools.rotation}°</div>
                                <div className="mt-2">
                                    <small>
                                        <strong>Controles:</strong><br/>
                                        Botão Esquerdo: Window/Level<br/>
                                        Botão Direito: Zoom<br/>
                                        Botão Meio: Pan
                                    </small>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DicomViewer;
