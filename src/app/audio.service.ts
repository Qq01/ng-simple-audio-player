import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { UtilsService } from './utils.service';

export class AudioFile {
  private _file: File;
  private _audioBuffer: AudioBuffer;
  private _audioContext: AudioContext;
  // not sure if we need observable here
  private _isPlayingBS = new BehaviorSubject(false);
  public readonly isPlaying = this._isPlayingBS.asObservable();
  // public isPlaying = false;
  private _isCurrentBS = new BehaviorSubject(false);
  public readonly isCurrent = this._isCurrentBS.asObservable();

  constructor(file:File, audioContext:AudioContext) {
    this._file = file;
    this._audioContext = audioContext;
  }
  get name() {
    return this._file.name;
  }
  getFile() {
    return this._file;
  }
  getAudioBuffer = async () => {
    if (this._audioBuffer == null) {
      let arrayBuffer = await this.readFileAsArrayBuffer(this._file);
      this._audioBuffer = await this._audioContext.decodeAudioData(arrayBuffer);
    }
    return this._audioBuffer;
  }
  readFileAsArrayBuffer(file:File, stateCallback?) {
    const promise : Promise<ArrayBuffer> = new Promise(function(resolve, reject) {
      const fileReader = new FileReader();
      fileReader.onload = function() {
        resolve(fileReader.result as ArrayBuffer);
      };
      fileReader.onerror = function() {
        reject();
      }
      if (stateCallback) {
        fileReader.onprogress = stateCallback;
      }
      fileReader.readAsArrayBuffer(file);
    });
    return promise;
  }
  setIsPlaying(isPlaying) {
    this._isPlayingBS.next(isPlaying);
    // this.isPlaying = isPlaying;
  }
  setIsCurrent(isCurrent) {
    this._isCurrentBS.next(isCurrent);
  }
}

//In simple-audio-player the responsibility for playing file was splitted between components but it only added additional complexity to the app so here we have all-in-one package for audio and components will have only ui related mechanics.
@Injectable({
  providedIn: 'root'
})
export class AudioService {
  //AudioContext can be initialized only on user interaction.
  private audioContext: AudioContext;
  //List of files in playlist
  private _audioFiles = new BehaviorSubject<AudioFile[]>([]);
  public audioFiles = this._audioFiles.asObservable();
  //Current playing file
  private _audioFile = new BehaviorSubject<AudioFile|null>(null);
  public audioFile = this._audioFile.asObservable();

  private playingIndex = -1;
  private isPlayNext = true;
  private isPlayRandom = false;
  private volume = 1;
  private _isPlaying = false;
  private startTime: Number;
  private playbackTime = 0;
  private playbackDataBS = new BehaviorSubject<{time:number,duration:number}>({time:0,duration:0});
  public playbackData = this.playbackDataBS.asObservable();
  //audio nodes
  private analyserNode: AnalyserNode;
  private gainNode: GainNode;
  //buffer for current audio
  private audioBuffer: AudioBuffer;
  private currentSource: AudioBufferSourceNode;

  constructor(public utilsService: UtilsService) {
    let rafPreviousTime = 0;
    let rafDeltaTime = 0;
    //get time is used only to measure difference between updateLoop frames so we can easly fallback to Date.now()
    const getTime = (performance && performance.now) ? () => performance.now() : () => Date.now();
    //We don't have info about when the sound ends playing but we have information about the length of audio and elapsed time in loop.
    const updateLoop = (i) => {
      const time = getTime();
      // const time = performance.now();
      rafDeltaTime = time - rafPreviousTime;
      rafPreviousTime = time;
      if (this._isPlaying) {
        if (this.audioBuffer) {
          this.playbackTime += rafDeltaTime / 1000;
          this.playbackDataBS.next({
            time: this.playbackTime,
            duration: this.audioBuffer.duration
          });
          const rate = Math.min(this.playbackTime / this.audioBuffer.duration, 1);
          if (rate >= 1) {
            this._isPlaying = false;
            this.playbackTime = 0;
            const audioFile = this._audioFile.getValue();
            if (audioFile) {
              audioFile.setIsPlaying(false);
              audioFile.setIsCurrent(false);
            }
            if (this.isPlayNext) {
              if (this.isPlayRandom) {
                this.playRandom();
              } else {
                this.playNext();
              }
            }
          }
        }
      }
    }
    // utilsService.animationFrame().subscribe(updateLoop);
    // Changed from animationFrame to interval so updateLoop should work in background tabs
    interval(100).subscribe(updateLoop);
  }

