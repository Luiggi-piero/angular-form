import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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

  get items() {
    return this.form.controls.items;
  }

  // cualquier cambio de form, itemchanges lo tendrá
  itemChanges = toSignal(this.form.valueChanges);

  // Suma todos los valores de todos los formularios
  // si se actualiza itemChanges, totalValue también
  totalValue = computed(() => {
    const value = this.itemChanges()?.items?.reduce(
      (total, item) => total + (Number(item?.value) || 0),
      0,
    );
    return value;
  });

  constructor() {}

  addItem() {
    const id = this.items.length + 1;
    const itemForm = this._fb.group<ItemForm>({
      id: this._fb.control(id),
      name: this._fb.control('', { validators: [Validators.required] }),
      value: this._fb.control(0, { validators: [Validators.required] }),
    });

    // Agregando el nuevo form al form array items
    this.form.controls.items.push(itemForm);
    console.log('********item added: ', itemForm.value);
  }
}
