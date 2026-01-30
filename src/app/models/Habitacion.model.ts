export interface HabitacionRequest {
    numero: string;
    idTipo: number;
    idEstado: number;
    precioNoche: number;
    capacidad: number;
}

export interface HabitacionResponse {
    id: number;
    numero: string;
    tipo: string;
    estado: string;
    precioNoche: number; // matched backend field name
    capacidad: number;
}

export enum TipoHabitacion {
    SENCILLA = 1,
    DOBLE = 2,
    SUITE = 3,
    KING = 4
}

export enum EstadoHabitacion {
    DISPONIBLE = 1,
    OCUPADA = 2,
    LIMPIEZA = 3,
    MANTENIMIENTO = 4
}