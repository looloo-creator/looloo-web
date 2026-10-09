import { AfterViewInit, Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'form[appSubmitOnEnter]',
  standalone: false
})
export class SubmitOnEnterDirective implements AfterViewInit {
  constructor(private readonly formElement: ElementRef<HTMLFormElement>) {}

  ngAfterViewInit(): void {
    window.setTimeout(() => {
      requestAnimationFrame(() => {
        const form = this.formElement.nativeElement;
        if (!form.isConnected) return;

        const firstInput = form.querySelector<HTMLInputElement>(
          'input:not([type="hidden"]):not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([disabled])'
        );

        firstInput?.focus({ preventScroll: true });
      });
    }, 100);
  }

  @HostListener('keydown.enter', ['$event'])
  submitOnEnter(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.disabled) return;

    const nonSubmittingTypes = ['button', 'submit', 'reset', 'file', 'checkbox', 'radio', 'image'];
    if (nonSubmittingTypes.includes(input.type.toLowerCase())) return;

    event.preventDefault();
    this.formElement.nativeElement.requestSubmit();
  }
}
