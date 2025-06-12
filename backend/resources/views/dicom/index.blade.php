<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>DICOM Viewer</title>

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">

    <!-- Cornerstone.js Libraries - VERSÕES COMPATÍVEIS -->
    <script src="https://unpkg.com/dicom-parser@1.8.21/dist/dicomParser.min.js"></script>
    <script src="https://unpkg.com/cornerstone-core@2.6.1/dist/cornerstone.min.js"></script>
    <script src="https://unpkg.com/cornerstone-web-image-loader@2.1.1/dist/cornerstoneWebImageLoader.bundle.min.js"></script>
    <script src="https://unpkg.com/cornerstone-wado-image-loader@4.13.2/dist/cornerstoneWADOImageLoader.bundle.min.js"></script>
    <!-- REMOVENDO CORNERSTONE TOOLS POR ENQUANTO - CAUSA CONFLITO -->
    <!-- <script src="https://unpkg.com/cornerstone-tools@6.0.10/dist/cornerstoneTools.js"></script> -->
</head>
<body>
{{--     <div id="loading" class="text-center p-4">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Carregando...</span>
        </div>
        <p>Carregando aplicação...</p>
    </div> --}}

    <div id="dicom-app"></div>

    <!-- Configuração do Cornerstone SEM Tools -->
    <script>
        console.log('=== CONFIGURANDO CORNERSTONE (SEM TOOLS) ===');

        window.addEventListener('load', function() {
            try {
                console.log('Verificando bibliotecas...');

                if (!window.cornerstone) {
                    throw new Error('Cornerstone não carregado');
                }

                if (!window.dicomParser) {
                    throw new Error('dicomParser não carregado');
                }

                if (!window.cornerstoneWADOImageLoader) {
                    throw new Error('cornerstoneWADOImageLoader não carregado');
                }

                console.log('✅ Bibliotecas básicas carregadas');

                // Configurar dependências externas
                window.cornerstoneWADOImageLoader.external.cornerstone = window.cornerstone;
                window.cornerstoneWADOImageLoader.external.dicomParser = window.dicomParser;

                // Configurar Web Image Loader
                if (window.cornerstoneWebImageLoader) {
                    window.cornerstoneWebImageLoader.external.cornerstone = window.cornerstone;
                }

                console.log('Registrando image loaders...');

                // Registrar WADO Image Loader
                window.cornerstone.registerImageLoader('wadouri', window.cornerstoneWADOImageLoader.wadouri.loadImage);

                // Registrar Web Image Loader
                if (window.cornerstoneWebImageLoader) {
                    window.cornerstone.registerImageLoader('http', window.cornerstoneWebImageLoader.loadImage);
                    window.cornerstone.registerImageLoader('https', window.cornerstoneWebImageLoader.loadImage);
                }

                console.log('✅ Image loaders registrados!');

                // Configurar WADO Image Loader
                window.cornerstoneWADOImageLoader.configure({
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('Accept', 'application/dicom');
                    },
                    useWebWorkers: false,
                });

                console.log('✅ Cornerstone configurado (sem tools)!');
                window.cornerstoneReady = true;

            } catch (error) {
                console.error('❌ Erro ao configurar Cornerstone:', error);
                alert('Erro ao carregar bibliotecas DICOM: ' + error.message);
            }
        });
    </script>

    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
