import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material';

import { AppComponent } from './app.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { AudioFileComponent } from './audio-file/audio-file.component';
import { AudioVisualizerComponent } from './audio-visualizer/audio-visualizer.component';
import { UtilsService } from './utils.service';

@NgModule({
  declarations: [
    AppComponent,
    PlaylistComponent,
    AudioPlayerComponent,
    AudioFileComponent,
    AudioVisualizerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSliderModule
  ],
  providers: [UtilsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
