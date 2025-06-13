import React, { useState } from 'react';
import DicomViewer from './DicomViewer';
import DicomUpload from './DicomUpload';
import DicomList from './DicomList';

const DicomApp = () => {
    const [images, setImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showViewer, setShowViewer] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file && /\.dcm$/i.test(file.name)) {
            setSelectedFile(file);
        } else {
            alert('Apenas arquivos .dcm são permitidos.');
        }
    };

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
                    <h1 className="text-center mb-4">DICOM Viewer</h1>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <DicomUpload
                        dragActive={dragActive}
                        handleDragOver={handleDragOver}
                        handleDragLeave={handleDragLeave}
                        handleDrop={handleDrop}
                        handleUpload={handleUpload}
                        handleFileSelect={handleFileSelect}
                        uploading={uploading}
                        selectedFile={selectedFile}
                    />
                </div>
                <div className="col-md-6">
                    <DicomList
                        images={images}
                        loadImages={loadImages}
                        handleViewImage={handleViewImage}
                        handleDeleteImage={handleDeleteImage}
                    />
                </div>
            </div>
        </div>
    );
};

export default DicomApp;
