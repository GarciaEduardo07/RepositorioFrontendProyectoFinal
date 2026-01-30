import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import {
  HabitacionRequest,
  HabitacionResponse,
  TipoHabitacion,
  EstadoHabitacion
} from '../../models/Habitacion.model';
import { HabitacionesService } from '../../services/habitaciones.service';
import { AuthService } from '../../services/auth.service';
import { Roles } from '../../constants/Roles';

declare var bootstrap: any;

@Component({
  selector: 'app-habitaciones',
  standalone: false,
  templateUrl: './habitaciones.component.html',
  styleUrl: './habitaciones.component.css'
})
export class HabitacionesComponent implements OnInit, AfterViewInit {

  modalText = 'Registrar Habitación';

  listaHabitaciones: HabitacionResponse[] = [];

  // Dropdown options with ID mapping
  listaTipoHabitacion = [
    { id: TipoHabitacion.SENCILLA, label: 'Sencilla' },
    { id: TipoHabitacion.DOBLE, label: 'Doble' },
    { id: TipoHabitacion.SUITE, label: 'Suite' },
    { id: TipoHabitacion.KING, label: 'King' }
  ];

  listaEstadoHabitacion = [
    { id: EstadoHabitacion.DISPONIBLE, label: 'Disponible' },
    { id: EstadoHabitacion.OCUPADA, label: 'Ocupada' },
    { id: EstadoHabitacion.LIMPIEZA, label: 'Limpieza' },
    { id: EstadoHabitacion.MANTENIMIENTO, label: 'Mantenimiento' }
  ];

  isEditMode = false;
  selectedHabitacion: HabitacionResponse | null = null;
  showActions = false;

  @ViewChild('habitacionModalRef')
  habitacionModalEl!: ElementRef;

  habitacionForm: FormGroup;
  private modalInstance!: any;

  constructor(
    private fb: FormBuilder,
    private habitacionService: HabitacionesService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.habitacionForm = this.fb.group({
      id: [null],
      numero: ['', [Validators.required, Validators.maxLength(10)]],
      idTipo: ['', Validators.required],  // Bind to ID
      idEstado: ['', Validators.required], // Bind to ID
      precioNoche: ['', [Validators.required, Validators.min(0.01)]],
      capacidad: ['', [Validators.required, Validators.min(1)]] // Added capacidade
    });
  }

  /* ===================== LIFECYCLE ===================== */

  ngOnInit(): void {
    this.listarHabitaciones();

    if (this.authService.hasRole(Roles.ADMIN)) {
      this.showActions = true;
    }
  }

  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(
      this.habitacionModalEl.nativeElement,
      { keyboard: false }
    );

    this.habitacionModalEl.nativeElement.addEventListener(
      'hidden.bs.modal',
      () => this.resetForm()
    );
  }

  /* ===================== CRUD ===================== */

  listarHabitaciones(): void {
    this.habitacionService.getHabitaciones().subscribe({
      next: resp => {
        this.listaHabitaciones = resp;
        this.cdr.detectChanges();
      },
      error: err => console.error('Error al obtener habitaciones', err)
    });
  }

  toggleForm(): void {
    this.resetForm();
    this.modalText = 'Registrar Habitación';
    this.modalInstance.show();
  }

  editHabitacion(habitacion: HabitacionResponse): void {
    this.isEditMode = true;
    this.selectedHabitacion = habitacion;
    this.modalText = `Editando Habitación #${habitacion.numero}`;

    // Reverse mapping: String -> ID
    const tipoId = this.findTipoId(habitacion.tipo);
    const estadoId = this.findEstadoId(habitacion.estado);

    this.habitacionForm.patchValue({
      id: habitacion.id,
      numero: habitacion.numero,
      idTipo: tipoId,
      idEstado: estadoId,
      precioNoche: habitacion.precioNoche,
      capacidad: habitacion.capacidad
    });

    this.modalInstance.show();
  }

  onSubmit(): void {
    if (this.habitacionForm.invalid) return;

    // Form already has the correct structure for Request thanks to updated controls
    const request: HabitacionRequest = {
      numero: this.habitacionForm.value.numero,
      idTipo: Number(this.habitacionForm.value.idTipo),
      idEstado: Number(this.habitacionForm.value.idEstado),
      precioNoche: this.habitacionForm.value.precioNoche,
      capacidad: this.habitacionForm.value.capacidad
    };

    if (this.isEditMode && this.selectedHabitacion) {
      this.habitacionService
        .putHabitacion(request, this.selectedHabitacion.id)
        .subscribe({
          next: resp => {
            // Update local list
            const index = this.listaHabitaciones.findIndex(h => h.id === resp.id);
            if (index !== -1) this.listaHabitaciones[index] = resp;

            this.modalInstance.hide();
            Swal.fire('Actualizada', 'Habitación actualizada correctamente', 'success');
            // Refresh list to be sure
            this.listarHabitaciones();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo actualizar la habitación', 'error');
          }
        });
    } else {
      this.habitacionService.postHabitacion(request).subscribe({
        next: resp => {
          this.listaHabitaciones.push(resp);
          this.modalInstance.hide();
          Swal.fire('Registrada', 'Habitación registrada correctamente', 'success');
        },
        error: err => {
          console.error(err);
          Swal.fire(
            'Error',
            err.error?.mensaje || 'Error al registrar habitación',
            'error'
          );
        }
      });
    }
  }

  deleteHabitacion(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'La habitación será eliminada permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.habitacionService.deleteHabitacion(id).subscribe({
          next: () => {
            this.listaHabitaciones =
              this.listaHabitaciones.filter(h => h.id !== id);
            Swal.fire('Eliminada', 'Habitación eliminada correctamente', 'success');
          }
        });
      }
    });
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedHabitacion = null;
    this.habitacionForm.reset();
  }

  // Helpers to find ID from String (Backend returns strings like "SENCILLA")
  private findTipoId(tipoStr: string): number | null {
    const match = this.listaTipoHabitacion.find(t => t.id === TipoHabitacion[tipoStr as keyof typeof TipoHabitacion]);
    // If backend returns "SENCILLA", TipoHabitacion['SENCILLA'] is 1.
    // If backend returns "Sencilla" (case diff), we might need normalization.
    // Usually Java enums are serialized as uppercase.
    return TipoHabitacion[tipoStr as keyof typeof TipoHabitacion] || null;
  }

  private findEstadoId(estadoStr: string): number | null {
    return EstadoHabitacion[estadoStr as keyof typeof EstadoHabitacion] || null;
  }
}
