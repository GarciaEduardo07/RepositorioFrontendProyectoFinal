export interface UsuarioRequest {
    username: string;
    password?: string; 
    roles: string[];
}

export interface UsuarioResponse {
    id: number;
    username: string;
    roles: string[];
}