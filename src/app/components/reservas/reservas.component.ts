import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

    todayDate: string = '';
    minFechaSalida: string = '';

    constructor(
        private reservasService: ReservasService,
        private habitacionesService: HabitacionesService,
        private huespedesService: HuespedesService,
        private authService: AuthService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router
    ) {
        const today = new Date();
        this.todayDate = today.toISOString().split('T')[0];
        this.minFechaSalida = this.todayDate;

        this.reservaForm = this.fb.group({
            idHuesped: ['', Validators.required],
            idHabitacion: ['', Validators.required],
            fechaEntrada: ['', Validators.required],
            fechaSalida: ['', Validators.required]
        });

        this.reservaForm.get('fechaEntrada')?.valueChanges.subscribe(val => {
            if (val) {
                const currentSalida = this.reservaForm.get('fechaSalida')?.value;
                if (currentSalida && currentSalida < val) {
                    this.reservaForm.patchValue({ fechaSalida: '' });
                }
                this.minFechaSalida = val;
            }
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

        this.route.queryParams.subscribe(params => {
            const idHuesped = params['idHuesped'];
            if (idHuesped) {
                // Short delay to ensure modal checks are ready if needed, usually direct call works
                // But openModal resets form, so we must patch AFTER
                this.openModal();
                this.reservaForm.patchValue({ idHuesped: Number(idHuesped) });

                // Clear query param to avoid reopening on refresh
                this.router.navigate([], {
                    queryParams: { idHuesped: null },
                    queryParamsHandling: 'merge'
                });
            }
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

        this.reservasService.postReserva(request).subscribe({
            next: (resp) => {
                this.listaReservas.push(resp);
                this.modalInstance.hide();
                Swal.fire('Registrado', 'Reserva creada exitosamente', 'success');
                this.listarReservas();
            },
            error: (err) => {
                console.error(err);
                let msg = 'Error al crear reserva';

                if (err.error?.detalles) {
                    const detalles = err.error.detalles;
                    msg = Object.values(detalles).join('\n');
                } else if (err.error?.mensaje) {
                    msg = err.error.mensaje;
                } else if (err.error?.message) {
                    msg = err.error.message;
                }

                Swal.fire('Error', msg, 'error');
            }
        });
    }

    checkIn(id: number): void {
        const reserva = this.listaReservas.find(r => r.id === id);
        if (!reserva) return;

        if (reserva.fechaEntrada < this.todayDate) {
            Swal.fire({
                title: '¿Check-in Tardío?',
                text: `La fecha de entrada (${reserva.fechaEntrada}) ya ha pasado. ¿Desea continuar?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, continuar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.executeCheckIn(id);
                }
            });
        } else {
            this.executeCheckIn(id);
        }
    }

    private executeCheckIn(id: number): void {
        this.reservasService.checkIn(id).subscribe({
            next: (resp) => {
                this.actualizarReservaEnLista(resp);
                Swal.fire('Check-in', 'Check-in realizado con éxito', 'success');
            },
            error: (err) => Swal.fire('Error', err.error?.message || 'Error en Check-in', 'error')
        });
    }

    checkOut(id: number): void {
        const reserva = this.listaReservas.find(r => r.id === id);
        if (!reserva) return;

        if (this.todayDate > reserva.fechaSalida) {
            Swal.fire({
                title: '¿Check-out Retrasado?',
                text: `La fecha de salida (${reserva.fechaSalida}) ya pasó. ¿Desea finalizar la estancia?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, check-out',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.executeCheckOut(id);
                }
            });
        } else {
            this.executeCheckOut(id);
        }
    }

    private executeCheckOut(id: number): void {
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
