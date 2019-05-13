import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AudioFile, AudioService } from '../audio.service';

@Component({
  selector: 'qq-audio-file',
  templateUrl: './audio-file.component.html',
  styleUrls: ['./audio-file.component.scss']
})
export class AudioFileComponent implements OnInit {
  private file:AudioFile;
  @Input() set audioFile(file:AudioFile) {
    this.name = file.name;
    this.file = file;
  }
  @Input() isActive:boolean = false;
  
  private name:string = '';
  private stateIcon:string = 'pause';
  private showStateIcon:boolean = false;
  private isPlaying = false;

  constructor(public audioService: AudioService) { }

  ngOnInit() {
    this.file.isPlaying.subscribe(isPlaying => {this.isPlaying = isPlaying});
  }
  
  selected() {
      if (!this.isPlaying) {this.audioService.setAudioFile(this.file)};
  }
  remove() {
    this.audioService.removeAudioFile(this.file);
  }
}
