<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>DICOM Viewer</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">

    <script src="https://unpkg.com/dicom-parser@1.8.21/dist/dicomParser.min.js"></script>
    <script src="https://unpkg.com/cornerstone-core@2.6.1/dist/cornerstone.min.js"></script>
    <script src="https://unpkg.com/cornerstone-math@0.1.10/dist/cornerstoneMath.min.js"></script>
    <script src="https://unpkg.com/hammerjs@2.0.8/hammer.min.js"></script>
    <script src="https://unpkg.com/cornerstone-tools@4.21.1/dist/cornerstoneTools.min.js"></script>
    <script src="https://unpkg.com/cornerstone-web-image-loader@2.1.1/dist/cornerstoneWebImageLoader.bundle.min.js"></script>
    <script src="https://unpkg.com/cornerstone-wado-image-loader@4.13.2/dist/cornerstoneWADOImageLoader.bundle.min.js"></script>
</head>
<body>
    <div id="dicom-app"></div>

    <script>
        function checkDependencies() {
            return window.cornerstone &&
                   window.dicomParser &&
                   window.cornerstoneWADOImageLoader &&
                   window.cornerstoneTools &&
                   window.cornerstoneMath &&
                   window.Hammer;
        }

        function setupCornerstone() {
            try {
                if (!checkDependencies()) {
                    throw new Error('Dependências não carregadas completamente');
                }

                // Configurar dependências externas para cornerstone-tools
                window.cornerstoneTools.external.cornerstone = window.cornerstone;
                window.cornerstoneTools.external.cornerstoneMath = window.cornerstoneMath;
                window.cornerstoneTools.external.Hammer = window.Hammer;

                // Configurar dependências para image loaders
                window.cornerstoneWADOImageLoader.external.cornerstone = window.cornerstone;
                window.cornerstoneWADOImageLoader.external.dicomParser = window.dicomParser;

                if (window.cornerstoneWebImageLoader) {
                    window.cornerstoneWebImageLoader.external.cornerstone = window.cornerstone;
                }

                // Registrar WADO Image Loader
                window.cornerstone.registerImageLoader('wadouri', window.cornerstoneWADOImageLoader.wadouri.loadImage);

                // Registrar Web Image Loader se disponível
                if (window.cornerstoneWebImageLoader) {
                    window.cornerstone.registerImageLoader('http', window.cornerstoneWebImageLoader.loadImage);
                    window.cornerstone.registerImageLoader('https', window.cornerstoneWebImageLoader.loadImage);
                }

                // Configurar WADO Image Loader
                window.cornerstoneWADOImageLoader.configure({
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('Accept', 'application/dicom');
                    },
                    useWebWorkers: false,
                    decodeConfig: {
                        convertFloatPixelDataToInt: false,
                        convertColorspace: true
                    }
                });

                // Inicializar cornerstone-tools
                window.cornerstoneTools.init();
                window.cornerstoneReady = true;

                // Disparar evento customizado para indicar que está pronto
                window.dispatchEvent(new CustomEvent('cornerstoneReady', {
                    detail: {
                        timestamp: Date.now(),
                        version: window.cornerstone.version || 'unknown'
                    }
                }));

            } catch (error) {
                console.error('Erro ao configurar Cornerstone:', error);

                // Tentar novamente após um delay
                setTimeout(() => {
                    if (!window.cornerstoneReady) {
                        setupCornerstone();
                    }
                }, 1000);
            }
        }

        // Aguardar o carregamento completo da página
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupCornerstone);
        } else {
            setupCornerstone();
        }

        // Fallback para window.onload
        window.addEventListener('load', function() {
            if (!window.cornerstoneReady) {
                setupCornerstone();
            }
        });

    </script>

    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
