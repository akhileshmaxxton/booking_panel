import { TestBed } from '@angular/core/testing';

import { RoomDetailsApiService } from './room-details-api.service';

describe('RoomDetailsApiService', () => {
  let service: RoomDetailsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomDetailsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
