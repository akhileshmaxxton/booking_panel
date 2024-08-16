import { TestBed } from '@angular/core/testing';

import { LocalStorageApiService } from './local-storage-api.service';

describe('LocalStorageApiService', () => {
  let service: LocalStorageApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
