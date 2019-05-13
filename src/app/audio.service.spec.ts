import { TestBed } from '@angular/core/testing';

import { AudioStackService } from './audio.service';

describe('AudioStackService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AudioStackService = TestBed.get(AudioStackService);
    expect(service).toBeTruthy();
  });
});
