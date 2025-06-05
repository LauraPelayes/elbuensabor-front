import { useEffect, useState } from "react";
import type { ArticuloInsumo } from "../../models/Articulos/ArticuloInsumo";
import { ArticuloService } from "../../services/ArticuloService";

export default function Ingredientes() {

	const [ingredientes, setIngredientes] = useState<ArticuloInsumo[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	// Editar
	const [ingredienteEditando, setIngredienteEditando] = useState<ArticuloInsumo | null>(null);
	const [formData, setFormData] = useState<Partial<ArticuloInsumo>>({});
	// Crear
	const [nuevoIngrediente, setNuevoIngrediente] = useState<Partial<ArticuloInsumo>>({});

	const articuloService = new ArticuloService();

	const fetchIngredientes = async () => {
		try {
			setLoading(true);
			const data = await articuloService.getAllArticulosInsumo();
			setIngredientes(data);
		} catch (err) {
			setError('Error al cargar los artículos manufacturados.');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleEliminar = async (id: number) => {
		try {
			await articuloService.deleteArticulo(id);
			setIngredientes((prev) => prev.filter((ing) => ing.id !== id));
		} catch (error) {
			console.error(error);
			alert("Error al eliminar el ingrediente.");
		}
	};

	const editarIngrediente = (ingrediente: ArticuloInsumo) => {
		setIngredienteEditando(ingrediente);
		setFormData(ingrediente);
	};
	const guardarCambios = async () => {
		if (!ingredienteEditando?.id) return;
		try {
			const actualizado = await articuloService.updateArticuloInsumo(ingredienteEditando.id, {
				...ingredienteEditando,
				...formData,
			});
			setIngredientes(prev =>
				prev.map(i => (i.id === actualizado.id ? actualizado : i))
			);
			setIngredienteEditando(null);
		} catch (err) {
			console.error("Error al actualizar:", err);
			alert("Hubo un error al actualizar el ingrediente.");
		}
	};

	const crearIngrediente = async () => {
		try {
			const creado = await articuloService.createArticuloInsumo(nuevoIngrediente as ArticuloInsumo);
			setIngredientes(prev => [...prev, creado]);
			setNuevoIngrediente({}); // Limpiar formulario
		} catch (err) {
			console.error("Error al crear:", err);
			alert("Hubo un error al crear el ingrediente.");
		}
	};


	useEffect(() => {
		fetchIngredientes();
	}, [])

	return (
		(
			<div>
				<h1>ABM de ingredientes</h1>
				{loading && <p>Cargando...</p>}
				{error && <p style={{ color: "red" }}>{error}</p>}

				<div style={{ margin: '20px 0', padding: 10, border: '1px solid #ccc' }}>
					<h3>Crear Nuevo Ingrediente</h3>
					<input
						type="text"
						value={nuevoIngrediente.denominacion || ''}
						onChange={e => setNuevoIngrediente({ ...nuevoIngrediente, denominacion: e.target.value })}
						placeholder="Denominación"
					/>
					<input
						type="number"
						value={nuevoIngrediente.precioCompra || ''}
						onChange={e => setNuevoIngrediente({ ...nuevoIngrediente, precioCompra: parseFloat(e.target.value) })}
						placeholder="Precio Compra"
					/>
					{/* Agregá más campos si querés (stockActual, stockMinimo, unidadMedida, etc.) */}
					<button onClick={crearIngrediente}>Crear</button>
				</div>

				<table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
					<thead>
						<tr>
							<th className="p-2">ID</th>
							<th className="p-2">Denominación</th>
							<th className="p-2">Precio Compra</th>
							<th className="p-2">Stock Actual</th>
							<th className="p-2">Stock Mínimo</th>
							<th className="p-2">Unidad</th>
							<th className="p-2">Categoría</th>
							<th className="p-2">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{ingredientes.map((ingrediente) => (
							<tr key={ingrediente.id}>
								<td className="p-2">{ingrediente.id}</td>
								<td className="p-2">{ingrediente.denominacion}</td>
								<td className="p-2">${ingrediente.precioCompra}</td>
								<td className="p-2">{ingrediente.stockActual}</td>
								<td className="p-2">{ingrediente.stockMinimo}</td>
								<td className="p-2">{ingrediente.unidadMedida?.denominacion ?? "N/A"}</td>
								<td className="p-2">{ingrediente.categoria?.denominacion ?? "N/A"}</td>
								<td className="p-2 flex gap-2">
									<button onClick={() => ingrediente.id !== undefined && handleEliminar(ingrediente.id)}>
										Eliminar
									</button>
									<button onClick={() => editarIngrediente(ingrediente)}>Editar</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{ingredienteEditando && (
					<div style={{ margin: '20px 0', padding: 10, border: '1px solid #ccc' }}>
						<h3>Editar Ingrediente</h3>
						<input
							type="text"
							value={formData.denominacion || ''}
							onChange={e => setFormData({ ...formData, denominacion: e.target.value })}
							placeholder="Denominación"
						/>
						<input
							type="number"
							value={formData.precioCompra || ''}
							onChange={e => setFormData({ ...formData, precioCompra: parseFloat(e.target.value) })}
							placeholder="Precio Compra"
						/>
						{/* Agregá más campos según necesidad */}
						<button onClick={guardarCambios}>Guardar</button>
						<button onClick={() => setIngredienteEditando(null)}>Cancelar</button>
					</div>
				)}
			</div>
		)
	)
}