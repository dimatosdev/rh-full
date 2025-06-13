import React, { useEffect, useRef, useState } from 'react';
import { BsZoomIn } from "react-icons/bs";
import { BsZoomOut } from "react-icons/bs";
import { BiRotateRight } from "react-icons/bi";
import { RiResetLeftLine } from "react-icons/ri";
import { MdOutlineClose } from "react-icons/md";
import { FaCrosshairs } from "react-icons/fa";
import { FaRuler } from "react-icons/fa";


const DicomViewer = ({ image, onClose }) => {
    const elementRef = useRef();
    const overlayCanvasRef = useRef();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageLoaded, setImageLoaded] = useState(false);
    const [cornerstoneReady, setCornerstoneReady] = useState(false);
    const [rotating, setRotating] = useState(false);
    const [showCrosshair, setShowCrosshair] = useState(true);
    const [showRuler, setShowRuler] = useState(true);
    const [viewport, setViewport] = useState({
        scale: 1,
        windowWidth: 0,
        windowCenter: 0,
        rotation: 0
    });
    const [tools, setTools] = useState({
        currentTool: 'Wwwc'
    });

    useEffect(() => {
        const handleCornerstoneReady = () => {
            setCornerstoneReady(true);
        };

        if (window.cornerstoneReady) {
            setCornerstoneReady(true);
        } else {
            window.addEventListener('cornerstoneReady', handleCornerstoneReady);
            return () => window.removeEventListener('cornerstoneReady', handleCornerstoneReady);
        }
    }, []);

    useEffect(() => {
        if (!imageLoaded) return;
        drawOverlay();
        window.addEventListener('resize', drawOverlay);
        return () => window.removeEventListener('resize', drawOverlay);
    }, [imageLoaded, viewport, showCrosshair, showRuler]);

    useEffect(() => {
        if (!rotating || !elementRef.current) return;

        let startX = null;
        let startRotation = null;

        const handleMouseDown = (e) => {
            startX = e.clientX;
            const viewport = window.cornerstone.getViewport(elementRef.current);
            startRotation = viewport.rotation || 0;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };

        const handleMouseMove = (e) => {
            if (startX === null) return;
            const deltaX = e.clientX - startX;
            // Cada 2px move 1 grau
            let newRotation = (startRotation + deltaX / 2) % 360;
            if (newRotation < 0) newRotation += 360;
            const viewport = window.cornerstone.getViewport(elementRef.current);
            viewport.rotation = newRotation;
            window.cornerstone.setViewport(elementRef.current, viewport);
        };

        const handleMouseUp = () => {
            startX = null;
            startRotation = null;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setRotating(false);
        };

        const el = elementRef.current;
        el.addEventListener('mousedown', handleMouseDown);

        return () => {
            el.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [rotating, imageLoaded]);


    useEffect(() => {
        if (cornerstoneReady && elementRef.current) {
            setupElement();
            if (image) {
                loadDicomImage();
            }
            const element = elementRef.current;
            element.addEventListener('cornerstoneimagerendered', drawOverlay);
            return () => {
                cleanup();
                element.removeEventListener('cornerstoneimagerendered', drawOverlay);
            };
        }
    }, [cornerstoneReady, image]);

    const setupElement = () => {
        if (!elementRef.current || !window.cornerstone) return;

        try {
            window.cornerstone.enable(elementRef.current);

            elementRef.current.addEventListener('cornerstoneimagerendered', onImageRendered);

        } catch (error) {
            console.error('Erro ao configurar elemento:', error);
        }
    };

    const onImageRendered = () => {
        if (!elementRef.current) return;

        try {
            const currentViewport = window.cornerstone.getViewport(elementRef.current);
            setViewport({
                scale: currentViewport.scale || 1,
                windowWidth: currentViewport.voi?.windowWidth || 0,
                windowCenter: currentViewport.voi?.windowCenter || 0,
                rotation: (currentViewport.rotation || 0) * 180 / Math.PI
            });
        } catch (error) {
            console.error('Erro ao atualizar viewport:', error);
        }
    };


    const loadDicomImage = async () => {
        if (!image || !elementRef.current || !window.cornerstone) return;

        setLoading(true);
        setError('');
        setImageLoaded(false);

        try {
            // URL da imagem DICOM
            const imageUrl = `/storage/${image.file_path}`;
            const imageId = `wadouri:${imageUrl}`;

            const loadedImage = await window.cornerstone.loadImage(imageId);

            // Obtenha o pixel spacing (em mm)
            const pixelSpacing = loadedImage.data.string('x00280030')?.split('\\').map(Number) || [1, 1];
            // pixelSpacing[0] = row spacing (mm), pixelSpacing[1] = column spacing (mm)
            const pixelSpacingX = pixelSpacing[1] || 1;
            const pixelSpacingY = pixelSpacing[0] || 1;

            elementRef.current._pixelSpacing = { x: pixelSpacingX, y: pixelSpacingY };

            await window.cornerstone.displayImage(elementRef.current, loadedImage);

            const defaultViewport = window.cornerstone.getDefaultViewportForImage(elementRef.current, loadedImage);
            window.cornerstone.setViewport(elementRef.current, defaultViewport);

            setupTools();

            setImageLoaded(true);

        } catch (error) {
            console.error('Erro ao carregar imagem DICOM:', error);
            setError('Erro ao carregar imagem DICOM. Verifique se o arquivo é válido.');
        } finally {
            setLoading(false);
        }
    };

    const setupTools = () => {
        if (!elementRef.current || !window.cornerstoneTools) return;

        try {
            const element = elementRef.current;

            window.cornerstoneTools.addTool(window.cornerstoneTools.WwwcTool);
            window.cornerstoneTools.addTool(window.cornerstoneTools.PanTool);
            window.cornerstoneTools.addTool(window.cornerstoneTools.ZoomTool);
            window.cornerstoneTools.addTool(window.cornerstoneTools.ZoomMouseWheelTool);

            window.cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 });
            window.cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 2 });
            window.cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 4 });
            window.cornerstoneTools.setToolActive('ZoomMouseWheel', {});

        } catch (error) {
            console.error('Erro ao configurar ferramentas:', error);
        }
    };

    const drawOverlay = () => {
        const canvas = overlayCanvasRef.current;
        const element = elementRef.current;
        if (!canvas || !element) return;
        const width = element.clientWidth;
        const height = element.clientHeight;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        // Parâmetros das réguas
        const rulerMargin = 40;
        const rulerLengthCm = 20;
        const rulerStepCm = 1;
        const rulerLengthPx = 400; // Comprimento fixo em pixels para ambas as réguas

        // Centralizar as réguas
        const verticalRulerY = (height - rulerLengthPx) / 2;
        const horizontalRulerX = (width - rulerLengthPx) / 2;

        // Fundo das réguas
        if(showRuler){
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            // Vertical (esquerda, centralizada)
            ctx.fillRect(0, verticalRulerY, rulerMargin, rulerLengthPx);
            // Horizontal (inferior, centralizada)
            ctx.fillRect(horizontalRulerX, height - rulerMargin, rulerLengthPx, rulerMargin);

            // Estilo das réguas
            ctx.strokeStyle = 'yellow';
            ctx.fillStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.font = '14px Arial';

            // --- RÉGUA VERTICAL (esquerda, centralizada) ---
            for (let i = 0; i <= rulerLengthCm; i += rulerStepCm) {
                const y = verticalRulerY + (i / rulerLengthCm) * rulerLengthPx;
                ctx.beginPath();
                ctx.moveTo(rulerMargin - 15, y);
                ctx.lineTo(rulerMargin - 5, y);
                ctx.stroke();
            }
            // Escreve "20cm" no final da régua vertical
            ctx.save();
            ctx.font = 'bold 14px Arial';
            ctx.fillText('20cm', 2, verticalRulerY + rulerLengthPx - 5);
            ctx.restore();

            // --- RÉGUA HORIZONTAL (inferior, centralizada) ---
            for (let i = 0; i <= rulerLengthCm; i += rulerStepCm) {
                const x = horizontalRulerX + (i / rulerLengthCm) * rulerLengthPx;
                ctx.beginPath();
                ctx.moveTo(x, height - rulerMargin + 5);
                ctx.lineTo(x, height - rulerMargin + 15);
                ctx.stroke();
            }
            // Escreve "20cm" no final da régua horizontal
            ctx.save();
            ctx.font = 'bold 14px Arial';
            ctx.fillText('20cm', horizontalRulerX + rulerLengthPx - 35, height - 10);
            ctx.restore();
        }

        if(showCrosshair){
            // --- CROSSHAIR CENTRAL FIXO ---
            const centerX = width / 2;
            const centerY = height / 2;
            ctx.strokeStyle = 'lime';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX, rulerMargin);
            ctx.lineTo(centerX, height - rulerMargin);
            ctx.moveTo(rulerMargin, centerY);
            ctx.lineTo(width - rulerMargin, centerY);
            ctx.stroke();

            // --- MARCAÇÕES VERMELHAS DE 5 EM 5 CM NO CROSSHAIR ---
            ctx.save();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3;
            const marks = 4; // 3 marcações de 5cm (5, 10, 15, 20)
            const markSpacingPx = rulerLengthPx / marks;
            const markSize = 16; // tamanho da marcação em pixels

            // Horizontal (em cima do crosshair central)
            for (let i = 1; i <= marks; i++) {
                const offset = i * markSpacingPx;
                // Direita
                ctx.beginPath();
                ctx.moveTo(centerX + offset, centerY - markSize / 2);
                ctx.lineTo(centerX + offset, centerY + markSize / 2);
                ctx.stroke();
                // Esquerda
                ctx.beginPath();
                ctx.moveTo(centerX - offset, centerY - markSize / 2);
                ctx.lineTo(centerX - offset, centerY + markSize / 2);
                ctx.stroke();
            }
            // Vertical (em cima do crosshair central)
            for (let i = 1; i <= marks; i++) {
                const offset = i * markSpacingPx;
                // Para baixo
                ctx.beginPath();
                ctx.moveTo(centerX - markSize / 2, centerY + offset);
                ctx.lineTo(centerX + markSize / 2, centerY + offset);
                ctx.stroke();
                // Para cima
                ctx.beginPath();
                ctx.moveTo(centerX - markSize / 2, centerY - offset);
                ctx.lineTo(centerX + markSize / 2, centerY - offset);
                ctx.stroke();
            }
            ctx.restore();
        }
    };

    const handleReset = () => {
        if (!elementRef.current || !imageLoaded) return;
        try {
            window.cornerstone.reset(elementRef.current);
            setTools({ currentTool: 'Wwwc' });
            setupTools();
        } catch (error) {
            console.log('Erro durante reset:', error);
        }
    };


    const handleZoom = (factor) => {
        if (!elementRef.current || !imageLoaded) return;
        try {
            const currentViewport = window.cornerstone.getViewport(elementRef.current);
            currentViewport.scale *= factor;
            currentViewport.scale = Math.max(0.1, Math.min(10, currentViewport.scale));
            window.cornerstone.setViewport(elementRef.current, currentViewport);
        } catch (error) {
            console.log('Erro durante zoom:', error);
        }
    };

    const cleanup = () => {
        try {
            if (elementRef.current) {
                elementRef.current.removeEventListener('cornerstoneimagerendered', onImageRendered);

                if (window.cornerstoneTools) {
                    window.cornerstoneTools.clearToolState(elementRef.current, 'stack');
                }

                window.cornerstone.disable(elementRef.current);
            }
        } catch (error) {
            console.log('Erro durante cleanup:', error);
        }
    };

    if (!cornerstoneReady) {
        return (
            <div className="dicom-viewer-container">
                <div className="card">
                    <div className="card-body text-center p-4">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                        <p className="mt-2">Inicializando Cornerstone...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dicom-viewer-container">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3>DICOM Viewer - {image?.name}</h3>
                    <div>
                        <div className="btn-group me-2" role="group">
                            <button
                                className={`btn btn-outline-secondary btn-sm${showCrosshair ? ' active' : ''}`}
                                onClick={() => setShowCrosshair((v) => !v)}
                                title={showCrosshair ? "Ocultar crosshair" : "Mostrar crosshair"}
                            >
                                <FaCrosshairs /> Crosshair
                            </button>
                            <button
                                className={`btn btn-outline-secondary btn-sm${showRuler ? ' active' : ''}`}
                                onClick={() => setShowRuler((v) => !v)}
                                title={showRuler ? "Ocultar régua" : "Mostrar régua"}
                            >
                                <FaRuler /> Régua
                            </button>
                            <button
                                className={`btn btn-outline-secondary btn-sm btn-rotate${rotating ? ' active' : ''}`}
                                onClick={() => setRotating(!rotating)}
                                title="Modo Rotacionar"
                            >
                            <BiRotateRight /> Rotacionar
                            </button>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleZoom(1.25)}
                                disabled={loading || !imageLoaded}
                                title="Zoom In"
                            >
                                <BsZoomIn />
                            </button>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleZoom(0.8)}
                                disabled={loading || !imageLoaded}
                                title="Zoom Out"
                            >
                                <BsZoomOut />
                            </button>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={handleReset}
                                disabled={loading || !imageLoaded}
                                title="Resetar"
                            >
                                <RiResetLeftLine /> Reset
                            </button>
                        </div>
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={onClose}
                        >
                            <MdOutlineClose /> Fechar
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

                    <div className="position-relative" style={{ width: '100%', height: '800px' }}>
                        <div
                            ref={elementRef}
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#000',
                                border: '1px solid #ccc',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                color: 'white'
                            }}
                            className={`${loading ? 'd-none' : ''} ${rotating ? 'dicom-rotate-cursor' : ''}`}
                        >
                            {/* Canvas do Cornerstone */}
                        </div>
                        {/* Canvas overlay fixo para régua/crosshair */}
                        <canvas
                            ref={overlayCanvasRef}
                            style={{
                                pointerEvents: 'none',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: 10
                            }}
                        />
                        {imageLoaded && (
                            <>
                                <div className="position-absolute bottom-0 start-0 p-2 text-white small bg-dark bg-opacity-75">
                                    <div>Zoom: {(viewport.scale * 100).toFixed(0)}%</div>
                                    <div>Rotação: {viewport.rotation.toFixed(0)}°</div>
                                    <div>Ferramenta: {tools.currentTool}</div>
                                </div>
                                <div className="position-absolute bottom-0 end-0 p-2 text-white small bg-dark bg-opacity-75">
                                    <div>WW/WC: {viewport.windowWidth.toFixed(0)} / {viewport.windowCenter.toFixed(0)}</div>
                                </div>
                                <div className="position-absolute top-0 start-0 p-2 text-white small bg-dark bg-opacity-50">
                                    <div><strong>Controles do Mouse:</strong></div>
                                    <div>• Botão Esquerdo: Window/Level</div>
                                    <div>• Botão Direito: Translate</div>
                                    <div>• Botão Meio: Pan</div>
                                    <div>• Scroll: Zoom</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DicomViewer;
