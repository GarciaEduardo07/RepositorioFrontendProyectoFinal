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

import { HabitacionRequest, HabitacionResponse } from '../../models/Habitacion.model';
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

  listaTipoHabitacion = [
    { value: 'SENCILLA', label: 'Sencilla' },
    { value: 'DOBLE', label: 'Doble' },
    { value: 'SUITE', label: 'Suite' }
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
      numero: ['', [Validators.required, Validators.min(1)]],
      tipo: ['', Validators.required],
      estado: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]]
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

    this.habitacionForm.patchValue(habitacion);
    this.modalInstance.show();
  }

  onSubmit(): void {
    if (this.habitacionForm.invalid) return;

    const data: HabitacionRequest = this.habitacionForm.value;

    if (this.isEditMode && this.selectedHabitacion) {
      this.habitacionService
        .putHabitacion(data, this.selectedHabitacion.id)
        .subscribe({
          next: resp => {
            const index = this.listaHabitaciones.findIndex(
              h => h.id === resp.id
            );
            if (index !== -1) this.listaHabitaciones[index] = resp;

            this.modalInstance.hide();
            Swal.fire('Actualizada', 'Habitación actualizada correctamente', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No se pudo actualizar la habitación', 'error');
          }
        });
    } else {
      this.habitacionService.postHabitacion(data).subscribe({
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
}
