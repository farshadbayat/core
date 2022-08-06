import { Injectable } from '@angular/core';
import
  {
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    CanActivate,
  } from '@angular/router';
import { Observable } from 'rxjs';
import
  {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpResponse,
  } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ClientService } from './client.service';
import { UserService } from './user.service';
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, HttpInterceptor
{
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>>
  {
    return next.handle(req).pipe(
      map((event: HttpEvent<any>) =>
      {
        if (event instanceof HttpResponse)
        {
        }
        return event;
      })
    );
  }

  constructor(private readonly _userService: UserService) { }

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
  {
    if (this._userService.token)
    {
      return true;
    }
    this._userService.userLogout(true, state.url);
    return false;
  }
}
