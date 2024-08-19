import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-planning-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './planning-chart.component.html',
  styleUrl: './planning-chart.component.scss',
})
export class PlanningChartComponent {}
