import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Toaster } from "../modules/toast-notification";
import { UserService } from "./user.service";

@Injectable({
  providedIn: "root",
})
export class ClientService
{
  private loadingCounter$: BehaviorSubject<number>;

  get loadingAsObservable(): Observable<number>
  {
    return this.loadingCounter$.asObservable();
  }

  get currentUser() {
    return this._userService?.currentUser;
  }

  constructor(
    private readonly _userService: UserService,
    public readonly toaster: Toaster,
    public readonly http: HttpClient,
  )
  {
    this.loadingCounter$ = new BehaviorSubject<number>(0);
  }

  public startLoading(): void
  {
    window.requestAnimationFrame(() =>
    {
      this.loadingCounter$.next(1);
    });
  }

  public finishLoading(): void
  {
    window.requestAnimationFrame(() => this.loadingCounter$.next(0));
  }



}
