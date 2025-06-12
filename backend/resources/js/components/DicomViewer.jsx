import React, { useEffect, useRef, useState } from 'react';
import DicomInstructions from './DicomInstructions';


const DicomViewer = ({ image, onClose }) => {
    const elementRef = useRef();
    const crosshairRef = useRef();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageLoaded, setImageLoaded] = useState(false);
    const [viewport, setViewport] = useState(null);
    const [showCrosshair, setShowCrosshair] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (elementRef.current && image) {
            initializeViewer();
        }

        return () => {
            cleanup();
        };
    }, [image]);

    const initializeViewer = async () => {
        // Aguardar Cornerstone estar pronto
        let attempts = 0;
        while (!window.cornerstoneReady && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!window.cornerstoneReady) {
            setError('Timeout: Cornerstone não inicializou');
            return;
        }

        try {
            // Habilitar cornerstone no elemento
            window.cornerstone.enable(elementRef.current);

            // Adicionar event listeners
            setupInteractions();

            // Carregar imagem
            await loadDicomImage();

        } catch (err) {
            console.error('Erro ao inicializar viewer:', err);
            setError(`Erro ao inicializar: ${err.message}`);
        }
    };

    const setupInteractions = () => {
        if (!elementRef.current) return;

        const element = elementRef.current;

        // Mouse wheel para zoom
        element.addEventListener('wheel', handleWheel);

        // Mouse events para window/level e crosshair
        element.addEventListener('mousedown', handleMouseDown);
        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseup', handleMouseUp);
        element.addEventListener('mouseleave', handleMouseLeave);
        element.addEventListener('mouseenter', handleMouseEnter);
    };

    const handleWheel = (e) => {
        if (!imageLoaded) return;

        e.preventDefault();
        const viewport = window.cornerstone.getViewport(elementRef.current);
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        viewport.scale *= scaleFactor;
        window.cornerstone.setViewport(elementRef.current, viewport);
        setViewport({...viewport});
    };

    let isDragging = false;
    let lastX, lastY;

    const handleMouseDown = (e) => {
        if (!imageLoaded) return;
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        elementRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
        if (!imageLoaded) return;

        // Atualizar posição do crosshair
        const rect = elementRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });

        // Window/Level adjustment durante drag
        if (isDragging) {
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            const viewport = window.cornerstone.getViewport(elementRef.current);
            viewport.voi.windowWidth += deltaX * 4;
            viewport.voi.windowCenter += deltaY * 4;

            window.cornerstone.setViewport(elementRef.current, viewport);
            setViewport({...viewport});

            lastX = e.clientX;
            lastY = e.clientY;
        }
    };

    const handleMouseUp = () => {
        isDragging = false;
        if (elementRef.current) {
            elementRef.current.style.cursor = showCrosshair ? 'none' : 'crosshair';
        }
    };

    const handleMouseLeave = () => {
        isDragging = false;
        setShowCrosshair(false);
    };

    const handleMouseEnter = () => {
        if (imageLoaded) {
            setShowCrosshair(true);
        }
    };

    const loadDicomImage = async () => {
        if (!image || !elementRef.current) return;

        setLoading(true);
        setError('');
        setImageLoaded(false);

        try {
            const imageUrl = `/storage/${image.file_path}`;
            console.log('Carregando imagem DICOM:', imageUrl);

            // Verificar se arquivo existe
            const response = await fetch(imageUrl, { method: 'HEAD' });
            if (!response.ok) {
                throw new Error(`Arquivo não encontrado (${response.status})`);
            }

            // Carregar com Cornerstone
            const imageId = `wadouri:${imageUrl}`;
            console.log('ImageId:', imageId);

            const loadedImage = await window.cornerstone.loadImage(imageId);
            console.log('Imagem carregada:', loadedImage);

            // Exibir imagem
            await window.cornerstone.displayImage(elementRef.current, loadedImage);

            // Configurar viewport inicial
            const initialViewport = window.cornerstone.getDefaultViewportForImage(elementRef.current, loadedImage);
            window.cornerstone.setViewport(elementRef.current, initialViewport);
            setViewport(initialViewport);

            setImageLoaded(true);
            console.log('✅ Imagem DICOM exibida com sucesso!');

        } catch (error) {
            console.error('❌ Erro ao carregar DICOM:', error);
            setError(`Erro: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const cleanup = () => {
        try {
            if (elementRef.current && window.cornerstone) {
                const element = elementRef.current;
                element.removeEventListener('wheel', handleWheel);
                element.removeEventListener('mousedown', handleMouseDown);
                element.removeEventListener('mousemove', handleMouseMove);
                element.removeEventListener('mouseup', handleMouseUp);
                element.removeEventListener('mouseleave', handleMouseLeave);
                element.removeEventListener('mouseenter', handleMouseEnter);

                window.cornerstone.disable(element);
            }
        } catch (e) {
            console.log('Cleanup realizado');
        }
    };

    const handleReset = () => {
        if (!elementRef.current || !imageLoaded) return;

        try {
            const element = elementRef.current;
            const enabledElement = window.cornerstone.getEnabledElement(element);
            const defaultViewport = window.cornerstone.getDefaultViewportForImage(element, enabledElement.image);
            window.cornerstone.setViewport(element, defaultViewport);
            setViewport(defaultViewport);
        } catch (error) {
            console.error('Erro ao resetar:', error);
        }
    };

    const handleZoom = (factor) => {
        if (!elementRef.current || !imageLoaded) return;

        try {
            const viewport = window.cornerstone.getViewport(elementRef.current);
            viewport.scale *= factor;
            window.cornerstone.setViewport(elementRef.current, viewport);
            setViewport({...viewport});
        } catch (error) {
            console.error('Erro no zoom:', error);
        }
    };

    const toggleCrosshair = () => {
        setShowCrosshair(!showCrosshair);
        if (elementRef.current) {
            elementRef.current.style.cursor = !showCrosshair ? 'none' : 'crosshair';
        }
    };

    const handleDownload = () => {
        if (image) {
            const link = document.createElement('a');
            link.href = `/storage/${image.file_path}`;
            link.download = image.name + '.dcm';
            link.click();
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fas fa-eye me-2"></i>
                            {image?.name || 'Visualizador DICOM'}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-0" style={{ position: 'relative' }}>
                        {loading && (
                            <div className="text-center p-4">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                </div>
                                <p className="mt-2">Carregando imagem DICOM...</p>
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-danger m-3">
                                <h6><i className="fas fa-exclamation-triangle me-2"></i>Erro</h6>
                                <p>{error}</p>
                                <div className="mt-3">
                                    <button className="btn btn-primary me-2" onClick={loadDicomImage}>
                                        <i className="fas fa-redo me-1"></i>Tentar Novamente
                                    </button>
                                    <button className="btn btn-secondary" onClick={handleDownload}>
                                        <i className="fas fa-download me-1"></i>Baixar Arquivo
                                    </button>
                                </div>
                            </div>
                        )}

                        {!loading && !error && (
                            <>
                                <div
                                    ref={elementRef}
                                    style={{
                                        width: '100%',
                                        height: '600px',
                                        backgroundColor: '#000',
                                        cursor: showCrosshair ? 'none' : 'crosshair',
                                        position: 'relative'
                                    }}
                                    className="dicom-viewer-element"
                                />

                                {/* Crosshair Customizado */}
                                {showCrosshair && imageLoaded && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '600px',
                                            pointerEvents: 'none',
                                            zIndex: 10
                                        }}
                                    >
                                        {/* Linha Horizontal */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: `${mousePosition.y}px`,
                                                left: 0,
                                                width: '100%',
                                                height: '1px',
                                                backgroundColor: '#00ff00',
                                                boxShadow: '0 0 2px rgba(0,255,0,0.8)'
                                            }}
                                        />
                                        {/* Linha Vertical */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: `${mousePosition.x}px`,
                                                width: '1px',
                                                height: '100%',
                                                backgroundColor: '#00ff00',
                                                boxShadow: '0 0 2px rgba(0,255,0,0.8)'
                                            }}
                                        />
                                        {/* Centro do crosshair */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: `${mousePosition.y - 2}px`,
                                                left: `${mousePosition.x - 2}px`,
                                                width: '4px',
                                                height: '4px',
                                                backgroundColor: '#00ff00',
                                                borderRadius: '50%',
                                                boxShadow: '0 0 4px rgba(0,255,0,1)'
                                            }}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {imageLoaded && (
                        <div className="modal-footer">
                            <div className="btn-group me-auto">
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleZoom(1.2)}
                                    title="Zoom In"
                                >
                                    <i className="fas fa-search-plus"></i>
                                </button>
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleZoom(0.8)}
                                    title="Zoom Out"
                                >
                                    <i className="fas fa-search-minus"></i>
                                </button>
                                <button
                                    className={`btn btn-sm ${showCrosshair ? 'btn-success' : 'btn-outline-primary'}`}
                                    onClick={toggleCrosshair}
                                    title="Toggle Crosshair"
                                >
                                    <i className="fas fa-crosshairs"></i>
                                </button>
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={handleReset}
                                    title="Reset"
                                >
                                    <i className="fas fa-undo"></i>
                                </button>
                            </div>

                            {viewport && (
                                <small className="text-muted me-3">
                                    Zoom: {(viewport.scale * 100).toFixed(0)}% |
                                    W/L: {Math.round(viewport.voi?.windowWidth || 0)}/{Math.round(viewport.voi?.windowCenter || 0)}
                                    {showCrosshair && ` | X: ${Math.round(mousePosition.x)} Y: ${Math.round(mousePosition.y)}`}
                                </small>
                            )}

                            <button className="btn btn-secondary me-2" onClick={handleDownload}>
                                <i className="fas fa-download me-1"></i>Download
                            </button>
                            <button className="btn btn-primary" onClick={onClose}>
                                Fechar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DicomViewer;
