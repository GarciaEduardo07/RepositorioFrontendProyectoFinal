import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HuespedRequest, HuespedResponse } from '../../models/Huesped.model';
import { HuespedesService } from '../../services/huespedes.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { Roles } from '../../constants/Roles';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';


declare var bootstrap: any;

@Component({
  selector: 'app-huespedes',
  standalone: false,
  templateUrl: './huespedes.component.html',
  styleUrl: './huespedes.component.css'
})
export class HuespedesComponent implements OnInit, AfterViewInit {

  modalText: string = 'Registrar Huesped';

  listaDocumentos: string[] = [
    'INE', 'PASAPORTE', 'LICENCIA'
  ];


  listaHuespedes: HuespedResponse[] = [];

  isEditMode: boolean = false;
  selectedHuesped: HuespedResponse | null = null;
  showActions: boolean = false;

  @ViewChild('huespedModalRef')
  huespedModalEl!: ElementRef;
  huespedForm: FormGroup;

  private modalInstance!: any;

  constructor(private fb: FormBuilder, private huespedesService: HuespedesService, private authService: AuthService, private cdr: ChangeDetectorRef, private router: Router) {
    this.huespedForm = this.fb.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^(?!\s*$).+/)]],
      apellidoPaterno: ['', [Validators.required, Validators.maxLength(100), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      apellidoMaterno: ['', [Validators.required, Validators.maxLength(100), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      email: ['', [Validators.required, Validators.maxLength(50), Validators.email]],
      telefono: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(10),
          Validators.pattern(/^[0-9]{10}$/)
        ]
      ],
      documento: ['', [Validators.required]],
      nacionalidad: ['', [Validators.required]]
    });
  }

  listaNacionalidades = [
    { value: 'MEXICO', label: 'México' },
    { value: 'ESTADOS_UNIDOS', label: 'Estados Unidos' },
    { value: 'CANADA', label: 'Canadá' },
    { value: 'ARGENTINA', label: 'Argentina' },
    { value: 'BRASIL', label: 'Brasil' },
    { value: 'COLOMBIA', label: 'Colombia' },
    { value: 'CHILE', label: 'Chile' },
    { value: 'PERU', label: 'Perú' },
    { value: 'ESPAÑA', label: 'España' },
    { value: 'FRANCIA', label: 'Francia' },
    { value: 'ALEMANIA', label: 'Alemania' },
    { value: 'ITALIA', label: 'Italia' },
    { value: 'REINO_UNIDO', label: 'Reino Unido' },
    { value: 'JAPON', label: 'Japón' },
    { value: 'CHINA', label: 'China' },
    { value: 'COREA_DEL_SUR', label: 'Corea del Sur' },
    { value: 'AUSTRALIA', label: 'Australia' },
    { value: 'OTRA', label: 'Otro' }
  ];

  ngOnInit(): void {
    this.listarHuespedes();
    if (this.authService.hasRole(Roles.ADMIN))
      this.showActions = true;
  }
  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(this.huespedModalEl.nativeElement, { keyboard: false });
    this.huespedModalEl.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.resetForm();
    });
  }

  listarHuespedes(): void {
    this.huespedesService.getHuespedes().subscribe({
      next: resp => {
        // Asignación directa: Angular detectará el cambio de referencia y renderizará la tabla
        this.listaHuespedes = resp;
        console.table(this.listaHuespedes);
        this.cdr.detectChanges();
      },
      error: err => console.error('Error al obtener huéspedes:', err)
    });
  }

  toggleForm(): void {
    this.resetForm();
    this.modalText = 'Registrar Huesped';
    this.modalInstance.show();
  }

  editHuesped(huesped: HuespedResponse): void {
    this.isEditMode = true;
    this.selectedHuesped = huesped;
    this.modalText = 'Editando Huesped: ' + huesped.nombre;

    // Normalize nationalidad to match dropdown values
    const normalizedNacionalidad = this.findNacionalidadValue(huesped.nacionalidad);

    this.huespedForm.patchValue({
      ...huesped,
      nacionalidad: normalizedNacionalidad || huesped.nacionalidad
    });
    this.modalInstance.show();
  }

  private findNacionalidadValue(incoming: string): string | undefined {
    if (!incoming) return undefined;
    // 1. Try exact match
    const exact = this.listaNacionalidades.find(n => n.value === incoming);
    if (exact) return exact.value;

    // 2. Try match ignoring case or underscores vs spaces
    // e.g. "ESTADOS_UNIDOS" vs "ESTADOS UNIDOS" or "Estados Unidos"
    const normalizedIncoming = incoming.toUpperCase().replace(/\s+/g, '_');

    const match = this.listaNacionalidades.find(n =>
      n.value === normalizedIncoming ||
      n.label.toUpperCase() === incoming.toUpperCase());

    return match ? match.value : undefined;
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedHuesped = null;
    this.huespedForm.reset();
  }

  onSubmit(): void {
    if (this.huespedForm.invalid) return;

    const huespedData: HuespedRequest = this.huespedForm.value;

    if (this.isEditMode && this.selectedHuesped) {

      this.huespedesService.putHuesped(huespedData, this.selectedHuesped.id)
        .subscribe({
          next: (resp) => {
            const index = this.listaHuespedes.findIndex(h => h.id === resp.id);
            if (index !== -1) this.listaHuespedes[index] = resp;

            this.modalInstance.hide();
            Swal.fire('Actualizado', 'Huésped actualizado correctamente', 'success');
          },
          error: (err) => {
            Swal.fire('Error', err.error?.mensaje || 'No se pudo actualizar el huésped', 'error');
          }
        });

    } else {

      this.huespedesService.postHuespedesComponent(huespedData)
        .subscribe({
          next: (resp) => {
            this.listaHuespedes.push(resp);
            this.modalInstance.hide();

            Swal.fire({
              title: 'Registrado',
              text: 'Huésped registrado correctamente. ¿Desea crear una reserva para este huésped?',
              icon: 'success',
              showCancelButton: true,
              confirmButtonText: 'Sí, crear reserva',
              cancelButtonText: 'No, finalizar'
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/dashboard/reservas'], { queryParams: { idHuesped: resp.id } });
              }
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', err.error?.mensaje || 'Error al registrar huésped', 'error');
          }
        });
    }
  }

  deleteHuesped(idHuesped: number): void {
    Swal.fire({
      title: 'Estás seguro?',
      text: 'El huesped será eliminado permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.huespedesService.deleteHuesped(idHuesped).subscribe({
          next: () => {
            this.listaHuespedes = this.listaHuespedes.filter(h => h.id !== idHuesped);
            Swal.fire('eliminado', 'huesped eliminado correctamente', 'success');
          }
        })
      }
    })
  }
}


