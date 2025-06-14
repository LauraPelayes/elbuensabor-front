// src/components/ArticuloManufacturado/ArticuloManufacturadoForm.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { ArticuloManufacturado } from '../../models/Articulos/ArticuloManufacturado';
import { ArticuloManufacturadoDetalle } from '../../models/Articulos/ArticuloManufacturadoDetalle';
import { ArticuloInsumo } from '../../models/Articulos/ArticuloInsumo';
import { Categoria } from '../../models/Categoria/Categoria';
import { Imagen } from '../../models/Categoria/Imagen'; // Necesaria para el constructor de Imagen
import { ArticuloService } from '../../services/ArticuloService';
import axios from 'axios'; // ¡AÑADE ESTA LÍNEA!
import CategoriaForm from '../Categoria/CategoriaForm';
interface ArticuloManufacturadoFormProps {
    articulo?: ArticuloManufacturado | null; // El artículo a editar (nulo para creación)
    onSave: () => void; // Función a llamar después de guardar (para recargar la lista)
    onCancel: () => void; // Función para cancelar y cerrar el formulario
}

// **CONFIGURACIÓN DE CLOUDINARY**Add commentMore actions
const CLOUDINARY_CLOUD_NAME = 'deagcdoak'; // Reemplaza con tu Cloud Name
const CLOUDINARY_UPLOAD_PRESET = 'ElBuenSabor'; // Reemplaza con tu Upload Preset
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const ArticuloManufacturadoForm: React.FC<ArticuloManufacturadoFormProps> = ({ articulo, onSave, onCancel }) => {
    const [formData, setFormData] = useState<ArticuloManufacturado>(
        articulo || new ArticuloManufacturado('', 0, 0, '', 0, '', [], undefined, undefined, undefined, undefined, undefined, undefined)
    );

    // Estados para datos maestros (listas para selectores)
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [insumos, setInsumos] = useState<ArticuloInsumo[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false); // Estado para la carga de imagen
    // Ya no necesitamos unidadesMedida para el ArticuloManufacturado directamente en el DTO
    // const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]); // Si ArticuloManufacturado usa UnidadMedida

    // Estados para la carga y errores
    const [loadingMasterData, setLoadingMasterData] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Instancia del servicio de artículos, memorizada para estabilidad
    const articuloService = useMemo(() => new ArticuloService(), []);

    // Efecto para cargar datos maestros (categorías, insumos) al montar
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                setLoadingMasterData(true);
                const categoriasData = await articuloService.getAllCategorias();
                const insumosData = await articuloService.getAllArticulosInsumo(); // Obtener todos los insumos
                // const unidadesMedidaData = await articuloService.getAllUnidadesMedida(); // Si ArticuloManufacturado no usa unidadMedida

                setCategorias(categoriasData);
                setInsumos(insumosData);
                // setUnidadesMedida(unidadesMedidaData); // Si ArticuloManufacturado no usa unidadMedida

                if (articulo) {
                    setFormData(articulo);
                } else {
                    // Limpiar formulario para un nuevo artículo
                    setFormData(new ArticuloManufacturado('', 0, 0, '', 0, '', [], undefined, undefined, undefined, undefined, undefined, undefined));
                }

            } catch (err) {
                setError('Error al cargar datos maestros.');
                console.error(err);
            } finally {
                setLoadingMasterData(false);
            }
        };

        fetchMasterData();
    }, [articulo, articuloService]); // Dependencia del servicio

    // Manejador de cambios para los campos del formulario principal
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'precioVenta' || name === 'tiempoEstimadoMinutos' ? Number(value) : value,
        }));
    };

    // --- Lógica para la gestión de detalles (ingredientes) ---
