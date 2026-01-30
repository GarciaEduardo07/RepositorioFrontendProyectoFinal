export interface HabitacionRequest {
    numero: string,
    tipo: string,
    estado: string,
    precio: number
}

export interface HabitacionResponse{
    id:number,
    numero:string,
    tipo:string,
    estado:string
    precio:number
}