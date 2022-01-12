import { Component, Input, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { DishService } from '../services/dish.service';
import { Dish } from '../shared/dish';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
//import { visibility, flyInOut, expand } from '../animations/app.animation';



@Component({
  selector: 'app-dish-detail',
  templateUrl: './dish-detail.component.html',
  styleUrls: ['./dish-detail.component.scss']
})
export class DishDetailComponent implements OnInit {

  dish?: Dish | any;
  dishIds!: String[];
  errMess!: string;
  prev!: String;
  next!: String;

  commentForm!: FormGroup;
  comment?: Comment | any;
  dishcopy?: Dish | any;
  visibility = 'shown';

  formErrors:any = {
    'author': '',
    'comment': ''
  };

  validationMessages:any = {
    'author': {
      'required':      'Author Name is required.',
      'minlength':     'Author Name must be at least 2 characters long.',
      'maxlength':     'Author Name cannot be more than 25 characters long.'
    },
    'comment': {
      'required':      'Comment is required.',
      'minlength':     'Comment must be at least 1 characters long.'
    }
  };

constructor( private dishService: DishService,
               private route: ActivatedRoute,
               private location: Location,
               private fb: FormBuilder,
               @Inject('BaseURL') public BaseURL:any
               ) { 
                this.createForm();
               }

ngOnInit() {
                this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds,
                        errmess => this.errMess = <any>errmess);
                this.route.params.pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
                .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id);});
              
              }
setPrevNext(dishId: number | any) {
                const index = this.dishIds.indexOf(dishId);
                this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
                this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
              }

  goBack(): void {
    this.location.back();
  }

  formatLabel(value: number) {
    if (value >= 1) {
      return Math.round(value);
    }
    return value;
  }

  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      comment: ['', [Validators.required, Validators.minLength(1)] ],
      rating: 5
    });

    this.commentForm.valueChanges
    .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }


  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors ) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.date = new Date().toISOString()
    this.dish?.comments.push(this.comment);
  //  (    errmess: any) => {this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; };
    console.log(this.comment);
    this.comment = null;
    this.commentForm.reset({
      author: '',
      comment: '',
      rating: 5
   });
  }
}


