import { Component, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import { UtilsService } from '../utils.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'qq-audio-visualizer',
  templateUrl: './audio-visualizer.component.html',
  styleUrls: ['./audio-visualizer.component.scss']
})
export class AudioVisualizerComponent implements OnInit, OnDestroy {
  @ViewChild('canvas') canvasRef:ElementRef;

  private animationSubscription: Subscription;
  private canvas:HTMLCanvasElement;
  private ctx:CanvasRenderingContext2D;

  constructor(public utilsService: UtilsService) { }

  ngOnInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d');
    this.animationSubscription = this.utilsService.animationFrame().subscribe(this.render.bind(this));
  }
  ngOnDestroy() {
    this.animationSubscription.unsubscribe();
  }
  // Rendering loop for canvas
  render(time:number) {
    // Clear canvas before drawing
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Displaying time variable so we know that renderer works correctly.
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(time+'', 20, 20);
  }

}
