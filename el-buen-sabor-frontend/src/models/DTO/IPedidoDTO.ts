export interface IPedidoDTO {
  clienteId: number
  domicilioEntregaId?: number // Optional, solo requerido si tipoEnvio === 'DELIVERY'
  tipoEnvio: TipoEnvio
  formaPago: FormaPago
  sucursalId: number
  detallesPedidos: ICreateDetallePedidoDTO[]
}

export enum TipoEnvio {
  RETIRO = "RETIRO",
  DELIVERY = "DELIVERY",
}

export enum FormaPago {
  EFECTIVO = "EFECTIVO",
  TARJETA = "TARJETA",
  TRANSFERENCIA = "TRANSFERENCIA",
}

export interface ICreateDetallePedidoDTO {
  cantidad: number
  articuloManufacturadoId?: number | null
  articuloInsumoId?: number | null
}