import { Component, effect, forwardRef, input } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-custom-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.scss',
  /**
   * Esto le dice a Angular:
  ✅ Cuando alguien use formularios reactivos, usa este 
  componente como si fuera un campo de formulario.
  Es decir:
  👉 Tu CustomInputComponent podrá funcionar con:
    - formControl
    - formControlName
    - ngModel
    - validaciones
    - cambios de valor del formulario
    Sin esto, Angular no sabría cómo conectar tu componente con el formulario.
    Permite que el componente CustomInputComponent se comporte como un input/acceso mas del formulario
    otros control accessor son: select, checkbox, select
   */
  providers: [
    {
      provide: NG_VALUE_ACCESSOR, //
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true,
    },
  ],
})
export class CustomInputComponent implements ControlValueAccessor {
  control = input.required<FormControl<any>>();

  onTouched = () => {};
  onChange = (_value: any) => {};

  constructor() {
    //  effect : corre al inicio y cuando cambia cualquier signal leído dentro.
    effect(() => {
      const currentSignalValue = this.control().value;

      if (this.control().dirty || this.control().touched) {
        const newValue = this.control().value;

        if (newValue !== currentSignalValue) {
          this.onChange(newValue);
        }
      }
    });
  }

  // - cambio del mismo angular(ts -> html)
  // - al ser un cambio interno(por ts, no del usuario)
  // angular ya sabe del cambio -> no debes emitir eventos
  writeValue(value: any) {
    if (value != this.control().value) {
      // { emitEvent: false }  : Actualiza el valor del control, pero no notifiques cambios (valueChanges, statusChanges, etc.)
      //  si no lo usas genera un loop infinito
      this.control().setValue(value, { emitEvent: false });
    }
  }

  // Cambio del usuario(html/ui -> ts)
  // Detecta cambio de valor.
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Cambio del usuario(html/ui -> ts)
  // Al desenfocar
  // Detecta interacción (aunque no cambie el valor).
  // Suele llamarse en blur (cuando el usuario entra y sale del campo).
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Sirve para habilitar o deshabilitar el control desde el formulario.
  // Angular lo llama cuando el FormControl cambia su estado disabled.
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.control().disable : this.control().enable;
  }
}
