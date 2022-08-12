import { Injectable } from "@angular/core";
import { IDataBus } from "@core/models";
import { Repository } from "@core/models/repository.model";
import { ReplaySubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class RepositoryService
{
  private sharedBus$: ReplaySubject<IDataBus>;
  private repository!: Repository;


  constructor()
  {
    this.sharedBus$ = new ReplaySubject<IDataBus>();
    this.repository = { dateTime: new Date() };
  }

  get busAsObservable()
  {
    return this.sharedBus$.asObservable();
  }

  public sendOnBus(sender: string, receiver: string, data: any): void
  {
    this.sharedBus$.next({ receiver: receiver, sender: sender, data: data });
  }

  public setData(key: string, data: any): Repository
  {
    this.repository[key] = data;
    return this.repository;
  }

  public getData(key: string): any | Repository | null
  {
    return key ? this.repository[key] ?? null : this.repository;
  }

}