// **NUEVO: Manejador para la subida de archivos a Cloudinary**Add commentMore actions
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', file);
        cloudinaryFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await axios.post(CLOUDINARY_UPLOAD_URL, cloudinaryFormData);
            const secureUrl = response.data.secure_url;

            // Actualiza el formData con la nueva URL de la imagen
            setFormData(prev => ({
                ...prev,
                imagen: new Imagen(secureUrl, prev.imagen?.id) // Asume que el constructor de Imagen acepta (denominacion, id)
            }));

        } catch (uploadError) {
            console.error('Error al subir la imagen a Cloudinary:', uploadError);
            setError('Error al subir la imagen. Inténtalo de nuevo.');
        } finally {
            setIsUploading(false);
        }
    };
    // Manejador para cambiar la cantidad de un detalle
    const handleDetalleCantidadChange = (index: number, value: string) => {
        const newDetalles = [...formData.detalles];
        newDetalles[index].cantidad = Number(value);
        setFormData(prev => ({ ...prev, detalles: newDetalles }));
    };

    // Manejador para cambiar el insumo seleccionado en un detalle
    const handleDetalleInsumoChange = (index: number, insumoId: string) => {
        const newDetalles = [...formData.detalles];
        const selectedInsumo = insumos.find(i => i.id === Number(insumoId));
        if (selectedInsumo) {
            // Asegúrate de que el detalle tenga el ID del insumo y el objeto insumo para display
            newDetalles[index].articuloInsumoId = selectedInsumo.id!;
            newDetalles[index].articuloInsumo = selectedInsumo;
        } else {
            // Si no se selecciona ninguno, o se borra la selección
            newDetalles[index].articuloInsumoId = 0; // O null, dependiendo de tu backend
            newDetalles[index].articuloInsumo = undefined;
        }
        setFormData(prev => ({ ...prev, detalles: newDetalles }));
    };

    // Manejador para añadir un nuevo detalle vacío
    const handleAddDetalle = () => {
        setFormData(prev => ({
            ...prev,
            detalles: [...prev.detalles, new ArticuloManufacturadoDetalle(0, 0)], // Cantidad 0, InsumoId 0 o null
        }));
    };

    // Manejador para eliminar un detalle
    const handleRemoveDetalle = (index: number) => {
        const newDetalles = formData.detalles.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, detalles: newDetalles }));
    };

    // Calcular el costo total del producto (suma de cantidad * precioCompra del insumo)
    const calculateCostoTotal = (): number => {
        return formData.detalles.reduce((totalCosto, detalle) => {
            const insumo = insumos.find(i => i.id === detalle.articuloInsumoId);
            return totalCosto + (detalle.cantidad * (insumo?.precioCompra || 0));
        }, 0);
    };

    // --- Lógica para el envío del formulario ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validaciones (HU#23: al menos un ingrediente)
        if (formData.detalles.length === 0) {
            setError('El artículo manufacturado debe tener al menos un ingrediente.');
            return;
        }
        if (!formData.denominacion || formData.denominacion.trim() === '') {
            setError('La denominación es obligatoria.');
            return;
        }
        if (formData.precioVenta === null || formData.precioVenta <= 0) {
            setError('El precio de venta debe ser mayor a cero.');
            return;
        }
        if (!formData.categoriaId || formData.categoriaId === 0) {
            setError('Debe seleccionar una categoría.');
            return;
        }
        // Puedes añadir más validaciones aquí, ej. que todos los detalles tengan un insumoId válido

        // **VALIDACIÓN DE IMAGEN (OPCIONAL)
        if (!formData.imagen?.denominacion) {
            // setError('Debe subir una imagen para el artículo.');
            // return;
            // O manejarlo como opcional, permitiendo imagen: undefined si no se sube nada.
            // En ese caso, asegúrate que el backend maneje imagenId null o undefined.
        }
        try {
            if (formData.id) {
                // Actualizar artículo existente
                await articuloService.updateArticuloManufacturado(formData.id, formData);
                alert('Artículo manufacturado actualizado exitosamente.');
            } else {
                // Crear nuevo artículo
                await articuloService.createArticuloManufacturado(formData);
                alert('Artículo manufacturado creado exitosamente.');
            }

            onSave(); // Llamar a onSave para recargar la lista y cerrar el formulario
        } catch (err) {
            let errorMessage = 'Error desconocido al guardar el artículo.';
            if (axios.isAxiosError(err)) {
                if (err.response?.data) {
                    if (typeof err.response.data === 'string') {
                        errorMessage = err.response.data;
                    } else if (err.response.data instanceof Object && 'message' in err.response.data) {
                        errorMessage = (err.response.data as { message: string }).message;
                    } else {
                        errorMessage = JSON.stringify(err.response.data);
                    }
                } else if (err.message) {
                    errorMessage = err.message;
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(`Error al guardar el artículo: ${errorMessage}`);
            console.error(err);
        }
    };

    if (loadingMasterData) {
        return <p>Cargando datos del formulario...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div className="articulo-manufacturado-form" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h3>{articulo?.id ? 'Editar Artículo Manufacturado' : 'Crear Nuevo Artículo Manufacturado'}</h3>
            <form onSubmit={handleSubmit}>
                {/* Campos del formulario principal */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Denominación:</label>
                    <input type="text" name="denominacion" value={formData.denominacion} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Precio Venta:</label>
                    <input type="number" name="precioVenta" value={formData.precioVenta} onChange={handleChange} required min="0.01" step="0.01" style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Descripción:</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Tiempo Estimado (minutos):</label>
                    <input type="number" name="tiempoEstimadoMinutos" value={formData.tiempoEstimadoMinutos} onChange={handleChange} required min="0" style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Preparación:</label>
                    <textarea name="preparacion" value={formData.preparacion} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                </div>

                {/* Selector de Categoría */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Categoría:</label>
                    <select name="categoriaId" value={formData.categoriaId} onChange={handleChange} required style={{ width: '100%', padding: '8px' }}>
                        <option value="">Seleccione una categoría</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.denominacion}</option>
                        ))}
                    </select>
                    <p id='createCategory' className='create-category-btn'>Crear categoria +</p>
                </div>

                {/* Campo para URL de Imagen (ahora es un input de texto) */}
                <div style={{marginBottom: '15px'}}>
                    <label>Imagen del Artículo:</label>
                    <input
                        type="file"
                        accept="image/*" // Aceptar solo archivos de imagen
                        onChange={handleImageUpload}
                        style={{ width: '100%', padding: '8px' }}
                        disabled={isUploading} // Deshabilitar mientras se sube
                    />
                    {isUploading && <p>Subiendo imagen...</p>}
                    {/* Previsualización de la imagen subida */}
                    {formData.imagen?.denominacion && (
                        <div style={{ marginTop: '10px' }}>
                    {formData.imagen?.denominacion && ( // Mostrar previsualización si hay URL
                        <div style={{marginTop: '10px'}}>
                            <img src={formData.imagen.denominacion} alt="Previsualización" style={{
                                maxWidth: '150px',
                                maxHeight: '150px',
                                objectFit: 'cover',
                                border: '1px solid #ccc'
                            }}/>
                            <p style={{fontSize: '0.8em', color: '#555'}}>URL: {formData.imagen.denominacion}</p>
                        </div>
                    )}
                        </div>
                    )}
                </div>
                    {/* Sección de Detalles (Ingredientes) */}
                        <hr style={{margin: '20px 0'}} />
                <h4>Ingredientes:</h4>
                {formData.detalles.map((detalle, index) => (
                <div key={index} style={{border: '1px dashed #ccc', padding: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label>Insumo:</label>
                        <select
                            value={detalle.articuloInsumoId || ''}
                            onChange={(e) => handleDetalleInsumoChange(index, e.target.value)}
                            required
                            style={{ flex: 1, padding: '8px' }}
                        >
                            <option value="">Seleccione un insumo</option>
                            {insumos.map(ins => (
                                <option key={ins.id} value={ins.id}>{ins.denominacion} ({ins.unidadMedida?.denominacion})</option>
                            ))}
                        </select>
                        <label>Cantidad:</label>
                        <input
                            type="number"
                            value={detalle.cantidad}
                            onChange={(e) => handleDetalleCantidadChange(index, e.target.value)}
                            required
                            min="0.01"
                            step="0.01"
                            style={{ width: '80px', padding: '8px' }}
                        />
                        <button type="button" onClick={() => handleRemoveDetalle(index)} style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Eliminar
                        </button>
                    </div>
                ))}
                <button type="button" onClick={handleAddDetalle} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px' }}>
                    Añadir Ingrediente
                </button>

                {/* Costo Total del Producto */}
                <div style={{ marginTop: '20px', padding: '10px', borderTop: '1px solid #eee', fontSize: '1.1em', fontWeight: 'bold' }}>
                    Costo Total del Producto: ${calculateCostoTotal().toFixed(2)}
                </div>

                {/* Botones de acción */}
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button type="submit" disabled={isUploading} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {isUploading ? 'Espere...' : (formData.id ? 'Actualizar' : 'Guardar')}
                    </button>
                    <button type="button" onClick={onCancel} disabled={isUploading} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancelar
                    </button>
                </div>
            </form>
            <CategoriaForm
                categorias={categorias}
                reloadCategorias={async () => {
                    const updated = await articuloService.getAllCategorias();
                    setCategorias(updated);
                }}
            />
        </div>
    );
};

export default ArticuloManufacturadoForm;