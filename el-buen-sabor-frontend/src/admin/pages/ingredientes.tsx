import { useEffect, useState } from "react";
import type { ArticuloInsumo } from "../../models/Articulos/ArticuloInsumo";
import { ArticuloService } from "../../services/ArticuloService";

export default function Ingredientes() {

	const [ingredientes, setIngredientes] = useState<ArticuloInsumo[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

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

	useEffect(() => {
		fetchIngredientes();
	}, [])

	return (
		(
			<div>
				<h1>ABM de ingredientes</h1>
				{loading && <p>Cargando...</p>}
				{error && <p style={{ color: "red" }}>{error}</p>}

				<table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
					<thead>
						<tr>
							<th>ID</th>
							<th>Denominación</th>
							<th>Precio Compra</th>
							<th>Stock Actual</th>
							<th>Stock Mínimo</th>
							<th>Unidad</th>
							<th>Categoría</th>
						</tr>
					</thead>
					<tbody>
						{ingredientes.map((ingrediente) => (
							<tr key={ingrediente.id}>
								<td>{ingrediente.id}</td>
								<td>{ingrediente.denominacion}</td>
								<td>${ingrediente.precioCompra}</td>
								<td>{ingrediente.stockActual}</td>
								<td>{ingrediente.stockMinimo}</td>
								<td>{ingrediente.unidadMedida?.denominacion ?? "N/A"}</td>
								<td>{ingrediente.categoria?.denominacion ?? "N/A"}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)
	)
}