import { AfterViewInit, Component } from '@angular/core';
import  {gantt} from 'dhtmlx-gantt';

@Component({
  selector: 'app-owner-portal-home',
  templateUrl: './owner-portal-home.component.html',
  styleUrl: './owner-portal-home.component.scss'
})
export class OwnerPortalHomeComponent implements AfterViewInit {

  ngAfterViewInit() {
    gantt.init("gantt_here");

    gantt.parse({
      data: [
        { id: 1, text: "Task #1", start_date: "2024-08-01", duration: 3, progress: 0.6 },
        { id: 2, text: "Task #2", start_date: "2024-08-02", duration: 3, progress: 0.4 }
      ],
      links: []
    });
  }
}
