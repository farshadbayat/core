import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  Input,
  OnDestroy,
  OnInit,
  Type,
  ViewContainerRef
} from '@angular/core';
import { Toast } from '../toast';

@Directive({
  selector: '[toastContent]',
})
export class ToastContentDirective implements OnInit, OnDestroy {

  @Input() toast: Toast = new Toast({  }, );
  private _componentRef: ComponentRef<any> | null = null;

  constructor(
      private _viewContainerRef: ViewContainerRef
  ) {
  }

  ngOnInit(): void {
    /* Deprecated in angular 13 */ //const componentFactory = this._componentFactoryResolver.resolveComponentFactory(this.toast.component as Type<any>);
    this._componentRef = this._viewContainerRef.createComponent(this.toast.component as Type<any>);
    this._componentRef.instance.toast = this.toast;
  }

  ngOnDestroy(): void {
    if (this._componentRef) {
      this._componentRef.destroy();
      this._componentRef = null;
    }
  }
}
