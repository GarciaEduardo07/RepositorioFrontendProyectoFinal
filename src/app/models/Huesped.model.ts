export interface HuespedRequest {
    nombre: string,
    apellido: string,
    email: string,
    telefono: string,
    documento: string
}

export interface HuespedResponse {
    id: number,
    nombre: string,
    apellidoPaterno: string,
    apellidoMaterno: string,
    email: string,
    telefono: string,
    documento: string,
    nacionalidad: string
}