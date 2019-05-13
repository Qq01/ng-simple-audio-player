import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AudioService, AudioFile } from '../audio.service';

@Component({
  selector: 'qq-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {

  // private audioFiles:Array<File> = [];
  private audioFiles:Observable<AudioFile[]> = null;

  constructor(public audioService: AudioService) { }

  ngOnInit() {
    this.audioFiles = this.audioService.audioFiles;
  }

  onFileChange = (event) => {
    for (let i = 0; i < event.target.files.length; i++) {
      // this.audioFiles.push(event.target.files[i]);
      this.audioService.addFile(event.target.files[i]);
    }
  }

}
