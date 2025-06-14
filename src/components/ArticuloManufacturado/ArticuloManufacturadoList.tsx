// src/components/ArticuloManufacturado/ArticuloManufacturadoList.tsx
import React, { useEffect, useState } from 'react';
import { ArticuloManufacturado } from '../../models/Articulos/ArticuloManufacturado';
import { ArticuloService } from '../../services/ArticuloService';
import ArticuloManufacturadoForm from './ArticuloManufacturadoForm'; // Importar el formulario

const ArticuloManufacturadoList: React.FC = () => {
    const [articulosManufacturados, setArticulosManufacturados] = useState<ArticuloManufacturado[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false); // Estado para mostrar/ocultar formulario
    const [selectedArticulo, setSelectedArticulo] = useState<ArticuloManufacturado | null>(null); // Artículo a editar

    const articuloService = new ArticuloService();

    // Función para cargar los artículos (ahora puede ser reutilizada)
    const fetchArticulos = async () => {
        try {
            setLoading(true);
            const data = await articuloService.findAllArticulosManufacturadosActivos();//me falta esa función en el servicio
            setArticulosManufacturados(data);
        } catch (err) {
            setError('Error al cargar los artículos manufacturados.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticulos();
    }, []); // Se ejecuta solo una vez al montar

    const handleCreateClick = () => {
        setSelectedArticulo(null); // Limpiar cualquier artículo seleccionado para crear uno nuevo
        setShowForm(true); // Mostrar el formulario
    };

    const handleEditClick = (articulo: ArticuloManufacturado) => {
        setSelectedArticulo(articulo); // Establecer el artículo para editar
        setShowForm(true); // Mostrar el formulario
    };

    const handleDeleteClick = async (id: number, denominacion: string) => {
        if (window.confirm(`¿Estás seguro de eliminar (lógicamente) el artículo "${denominacion}"? Este no se mostrará en la lista.`)) {
            try {
                // Ahora llama al método de borrado lógico
                await articuloService.deleteArticuloManufacturado(id); // Este método ahora hará el borrado lógico
                fetchArticulos(); // Recargar la lista
                alert('Artículo eliminado lógicamente exitosamente.');
            } catch (err) {
                alert('Error al eliminar lógicamente el artículo.');
                console.error(err);
            }
        }
    };

    const handleFormSave = () => {
        setShowForm(false); // Ocultar el formulario
        setSelectedArticulo(null); // Limpiar selección
        fetchArticulos(); // Recargar la lista para mostrar los cambios
    };

    const handleFormCancel = () => {
        setShowForm(false); // Ocultar el formulario
        setSelectedArticulo(null); // Limpiar selección
    };

    if (loading) {
        return <p>Cargando artículos manufacturados...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div className="articulo-manufacturado-list">
            <h2>Gestión de Artículos Manufacturados</h2>

            {/* Botón de Crear Nuevo Artículo */}
            <button onClick={handleCreateClick} style={{ marginBottom: '20px', padding: '10px 20px', fontSize: '16px' }}>
                Crear Nuevo Artículo
            </button>

            {/* Mostrar el formulario si showForm es true */}
            {showForm && (
                <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px' }}>
                    <ArticuloManufacturadoForm
                        articulo={selectedArticulo}
                        onSave={handleFormSave}
                        onCancel={handleFormCancel}
                    />
                </div>
            )}

            {/* Listado de Artículos */}
            {articulosManufacturados.length === 0 ? (
                <p>No hay artículos manufacturados para mostrar.</p>
            ) : (
                <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Denominación</th>
                            <th>Precio Venta</th>
                            <th>Descripción</th>
                            <th>Tiempo Estimado (min)</th>
                            <th>Categoría</th>
                            <th>Imagen</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articulosManufacturados.map((articulo) => (
                            <tr key={articulo.id}>
                                <td>{articulo.id}</td>
                                <td>{articulo.denominacion}</td>
                                <td>${articulo.precioVenta?.toFixed(2)}</td>
                                <td>{articulo.descripcion}</td>
                                <td>{articulo.tiempoEstimadoMinutos}</td>
                                <td>{articulo.categoria?.denominacion || 'N/A'}</td>
                                <td>
                                    {articulo.imagen?.denominacion ? (
                                        <img src={articulo.imagen.denominacion} alt={articulo.denominacion} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                    ) : (
                                        'Sin imagen'
                                    )}
                                </td>
                                <td>
                                    <button onClick={() => handleEditClick(articulo)}>Editar</button>
                                    <button onClick={() => handleDeleteClick(articulo.id!, articulo.denominacion)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ArticuloManufacturadoList;