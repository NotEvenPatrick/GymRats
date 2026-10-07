import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { TokenStorageService } from "../../features/auth/services/token-storage.service";

export const authInterceptor: HttpInterceptorFn = (request, next) => {
    const tokenStorageService = inject(TokenStorageService);
    const token = tokenStorageService.getToken();
    if(token) {
        const authReqest = request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
        });
        return next(authReqest);
    }
    return next(request);
};