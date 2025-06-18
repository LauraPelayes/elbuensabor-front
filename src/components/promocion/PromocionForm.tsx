import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { crearPromocion } from "../../services/PromocionService";
import { getArticulosManufacturados } from "../../services/ArticuloManufacturadoService";
import { getSucursales } from "../../services/SucursalService";
import type { PromocionCreateDTO } from "../../models/DTO/PromocionCreateDTO";

const tipos = [
    "DESCUENTO_CANTIDAD",
    "REGALO_CANTIDAD",
    "DESCUENTO_SIGUIENTE_COMPRA"
];

const PromocionForm: React.FC = () => {
    const { register, handleSubmit, reset } = useForm<PromocionCreateDTO>();

    const [articulos, setArticulos] = useState<any[]>([]);
    const [sucursales, setSucursales] = useState<any[]>([]);

    useEffect(() => {
        getArticulosManufacturados().then(setArticulos).catch(console.error);
        getSucursales().then(setSucursales).catch(console.error);
    }, []);

    const onSubmit = async (data: PromocionCreateDTO) => {
        try {
            await crearPromocion(data);
            alert("¡Promoción creada con éxito!");
            reset();
        } catch (error) {
            alert("Error al crear la promoción: " + error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 w-full max-w-md mx-auto mt-4">

            <input {...register("denominacion")} placeholder="Denominación" required />
            <input type="date" {...register("fechaDesde")} required />
            <input type="date" {...register("fechaHasta")} required />
            <input type="time" {...register("horaDesde")} required />
            <input type="time" {...register("horaHasta")} required />
            <input type="number" step="0.01" {...register("precioPromocional")} placeholder="Precio Promocional" required />
            <input type="text" {...register("descripcionDescuento")} placeholder="Descripción del descuento" required />

            <select {...register("tipoPromocion")} required>
                <option value="">Seleccioná un tipo de promoción</option>
                {tipos.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                ))}
            </select>

            <label>Artículos manufacturados</label>
            <select multiple {...register("articulosManufacturados")} required>
                {articulos.map((art: any) => (
                    <option key={art.id} value={art.id}>{art.denominacion}</option>
                ))}
            </select>

            <label>Sucursales</label>
            <select multiple {...register("sucursales")} required>
                {sucursales.map((suc: any) => (
                    <option key={suc.id} value={suc.id}>{suc.nombre}</option>
                ))}
            </select>

            <input type="number" step="1" {...register("cantidadMinima")} placeholder="Cantidad mínima (si aplica)" />
            <input type="number" step="0.01" {...register("porcentajeDescuento")} placeholder="% Descuento (si aplica)" />
            <input type="number" step="0.01" {...register("montoMinimo")} placeholder="Monto mínimo (si aplica)" />
            <input type="number" {...register("articuloRegaloId")} placeholder="ID de artículo regalo (si aplica)" />

            <button type="submit">Guardar Promoción</button>
        </form>
    );
};

export default PromocionForm;
