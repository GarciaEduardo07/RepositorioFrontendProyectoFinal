export interface AuthRequest {
    username: string,
    password: string
}

export interface AuthResponse {
    token: string
}

export interface JwtPayLoad {
    sub: string,
    exp: number,
    roles: string[]
}