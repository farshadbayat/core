import
{
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from "@angular/common/http";
import { map, catchError, tap } from "rxjs/operators";
import { ClientService } from "../services/client.service";
import { Observable, of, throwError } from "rxjs";
import { IResponse } from "../models/response.model";
import { ParamsHandler } from "../classes/params-handler";
import { ServiceLocator } from "../services/locator.service";
import { IErrorHistory } from "../models/error-history.model";
import { Environment, IEnvironment } from "../models/environment.model";
import { ToastType } from "../modules/toast-notification";
import { ErrorHandling } from "./error-handling";
import { UserService } from "@core/services/user.service";

export function Api(
  verb: HttpVerb = "GET",
  global: boolean = false
): RequestBuilder
{
  return new RequestBuilder(verb, global);
}

export declare type HttpVerb = "GET" | "POST" | "DELETE" | "PUT";
export declare type CacheMode = "none" | "memory" | "localStorage" | "sessionStorage";
export declare type ModuleName = "System" | string;
export declare type ContentType =
  | "application/json"
  | "text/plain"
  | "application/octet-stream"
  | "multipart/form-data"
  | string;
export class RequestBuilder
{
  private static _globalRequestID = 0;
  private static _errorHistory: IErrorHistory[] = [];
  private _moduleName: ModuleName | string = "";
  private _apiSignature: string = "";
  private _version: string = "v1";
  private _controllerName: string = "";
  private _actionName: string = "";
  private _urlParameters: ParamsHandler;
  private _bodyParameters: ParamsHandler;
  private _formData: FormData | null = null;
  private _headerParameters: ParamsHandler | null = null;
  private _requestID: number;
  private _baseURL: string | null = null;
  private _cacheMode: CacheMode = "none";
  private _loading: boolean;
  private _showMessage: boolean;
  private _encodeQueryParam: boolean;
  private _ignoreNullParam: boolean;
  private _contentType: ContentType = "application/json";
  private _bearer: string;
  private readonly _environment: IEnvironment;
  private readonly _clientService: ClientService;
  private readonly _userService: UserService;

  constructor(private verb: HttpVerb = "GET", public global: boolean = false)
  {
    this._requestID = RequestBuilder._globalRequestID++;
    this._bodyParameters = new ParamsHandler();
    this._urlParameters = new ParamsHandler();
    this._showMessage = true;
    this._loading = true;
    this._ignoreNullParam = true;
    this._clientService = ServiceLocator.injector.get(ClientService);
    this._environment = ServiceLocator.injector.get(Environment);
    this._apiSignature = this._environment?.apiSignatureName ?? "";
    this._moduleName = this._environment?.moduleName ?? "";
    this._bearer = this._environment?.bearer ?? "";
    this._encodeQueryParam = this._environment?.encodeQueryParam ?? true;
  }

  get requestID()
  {
    return this._requestID;
  }

  get errorHistory(): IErrorHistory[]
  {
    return RequestBuilder._errorHistory;
  }

  public get(): RequestBuilder
  {
    this.verb = "GET";
    return this;
  }

  public post(): RequestBuilder
  {
    this.verb = "POST";
    return this;
  }

  public delete(): RequestBuilder
  {
    this.verb = "DELETE";
    return this;
  }

  public put(): RequestBuilder
  {
    this.verb = "PUT";
    return this;
  }

  public baseURL(baseURL: string | null): RequestBuilder
  {
    this._baseURL = baseURL;
    this._version = "";
    this._apiSignature = "";
    return this;
  }

  public module(name: ModuleName): RequestBuilder
  {
    this._moduleName = name;
    return this;
  }

  public version(name: string): RequestBuilder
  {
    this._version = name;
    return this;
  }

  public contentType(conteType: ModuleName): RequestBuilder
  {
    this._contentType = conteType;
    return this;
  }

  public showLoading(show: boolean = true): RequestBuilder
  {
    this._loading = show;
    return this;
  }

  public showMessage(show: boolean = true): RequestBuilder
  {
    this._showMessage = show;
    return this;
  }

  public cacheMode(cacheMode: CacheMode)
  {
    this._cacheMode = cacheMode;
  }

  public controller(controllerName: string): RequestBuilder
  {
    this._controllerName = controllerName;
    return this;
  }

  public action(actionName: string): RequestBuilder
  {
    this._actionName = actionName;
    return this;
  }

  public setBody(data: ParamsHandler): RequestBuilder
  {
    this._bodyParameters = data;
    return this;
  }

  public addBody(key: any, value: any): RequestBuilder
  {
    if (this._bodyParameters === null || this._bodyParameters === undefined)
    {
      this._bodyParameters = new ParamsHandler();
    }
    this._bodyParameters.addParam(key, value);
    return this;
  }

  public removeBody(key: any): RequestBuilder
  {
    if (this._bodyParameters === null || this._bodyParameters === undefined)
    {
      this._bodyParameters = new ParamsHandler();
    }
    this._bodyParameters.removeParam(key);
    return this;
  }

  public setParam(param: ParamsHandler): RequestBuilder
  {
    this._urlParameters = param;
    return this;
  }

  public addParam(key: any, value: any): RequestBuilder
  {
    if (this._urlParameters === null || this._urlParameters === undefined)
    {
      this._urlParameters = new ParamsHandler();
    }
    this._urlParameters.addParam(key, value);
    return this;
  }

  public removeParam(key: any): RequestBuilder
  {
    if (this._bodyParameters === null || this._bodyParameters === undefined)
    {
      this._bodyParameters = new ParamsHandler();
    }
    this._bodyParameters.removeParam(key);
    return this;
  }

  public AddFile(
    name: string,
    file: File,
    reportProgress: boolean = false,
    observe: "events" | null = null
  ): RequestBuilder
  {
    this._contentType = "multipart/form-data";
    return this.addFormData(name, file, file.name);
  }

  public addFormData(
    key: string,
    value: string | Blob | File,
    name: string = ""
  ): RequestBuilder
  {
    if (this._formData === null)
    {
      this._formData = new FormData();
    }
    this._formData.append(key, value, name);
    return this;
  }

  public setFormData(key: string, value: string | Blob)
  {
    if (this._formData === null)
    {
      this._formData = new FormData();
    }
    this._formData.set(key, value);
    return this;
  }

  public removeFormData(key: string)
  {
    if (this._formData !== null)
    {
      this._formData.delete(key);
    }
    return this;
  }

  public setHeader(param: ParamsHandler): RequestBuilder
  {
    this._headerParameters = param;
    return this;
  }

  public addHeader(key: any, value: any): RequestBuilder
  {
    if (
      this._headerParameters === null ||
      this._headerParameters === undefined
    )
    {
      this._headerParameters = new ParamsHandler();
    }
    this._headerParameters.addParam(key, value);
    return this;
  }

  public ignoreNull(ignore: boolean)
  {
    this._ignoreNullParam = ignore;
    return this;
  }

  public getUrl(): string
  {
    let url = this._baseURL ?? this._environment.baseEndpoint;
    url = url.substring(url.length - 1) === "/" ? url : url + "/";
    let urlPath = this._environment?.urlPathSchema;
    urlPath = urlPath.replace(
      "{MODULE_NAME}/",
      this._moduleName ? `${this._moduleName}/` : ""
    );
    urlPath = urlPath.replace(
      "{API_SIGNATURE_NAME}/",
      this._apiSignature ? `${this._apiSignature}/` : ""
    );
    urlPath = urlPath.replace(
      "{API_VERSION}/",
      this._version ? `${this._version}/` : ""
    );
    urlPath = urlPath.replace(
      "{CONTROLLER_NAME}/",
      this._controllerName ? `${this._controllerName}/` : ""
    );
    urlPath = urlPath.replace(
      "{ACTION_NAME}",
      this._actionName ? this._actionName : ""
    );
    return url + urlPath;
  }

  public call(): Observable<IResponse<any>>
  {
    if (ServiceLocator?.injector === null)
    {
      throw new Error("Service Locator is not initiation yet.");
    }

    const hasParam =
      this._urlParameters !== undefined && this._urlParameters.count() > 0;
    const urlWithParams =
      this.getUrl() +
      (hasParam
        ? "?" +
        this._urlParameters.urlParameters(
          this._ignoreNullParam,
          this._encodeQueryParam
        )
        : "");
    let headerItems: any = { "Content-Type": this._contentType };
    let paramItems: HttpParams = new HttpParams();

    /* Note in post FormData (ex: Uploading File) header should not be sent */
    if (this._formData == null)
    {
      if (this._userService.currentUser !== null)
      {
        headerItems = {
          ...headerItems,
          ...{
            Authorization: `${this._bearer} ${this._userService.currentUser?.Token}`,
          },
        };
      }
      if (this._headerParameters != null)
      {
        headerItems = {
          ...headerItems,
          ...this._headerParameters.toJson(true),
        };
      }
    } else if (this._formData !== null)
    {
      headerItems = null; /* Must null in Form Data */
      if (this._userService.currentUser !== null)
      {
        headerItems = {
          Authorization: `${this._bearer} ${this._userService.currentUser?.Token}`,
        };
        paramItems.append(
          "Authorization",
          `${this._bearer} ${this._userService.currentUser?.Token}`
        );
      }
    }

    if (this._loading)
    {
      this._clientService.startLoading();
    }

    if (this.verb === "GET")
    {
      return this._clientService.http
        .get<IResponse<any>>(urlWithParams, {
          headers: new HttpHeaders(headerItems),
        })
        .pipe(
          map(this.handlePipeMap),
          catchError((error) => this.errorHandling(error)),
          tap((resp) => this.messageHandling(resp))
        );
    } else if (this.verb === "POST")
    {
      const data = this._formData ?? this._bodyParameters.toJson();
      return this._clientService.http
        .post<IResponse<any>>(urlWithParams, data, {
          headers: new HttpHeaders(headerItems),
          params: paramItems,
        })
        .pipe(
          map(this.handlePipeMap),
          catchError((error) => this.errorHandling(error)),
          tap((resp) => this.messageHandling(resp))
        );
    } else if (this.verb === "PUT")
    {
      const data = this._formData ?? this._bodyParameters.toJson();
      return this._clientService.http
        .put<IResponse<any>>(urlWithParams, data, {
          headers: new HttpHeaders(headerItems),
          params: paramItems,
        })
        .pipe(
          map(this.handlePipeMap),
          catchError((error) => this.errorHandling(error)),
          tap((resp: IResponse<any>) => this.messageHandling(resp))
        );
    } else if (this.verb === "DELETE")
    {
      return this._clientService.http
        .delete<IResponse<any>>(urlWithParams, {
          headers: new HttpHeaders(headerItems),
        })
        .pipe(
          map(this.handlePipeMap),
          catchError((error) => this.errorHandling(error)),
          tap((resp: IResponse<any>) => this.messageHandling(resp))
        );
    } else if (this.verb === "PATCH")
    {
      return this._clientService.http
        .patch<IResponse<any>>(urlWithParams, this._bodyParameters.toJson(), {
          headers: new HttpHeaders(headerItems),
        })
        .pipe(
          map(this.handlePipeMap),
          catchError((error) => this.errorHandling(error)),
          tap((resp: IResponse<any>) => this.messageHandling(resp))
        );
    } else
    {
      return of();
    }
  }

  private messageHandling(resp: IResponse<any>)
  {
    if (this._loading === true)
    {
      this._clientService.finishLoading();
    }
    if (resp.Messages)
    {
      this.openToast(resp.Success? "success" : "danger", "", resp.Messages);
    }
  }

  private handlePipeMap(resp: IResponse<any>): IResponse<any>
  {
    if (resp?.Success === false)
    {
      throw { message: resp.Messages, status: 0 };
    } else
    {
      return resp;
    }
  }

  private errorHandling(error: HttpErrorResponse): Observable<any>
  {
    if (this._environment.debug === true)
    {
      RequestBuilder._errorHistory.push({ request: this, error: error });
    }
    if (this._loading === true)
    {
      this._clientService.finishLoading();
    }
    const { type, caption, text } = ErrorHandling(error);
    this.openToast(type, caption, text);
    return of(error);
  }

  private openToast(type: ToastType, caption: string, text: string | string[]): void
  {
    if (this._showMessage !== false && this._environment.debug === true)
    {
      this._clientService.toaster.open({
        type: type,
        caption: caption,
        text: text,
      });
    }
  }
}
