import { HabitacionResponse } from './Habitacion.model';
import { HuespedResponse } from './Huesped.model';

export interface ReservaRequest {
    idHuesped: number;
    idHabitacion: number;
    fechaEntrada: string; // LocalDate is string in JSON
    fechaSalida: string;
}

export interface ReservaResponse {
    id: number;
    huesped: HuespedResponse;       // Changed from idHuesped
    habitacion: HabitacionResponse; // Changed from idHabitacion
    fechaEntrada: string;
    fechaSalida: string;
    cantNoches: number;
    montoTotal: number;
    estado: EstadoReserva;
}

export enum EstadoReserva {
    CONFIRMADA = 'CONFIRMADA',
    EN_CURSO = 'EN_CURSO',
    FINALIZADA = 'FINALIZADA',
    CANCELADA = 'CANCELADA'
}

export const ESTADO_RESERVA_LABEL: Record<EstadoReserva, string> = {
    [EstadoReserva.CONFIRMADA]: 'Confirmada',
    [EstadoReserva.EN_CURSO]: 'En Curso',
    [EstadoReserva.FINALIZADA]: 'Finalizada',
    [EstadoReserva.CANCELADA]: 'Cancelada'
};