  //TODO: add ability to add multiple files to reduce the updates.
  //add's file to playlist and convert's it to custom AudioFile for ability to store additional data
  public addFile(file:File):void {
    // Adding audio file is user generated event so we can safely create AudioContext for our application
    this.attachAudioContext();
    const audioFile = new AudioFile(file, this.audioContext);
    const audioFiles = this._audioFiles.getValue();
    audioFiles.push(audioFile);
    this._audioFiles.next(audioFiles);
  }
  // public removeAudioFile(fileName:string):void {
  //   const audioFiles = this._audioFiles.getValue();
  //   const index = audioFiles.findIndex(function(af:AudioFile) {
  //     return af.name == fileName;
  //   });
  //   if (index > -1) {
  //     audioFiles.splice(index, 1);
  //     this._audioFiles.next(audioFiles);
  //   }
  // }
  public removeAudioFile(file:AudioFile):void {
    const audioFiles = this._audioFiles.getValue();
    const index = audioFiles.findIndex(function(af:AudioFile) {
      return af == file;
    });
    if (index > -1) {
      audioFiles.splice(index, 1);
      this._audioFiles.next(audioFiles);
    }
  }
  private attachAudioContext() {
    if (this.audioContext == null) {
      this.audioContext = new AudioContext();
      this.analyserNode = this.audioContext.createAnalyser();
      this.gainNode = this.audioContext.createGain();
      this.analyserNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
    }
  }
  public play(time = 0) {
    if (this.audioBuffer == null) {
      if (this.isPlayRandom) {
        this.playRandom();
      } else {
        this.playNext();
      }
    }
    let audioFile = this._audioFile.getValue();
    if (audioFile) {
      audioFile.setIsPlaying(true);
    }
    // Was on older verion, here is propably not required, but i leaved it just in case.
    // this.attachAudioContext();
    if (this.audioContext.state == 'suspended') {
      this.audioContext.resume();
    }
    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;
    source.connect(this.analyserNode);
    source.start(0, time);
    this.playbackTime = time;
    this.currentSource = source;
    // API doesn't provide mechanism to know the current position within audio track so we need to do it manualy.
    // this.startTime = Date.now();
    this._isPlaying = true;
  }
  private playRandom() {
    const audioFiles = this._audioFiles.getValue();
    if (audioFiles.length == 0) {
      return; // no file to play
    } else if (audioFiles.length == 1) {
      this.setAudioFile(audioFiles[0]);
    }
    let index = Math.round(Math.random() * audioFiles.length - 1);
    this.playingIndex = index;
    const audioFile = audioFiles[index];
    this._setAudioFile(audioFile);
  }
  private playNext() {
    const audioFiles = this._audioFiles.getValue();
    if (audioFiles.length == 0) {
      return;
    } else if (audioFiles.length == 1) {
      this._setAudioFile(audioFiles[0]);
      return;
    }
    let index = this.playingIndex + 1;
    if (index >= audioFiles.length) {
      index = 0;
    }
    this._setAudioFile(audioFiles[index]);
  };
  public stop() {
    this.playbackTime = 0;
    this.pause();
  }
  public pause() {
    this._isPlaying = false;
    this._audioFile.getValue().setIsPlaying(false);
    if (this.currentSource) {
      this.currentSource.stop(0);
    }
  }
  public setVolume(volume) {
    this.volume = volume;
  }
  public getVolume() {
    return this.volume;
  }
  public isPlaying() {
    return this._isPlaying;
  }
  // Expose Analysre for the rest of application
  public getAnalyser() {
    return this.analyserNode;
  }
  public setAudioFile(audioFile) {
    const audioFiles = this._audioFiles.getValue();
    const index = audioFiles.findIndex(af => audioFile == af);
    if (index > -1) {
      this.playingIndex = index;
    } else {
      console.log('cannot find index of audioFile in audioFiles for', audioFile, audioFiles);
    }
    this._setAudioFile(audioFile);
  }
  private _setAudioFile = (audioFile:AudioFile) => {
    let previousFile = this._audioFile.getValue();
    if (previousFile) {
      previousFile.setIsCurrent(false);
    }
    audioFile.setIsCurrent(true);
    if (this._isPlaying) {
      this.stop();
    }
    this._audioFile.next(audioFile);
    audioFile.getAudioBuffer().then(audioBuffer => {
      this.audioBuffer = audioBuffer;
      this.play();
    });
  }
}
