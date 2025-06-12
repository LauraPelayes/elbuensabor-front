export interface IPedidoDTO {
  clienteId: number
  domicilioEntregaId?: number // Optional, solo requerido si tipoEnvio === 'DELIVERY'
  tipoEnvio: TipoEnvio
  formaPago: FormaPago
  sucursalId: number
  detallesPedidos: ICreateDetallePedidoDTO[]
}

export enum TipoEnvio {
  RETIRO_EN_LOCAL = "RETIRO_EN_LOCAL",
  DELIVERY = "DELIVERY",
}

export enum FormaPago {
  EFECTIVO = "EFECTIVO",
  TARJETA = "TARJETA",
  TRANSFERENCIA = "TRANSFERENCIA",
  MERCADO_PAGO = "MERCADO_PAGO"
}

export interface ICreateDetallePedidoDTO {
  cantidad: number
  articuloManufacturadoId?: number | null
  articuloInsumoId?: number | null
}