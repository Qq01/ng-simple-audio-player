import { Component, OnInit } from '@angular/core';
import { AudioService } from '../audio.service';
import { MatSliderChange } from '@angular/material';

@Component({
  selector: 'qq-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss']
})
export class AudioPlayerComponent implements OnInit {

  private time: number;
  private duration: number;

  constructor(public audioService: AudioService) { }

  ngOnInit() {
    this.audioService.playbackData.subscribe((data) => {
      this.time = data.time;
      this.duration = data.duration;
    });
  }

  audioJump(event: MatSliderChange) {
    this.audioService.stop();
    this.audioService.play(event.value);
  }

}
