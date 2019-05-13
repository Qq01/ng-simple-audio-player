import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioFileComponent } from './audio-file.component';

describe('AudioFileComponent', () => {
  let component: AudioFileComponent;
  let fixture: ComponentFixture<AudioFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AudioFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
