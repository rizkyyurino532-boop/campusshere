/**
 * Kelas Error khusus HTTP agar Service & Controller dapat melempar error
 * dengan status code dan kode error yang konsisten.
 */
export class HttpError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
