import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

function App() {
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageName, setImageName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // Carregar lista de imagens
  const fetchImages = async () => {
    try {
      const response = await axios.get('http://localhost/api/dicom-images');
      setImages(response.data);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Upload de arquivo
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile || !imageName) {
      alert('Por favor, selecione um arquivo e digite um nome');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', imageName);
    formData.append('description', description);

    try {
      await axios.post('http://localhost/api/dicom-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Arquivo enviado com sucesso!');
      setSelectedFile(null);
      setImageName('');
      setDescription('');
      document.getElementById('fileInput').value = '';
      fetchImages(); // Recarregar lista
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar arquivo');
    } finally {
      setUploading(false);
    }
  };

  // Deletar imagem
  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta imagem?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost/api/dicom-images/${id}`);
      alert('Imagem deletada com sucesso!');
      fetchImages();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar imagem');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Sistema DICOM Viewer</h1>
      
      <div className="row">
        <div className="col-md-6">
          {/* Upload Form */}
          <div className="card">
            <div className="card-header">
              <h3>Upload de Imagem DICOM</h3>
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
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setSelectedFile(file);
                      if (file) {
                        setImageName(file.name.replace(/\.(dcm|dicom)$/i, ''));
                      }
                    }}
                    disabled={uploading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Nome da Imagem
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={imageName}
                    onChange={(e) => setImageName(e.target.value)}
                    disabled={uploading}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Descrição (opcional)
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={uploading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? 'Enviando...' : 'Enviar Imagem DICOM'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          {/* Lista de Imagens */}
          <div className="card">
            <div className="card-header">
              <h3>Imagens DICOM ({images.length})</h3>
            </div>
            <div className="card-body">
              {images.length === 0 ? (
                <p className="text-muted">Nenhuma imagem encontrada.</p>
              ) : (
                <div className="list-group">
                  {images.map((image) => (
                    <div key={image.id} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{image.name}</h5>
                        <small>{new Date(image.created_at).toLocaleDateString()}</small>
                      </div>
                      <p className="mb-1">
                        <strong>Arquivo:</strong> {image.original_name}<br/>
                        <strong>Tamanho:</strong> {(image.file_size / 1024).toFixed(1)} KB
                      </p>
                      {image.description && (
                        <p className="mb-1 text-muted">{image.description}</p>
                      )}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(image.id)}
                      >
                        Deletar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
