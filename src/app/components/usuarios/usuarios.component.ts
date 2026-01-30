import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioResponse, UsuarioRequest } from '../../models/Usuario.model';
import { UsuariosService } from '../../services/usuarios.service';
import { Roles } from '../../constants/Roles';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit, AfterViewInit {

  listaUsuarios: UsuarioResponse[] = [];
  usuarioForm: FormGroup;
  modalText: string = 'Nuevo Usuario';
  private modalInstance!: any;
  
  rolesDisponibles = [
    { label: 'Recepcionista', value: Roles.USER },
    { label: 'Administrador', value: Roles.ADMIN }
  ];

  @ViewChild('usuarioModalRef') usuarioModalEl!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService
  ) {
    this.usuarioForm = this.fb.group({
      username: ['', [
        Validators.required, 
        Validators.minLength(5), 
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9]+$/)
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8)
      ]],
      role: [Roles.USER, [Validators.required]] 
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(this.usuarioModalEl.nativeElement, { keyboard: false });
    this.usuarioModalEl.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.resetForm();
    });
  }

  cargarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => this.listaUsuarios = data,
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  openModal(): void {
    this.resetForm();
    this.modalInstance.show();
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid) return;

    const formValue = this.usuarioForm.value;
    const nuevoUsuario: UsuarioRequest = {
      username: formValue.username,
      password: formValue.password,
      roles: [formValue.role] 
    };

    this.usuariosService.createUsuario(nuevoUsuario).subscribe({
      next: (resp) => {
        Swal.fire('Creado', `Usuario ${resp.username} creado con éxito`, 'success');
        this.listaUsuarios.push(resp);
        this.modalInstance.hide();
      },
      error: (err) => {
        if (err.status === 409) {
             Swal.fire('Error', 'El nombre de usuario ya existe', 'error');
        }
      }
    });
  }

  deleteUsuario(usuario: UsuarioResponse): void {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Se eliminará permanentemente a ${usuario.username}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        
        this.usuariosService.deleteUsuario(usuario.username).subscribe({
          next: () => {
            this.listaUsuarios = this.listaUsuarios.filter(u => u.username !== usuario.username);
            Swal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
          }
        });
      }
    });
  }

  resetForm(): void {
    this.usuarioForm.reset({
      role: Roles.USER 
    });
  }
}