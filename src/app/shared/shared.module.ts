import { NgModule } from '@angular/core';
import { SubmitOnEnterDirective } from './submit-on-enter.directive';

@NgModule({
  declarations: [SubmitOnEnterDirective],
  exports: [SubmitOnEnterDirective]
})
export class SharedModule {}
