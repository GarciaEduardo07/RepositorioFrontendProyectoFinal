export const localhost: string = 'http://localhost';

export const environment = {
    apiUrl: localhost.concat(':8090/api/'),
    authUrl: localhost.concat(':9000/api/login'),
    apiUsuarios: localhost.concat(':9000/admin/usuarios')
}