import { Pipe, PipeTransform } from '@angular/core';
import { RoomAndRoomStayDetails } from '../interface/room-and-room-stay-details';

@Pipe({
  name: 'unique'
})
export class UniquePipe implements PipeTransform {

    transform(value: any[], args: any): any {
        if (!value || !args) {
          return value;
        }
        
        return [...new Set(value.map(item => [item[args], item])).values()];
      }
}
