import { Injectable } from '@angular/core';
import { UserLogin } from '../models/user-login.model';
import { Environment } from '../models/environment.model';

@Injectable()
export class UserService
{
    private login$: BehaviorSubject<UserLogin | null>;
    get userLoginAsObservable()
    {
        return this.login$.asObservable();
    }

    public get token(): HttpParams | null
    {
        const user: UserLogin | null = this.currentUser || null;
        if (user && user.Token)
        {
            return new HttpParams().set("Token", user.Token);
        } else
        {
            return null;
        }
    }

    public get currentUser(): UserLogin | null
    {
        const userLoginData: string = localStorage.getItem("user") || "";
        if (userLoginData.length > 0)
        {
            this.repository.userLogin = JSON.parse(userLoginData);
            return this.repository.userLogin;
        } else
        {
            return null;
        }
    }

    constructor(private readonly _enviroment: Environment,
        private readonly _router: Router)
    {
        this.login$ = new BehaviorSubject<UserLogin | null>(this.currentUser);
    }

    public saveUserLogin(loginUser: UserLogin): void
    {
        this.repository.userLogin = Object.assign({}, loginUser);
        localStorage.setItem("user", JSON.stringify(loginUser));
        this.login$.next(this.repository.userLogin);
    }

    public refreshToken(): void { }

    public userLogout(redirect: boolean = true, returnUrl: string = ""): void
    {
        this.repository.userLogin = null;
        localStorage.clear();
        this.login$.next(this.repository.userLogin);
        if (redirect === true)
        {
            const url = this._enviroment?.homeUrl as string;
            const pattern = new RegExp(
                "^(http(s)?:\\/\\/)?" + // protocol
                "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
                "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
                "(\\:\\d+)?(\\/#)(\\/[-a-z\\d%_.~+]*)*" + // port or hashtag and path
                "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
                "(\\#[-a-z\\d_]*)?$",
                "i"
            );
            if (!!pattern.test(url))
            {
                window.location.href =
                    url + (returnUrl === "" ? "" : `?returnUrl=${returnUrl}`);
            } else
            {
                this._router.navigate(
                    [url],
                    returnUrl === ""
                        ? {}
                        : {
                            queryParams: { returnUrl: returnUrl },
                        }
                );
            }
        }
    }
}
