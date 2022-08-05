import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { Dictionary } from "../models/dictionary.model";
import { Toaster } from "../modules/toast-notification";
import { IDataBus } from "../models/data-bus.model";
import { DataRepository } from "../classes/DataRepository";
@Injectable({
  providedIn: "root",
})
export class ClientService
{
  private loadingCounter$: BehaviorSubject<number>;
  private sharedBus$: ReplaySubject<IDataBus>;
  private repository: DataRepository = new DataRepository();
  private access: Dictionary<Dictionary<boolean>> = {};

  get loadingAsObservable(): Observable<number>
  {
    return this.loadingCounter$.asObservable();
  }

  constructor(
    public toaster: Toaster,
    public http: HttpClient
  )
  {
    this.loadingCounter$ = new BehaviorSubject<number>(0);
    this.sharedBus$ = new ReplaySubject<IDataBus>();
    this.repository.dateTime = new Date();
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

  get busAsObservable()
  {
    return this.sharedBus$.asObservable();
  }

  public sendOnBus(sender: string, receiver: string, data: any): void
  {
    this.sharedBus$.next({ receiver: receiver, sender: sender, data: data });
  }



  public setData(key: string, data: any): DataRepository
  {
    this.repository[key] = data;
    this.sendOnBus(key, key, data);
    return this.repository;
  }

  public getData(key: string): any
  {
    return this.repository[key] ?? null;
  }


}