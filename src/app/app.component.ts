import { Component, computed, effect, inject, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormChildComponent } from './form-child/form-child.component';

export interface ItemForm {
  id: FormControl<number>;
  name: FormControl<string>;
  value: FormControl<number>;
}

export type CustomFormGroup = FormGroup<ItemForm>;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, FormChildComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'angular-form';
  // Formulario anidado con signals
  private readonly _fb = inject(NonNullableFormBuilder);

  form: FormGroup<{ items: FormArray<CustomFormGroup> }> = this._fb.group({
    items: this._fb.array<CustomFormGroup>([]),
  });

  // todos los form group de items
  items = signal(this.form.controls.items.controls);

  // Suma todos los valores de todos los formularios
  totalValue = computed(() => {
    const value = this.items().reduce(
      (total, formGroup) => total + Number(formGroup.controls.value.value),
      0,
    );
    console.log('Computed total value: ', value);
    return value;
  });

  constructor() {
    effect(() => {
      // Cuando ocurra algún cambio en los formgroup actualizo items
      this.form.controls.items.valueChanges.subscribe(() => {
        this.items.set([...this.form.controls.items.controls]);
      });
    });
  }

  addItem() {
    const id = this.items().length + 1;
    const itemForm = this._fb.group<ItemForm>({
      id: this._fb.control(id),
      name: this._fb.control('', { validators: [Validators.required] }),
      value: this._fb.control(0, { validators: [Validators.required] }),
    });

    // Agregando el nuevo form al form array items
    this.form.controls.items.push(itemForm);

    // actualizando la referencia al arreglo de formularios(items)
    // Modificando el valor de la senial
    this.items.set([...this.form.controls.items.controls]);
  }
}
