import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Toast } from '../toast';

@Component({
  templateUrl: './basic-toast-content.component.html',
  styleUrls: ['./basic-toast-content.component.scss'],
})
export class BasicToastContentComponent implements OnChanges {
  @Input() toast: Toast | undefined;
  textList: string[] = [];
  ngOnChanges(changes: SimpleChanges): void
  {
    if(this.toast != null) {
      this.textList = Array.isArray(this.toast.text) ? this.toast.text as string[] : [];
    }
  }
}
