import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { ReservasService } from '../../services/reservas.service';
import { HabitacionesService } from '../../services/habitaciones.service';
import { HuespedesService } from '../../services/huespedes.service';
import { AuthService } from '../../services/auth.service';

import { ReservaRequest, ReservaResponse, EstadoReserva, ESTADO_RESERVA_LABEL } from '../../models/Reserva.model';
import { HabitacionResponse } from '../../models/Habitacion.model';
import { HuespedResponse } from '../../models/Huesped.model';
import { Roles } from '../../constants/Roles';

declare var bootstrap: any;

@Component({
    selector: 'app-reservas',
    standalone: false,
    templateUrl: './reservas.component.html',
    styleUrls: ['./reservas.component.css']
})
export class ReservasComponent implements OnInit, AfterViewInit {

    listaReservas: ReservaResponse[] = [];
    listaHabitaciones: HabitacionResponse[] = [];
    listaHuespedes: HuespedResponse[] = [];



    reservaForm: FormGroup;
    modalText = 'Registrar Reserva';

    @ViewChild('reservaModalRef') reservaModalEl!: ElementRef;
    private modalInstance!: any;

    isAdmin = false;
    ESTADO_LABELS = ESTADO_RESERVA_LABEL;

    constructor(
        private reservasService: ReservasService,
        private habitacionesService: HabitacionesService,
        private huespedesService: HuespedesService,
        private authService: AuthService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.reservaForm = this.fb.group({
            idHuesped: ['', Validators.required],
            idHabitacion: ['', Validators.required],
            fechaEntrada: ['', Validators.required],
            fechaSalida: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.isAdmin = this.authService.hasRole(Roles.ADMIN);
        this.cargarCatalogos();
        this.listarReservas();
    }

    ngAfterViewInit(): void {
        this.modalInstance = new bootstrap.Modal(this.reservaModalEl.nativeElement, { keyboard: false });
        this.reservaModalEl.nativeElement.addEventListener('hidden.bs.modal', () => {
            this.reservaForm.reset();
        });
    }

    cargarCatalogos(): void {
        // Load Habitaciones and Huespedes for dropdowns
        this.habitacionesService.getHabitaciones().subscribe({
            next: (data) => {
                this.listaHabitaciones = data;
            }
        });

        this.huespedesService.getHuespedes().subscribe({
            next: (data) => {
                this.listaHuespedes = data;
            }
        });
    }

    listarReservas(): void {
        this.reservasService.getReservas().subscribe({
            next: (data) => {
                this.listaReservas = data;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error al listar reservas', err)
        });
    }

    openModal(): void {
        this.modalText = 'Registrar Reserva';
        this.reservaForm.reset();
        this.modalInstance.show();
    }

    onSubmit(): void {
        if (this.reservaForm.invalid) return;

        const request: ReservaRequest = this.reservaForm.value;

        // Convert dates if necessary? HTML date input usually gives YYYY-MM-DD which is what LocalDate expects in JSON
        this.reservasService.postReserva(request).subscribe({
            next: (resp) => {
                this.listaReservas.push(resp);
                this.modalInstance.hide();
                Swal.fire('Registrado', 'Reserva creada exitosamente', 'success');
                this.listarReservas(); // Reload to ensure consistent state/fields
            },
            error: (err) => {
                Swal.fire('Error', err.error?.message || 'Error al crear reserva', 'error');
            }
        });
    }

    checkIn(id: number): void {
        this.reservasService.checkIn(id).subscribe({
            next: (resp) => {
                this.actualizarReservaEnLista(resp);
                Swal.fire('Check-in', 'Check-in realizado con éxito', 'success');
            },
            error: (err) => Swal.fire('Error', err.error?.message || 'Error en Check-in', 'error')
        });
    }

    checkOut(id: number): void {
        this.reservasService.checkOut(id).subscribe({
            next: (resp) => {
                this.actualizarReservaEnLista(resp);
                Swal.fire('Check-out', 'Check-out realizado con éxito', 'success');
            },
            error: (err) => Swal.fire('Error', err.error?.message || 'Error en Check-out', 'error')
        });
    }

    cancelar(id: number): void {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "La reserva será cancelada.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.reservasService.cancelarReserva(id).subscribe({
                    next: (resp) => {
                        this.actualizarReservaEnLista(resp);
                        Swal.fire('Cancelada', 'Reserva cancelada', 'success');
                    },
                    error: (err) => Swal.fire('Error', err.error?.message || 'Error al cancelar', 'error')
                });
            }
        });
    }

    eliminar(id: number): void {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.reservasService.deleteReserva(id).subscribe({
                    next: () => {
                        this.listaReservas = this.listaReservas.filter(r => r.id !== id);
                        Swal.fire('Eliminado', 'Reserva eliminada', 'success');
                    },
                    error: (err) => Swal.fire('Error', err.error?.message || 'Error al eliminar', 'error')
                });
            }
        });
    }

    private actualizarReservaEnLista(reserva: ReservaResponse): void {
        const idx = this.listaReservas.findIndex(r => r.id === reserva.id);
        if (idx !== -1) {
            this.listaReservas[idx] = reserva;
            this.cdr.detectChanges();
        }
    }

}
